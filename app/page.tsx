// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithPopup, signOut, googleProvider } from '@/lib/firebase';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google-maps-utils';
import {
  PlaceEntry,
  SortOption,
  FamilyConfig,
  INITIAL_MOCK_ENTRIES,
} from '@/types/place';
import {
  PRIMARY_OWNER_EMAIL,
  subscribeToPlaces,
  subscribeToFamilyConfig,
  createPlaceDoc,
  updatePlaceDoc,
  deletePlaceDoc,
  seedInitialFirestorePlaces,
} from '@/lib/firestore-service';
import { Header } from '@/components/Header';
import { StatsSummary } from '@/components/StatsSummary';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceFormModal } from '@/components/PlaceFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ExportModal } from '@/components/ExportModal';
import { FamilySharingModal } from '@/components/FamilySharingModal';
import { SpotsMapView } from '@/components/SpotsMapView';
import { useLanguage } from '@/lib/i18n';
import {
  Plus,
  Coffee,
  Sparkles,
  ShieldAlert,
  LogIn,
  Heart,
  CloudCheck,
  RefreshCw,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Firestore Places & Family Config
  const [places, setPlaces] = useState<PlaceEntry[]>([]);
  const [familyConfig, setFamilyConfig] = useState<FamilyConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // View Mode: Grid Journal vs Interactive Google Map
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filters and Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedReturnFilter, setSelectedReturnFilter] = useState<
    'all' | 'return-yes' | 'return-no'
  >('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(
    null
  );
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFamilySharingOpen, setIsFamilySharingOpen] = useState(false);

  // User feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setFamilyConfig(null);
        setPlaces([]);
        setIsConfigLoaded(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute Authorization
  const userEmail = user?.email?.toLowerCase() || '';
  const isOwner = userEmail === PRIMARY_OWNER_EMAIL.toLowerCase();
  const isWife =
    !!familyConfig?.wifeEmail && userEmail === familyConfig.wifeEmail.toLowerCase();
  const isWhitelisted =
    !!familyConfig?.allowedEmails &&
    familyConfig.allowedEmails.some((e) => e.toLowerCase() === userEmail);

  // If user is owner or listed in allowed family emails
  const isAuthorized = user !== null && (isOwner || isWife || isWhitelisted);

  // 1. Subscribe to family configuration for ANY authenticated user
  // This allows family members to receive the config and unlock authorization!
  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubConfig = subscribeToFamilyConfig(
      (cfg) => {
        setFamilyConfig(cfg);
        setIsConfigLoaded(true);
      },
      (err) => {
        console.warn('Could not load family config:', err);
        setIsConfigLoaded(true);
      }
    );

    return () => {
      unsubConfig();
    };
  }, [user]);

  // 2. Subscribe to places only when the user is authorized
  useEffect(() => {
    if (!user || !isAuthorized) {
      return;
    }

    const unsubPlaces = subscribeToPlaces(
      (remotePlaces) => {
        setPlaces(remotePlaces);
        setIsSyncing(false);
      },
      (err) => {
        console.error('Failed to load places:', err);
        setIsSyncing(false);
      }
    );

    return () => {
      unsubPlaces();
    };
  }, [user, isAuthorized]);

  // Allowed Emails List for document-level security
  const effectiveAllowedEmails = useMemo(() => {
    const set = new Set<string>([PRIMARY_OWNER_EMAIL.toLowerCase()]);
    if (familyConfig?.wifeEmail) set.add(familyConfig.wifeEmail.toLowerCase());
    if (familyConfig?.allowedEmails) {
      familyConfig.allowedEmails.forEach((e) => set.add(e.toLowerCase()));
    }
    if (userEmail) set.add(userEmail);
    return Array.from(set);
  }, [familyConfig, userEmail]);

  // Sign In / Out handlers
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast(t.toastSignedIn);
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      let message = t.toastSignInFailed;
      if (err instanceof Error) {
        if (err.message.includes('popup-blocked')) {
          message = t.toastPopupBlocked;
        } else if (err.message.includes('popup-closed-by-user')) {
          message = t.toastPopupClosed;
        } else {
          message = err.message;
        }
      }
      showToast(message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setPlaces([]);
      setIsConfigLoaded(false);
      showToast(t.toastSignedOut);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t.toastSignInFailed);
    }
  };

  // Save or Update Entry Concurrency Locks & Deduplication
  const isSavingEntryRef = useRef(false);
  const lastSavedEntryRef = useRef<{ name: string; date: string; time: number }>({
    name: '',
    date: '',
    time: 0,
  });

  const handleSaveEntry = async (
    entryData: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (!user) {
      showToast(
        language === 'pt-BR'
          ? 'Por favor, conecte-se para salvar visitas'
          : 'Please sign in to save visits'
      );
      return;
    }

    // 1. Concurrency lock: prevent duplicate concurrent calls
    if (isSavingEntryRef.current) {
      console.warn('Save already in progress, ignoring duplicate trigger');
      return;
    }

    // 2. Debounce/Idempotency check: prevent duplicate rapid creation of identical spot
    const now = Date.now();
    const cleanName = entryData.name.trim().toLowerCase();
    if (
      !existingId &&
      lastSavedEntryRef.current.name === cleanName &&
      lastSavedEntryRef.current.date === entryData.dateVisited &&
      now - lastSavedEntryRef.current.time < 5000
    ) {
      console.warn('Prevented duplicate spot creation within 5s:', entryData.name);
      setIsFormOpen(false);
      setEditingPlace(null);
      return;
    }

    isSavingEntryRef.current = true;
    lastSavedEntryRef.current = {
      name: cleanName,
      date: entryData.dateVisited,
      time: now,
    };

    try {
      if (existingId) {
        await updatePlaceDoc(existingId, entryData, effectiveAllowedEmails);
        showToast(t.toastUpdated(entryData.name));
      } else {
        await createPlaceDoc(
          entryData,
          {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || undefined,
          },
          effectiveAllowedEmails
        );
        showToast(t.toastLogged(entryData.name));
      }
      setIsFormOpen(false);
      setEditingPlace(null);
    } catch (err: unknown) {
      // Reset cache on error so user can retry
      lastSavedEntryRef.current = { name: '', date: '', time: 0 };
      showToast(
        err instanceof Error
          ? err.message
          : language === 'pt-BR'
          ? 'Falha ao salvar visita'
          : 'Failed to save visit'
      );
    } finally {
      isSavingEntryRef.current = false;
    }
  };

  // Duplicate an existing place to log another visit
  const handleDuplicate = (place: PlaceEntry) => {
    const today = new Date().toISOString().slice(0, 10);
    setEditingPlace({
      ...place,
      id: '', // Empty ID tells form this is a new entry
      dateVisited: today,
      notes: '',
    });
    setIsFormOpen(true);
  };

  // Delete Entry
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePlaceDoc(deleteTarget.id);
      showToast(t.toastDeleted(deleteTarget.name));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : (language === 'pt-BR' ? 'Falha ao excluir visita' : 'Failed to delete entry'));
    } finally {
      setDeleteTarget(null);
    }
  };

  // Seed sample places into Firestore
  const handleSeedSamplePlaces = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedInitialFirestorePlaces(
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
        },
          effectiveAllowedEmails
      );
      showToast(t.toastSeeded);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : (language === 'pt-BR' ? 'Falha ao carregar lugares de exemplo' : 'Failed to seed sample spots'));
    } finally {
      setIsSeeding(false);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    places.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [places]);

  // Filtered and sorted places
  const filteredPlaces = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = places.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedReturnFilter === 'return-yes' && !p.wouldReturn) return false;
      if (selectedReturnFilter === 'return-no' && p.wouldReturn) return false;

      if (query) {
        const matchName = (p.name || '').toLowerCase().includes(query);
        const matchLoc = (p.location || '').toLowerCase().includes(query);
        const matchAddress = (p.formattedAddress || '').toLowerCase().includes(query);
        const matchNotes = (p.notes || '').toLowerCase().includes(query);
        const matchCategory = (p.category || '').toLowerCase().includes(query);
        const matchPros = (p.pros || []).some((item) =>
          item.toLowerCase().includes(query)
        );
        const matchCons = (p.cons || []).some((item) =>
          item.toLowerCase().includes(query)
        );

        if (
          !matchName &&
          !matchLoc &&
          !matchAddress &&
          !matchNotes &&
          !matchCategory &&
          !matchPros &&
          !matchCons
        ) {
          return false;
        }
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.dateVisited).getTime() - new Date(a.dateVisited).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.dateVisited).getTime() - new Date(b.dateVisited).getTime();
      }
      if (sortBy === 'rating-desc') {
        return b.rating - a.rating;
      }
      if (sortBy === 'rating-asc') {
        return a.rating - b.rating;
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return filtered;
  }, [places, selectedCategory, selectedReturnFilter, searchQuery, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedReturnFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedReturnFilter('all');
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'marker']}>
      <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
        {/* Top Header */}
        <Header
          user={user}
          isAuthorized={isAuthorized}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onOpenFamilySharing={() => setIsFamilySharingOpen(true)}
          onNewVisit={() => {
            setEditingPlace(null);
            setIsFormOpen(true);
          }}
          onOpenExport={() => setIsExportOpen(true)}
          totalSpots={places.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
          {/* Auth State Handling */}
          {!authLoading && !user && (
            <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-200/80 rounded-2xl p-5 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div className="max-w-xl mx-auto space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t.signInHeadline}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.signInDesc(PRIMARY_OWNER_EMAIL)}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.signInGoogle}</span>
                </button>
              </div>
            </div>
          )}

          {/* Signed in but checking family authorization */}
          {!authLoading && user && !isAuthorized && !isConfigLoaded && !isOwner && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-3 max-w-md mx-auto shadow-sm">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-amber-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-800">{t.verifyingPermissions}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
            </div>
          )}

          {/* Signed in and checked, but NOT authorized */}
          {!authLoading && user && !isAuthorized && (isConfigLoaded || isOwner) && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 sm:p-8 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t.accessRestricted}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.signedInAs} <span className="font-mono font-semibold text-slate-900">{user.email}</span>. {t.privateJournalNotice(PRIMARY_OWNER_EMAIL)}
                </p>
                <p className="text-xs text-slate-500">
                  {t.askOwnerNotice(user.email || '')}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (user.email) {
                      navigator.clipboard.writeText(user.email);
                      showToast(t.copiedEmail(user.email));
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  {t.copyMyEmail}
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-100/60 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  {t.switchAccount}
                </button>
              </div>
            </div>
          )}

          {/* Authorized User View */}
          {isAuthorized && (
            <>
              {/* Hero Section */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Badge Chips */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-amber-800 bg-amber-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-amber-200/60">
                        <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">{t.badgeJournalFull}</span>
                        <span className="sm:hidden">{t.badgeJournalShort}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-blue-800 bg-blue-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-blue-200/60">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">{t.badgeMapsFull}</span>
                        <span className="sm:hidden">{t.badgeMapsShort}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-emerald-800 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-emerald-200/60">
                        <CloudCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">{t.badgeCloudFull}</span>
                        <span className="sm:hidden">{t.badgeCloudShort}</span>
                      </div>

                      {familyConfig?.wifeEmail && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>{t.sharedWith(familyConfig.wifeEmail)}</span>
                        </div>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {t.heroHeadline}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      {t.heroSubtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={() => {
                        setEditingPlace(null);
                        setIsFormOpen(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.logNewVisit}</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Strip */}
                <StatsSummary places={places} />
              </section>

              {/* Empty Database Prompt / Seed Option */}
              {places.length === 0 && !isSyncing && (
                <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-900">
                      {t.emptyJournalTitle}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {t.emptyJournalDesc}
                    </p>
                  </div>
                  <button
                    onClick={handleSeedSamplePlaces}
                    disabled={isSeeding}
                    className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                    <span>{isSeeding ? t.seeding : t.populateStarterSpots}</span>
                  </button>
                </div>
              )}

              {/* Search & Filters Strip */}
              <section>
                <SearchAndFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedReturnFilter={selectedReturnFilter}
                  onReturnFilterChange={setSelectedReturnFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  categoryCounts={categoryCounts}
                  totalCount={places.length}
                  onResetFilters={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </section>

              {/* Places Section Header with View Mode Switcher */}
              <section className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {t.visitsTitle(filteredPlaces.length)}
                    </h2>

                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                      >
                        {t.showAllSpots(places.length)}
                      </button>
                    )}
                  </div>

                  {/* View Mode Switcher: Grid vs Map */}
                  <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{t.gridView}</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        viewMode === 'map'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>{t.mapView}</span>
                    </button>
                  </div>
                </div>

                {/* View Content: Interactive Map vs Responsive Grid */}
                {viewMode === 'map' ? (
                  <SpotsMapView
                    places={filteredPlaces}
                    onEditPlace={(p) => {
                      setEditingPlace(p);
                      setIsFormOpen(true);
                    }}
                    selectedCategory={selectedCategory}
                  />
                ) : filteredPlaces.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlaces.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        onEdit={(p) => {
                          setEditingPlace(p);
                          setIsFormOpen(true);
                        }}
                        onDelete={(id, name) => {
                          setDeleteTarget({ id, name });
                        }}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {places.length === 0
                        ? t.noSpotsYet
                        : t.noMatchingSpots}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      {places.length === 0
                        ? t.logFirstSpot
                        : (language === 'pt-BR'
                            ? 'Tente ajustar os termos de busca ou limpar os filtros selecionados.'
                            : 'Try adjusting your search terms or clearing the selected filters.')}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {hasActiveFilters ? (
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPlace(null);
                            setIsFormOpen(true);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Log Your First Spot
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              Every Visited Spot — Private Cloud Journal for Elson &amp; Family. Stored securely in Firestore with Google Maps location intelligence.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFamilySharingOpen(true)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Family Access Settings
              </button>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <button
                onClick={() => setIsExportOpen(true)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Export HTML Bundle
              </button>
            </div>
          </div>
        </footer>

        {/* Form Modal (Add / Edit) with Google Maps Places Autocomplete */}
        <PlaceFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPlace(null);
          }}
          onSave={handleSaveEntry}
          initialData={editingPlace}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          placeName={deleteTarget?.name || ''}
        />

        {/* Export / Standalone HTML Modal */}
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          places={places.length > 0 ? places : INITIAL_MOCK_ENTRIES}
          onImport={(imported) => {
            if (!user) return;
            imported.forEach((item) => {
              createPlaceDoc(
                item,
                { uid: user.uid, email: user.email || '' },
                effectiveAllowedEmails
              );
            });
            showToast(`Imported ${imported.length} spots to cloud database`);
          }}
          onResetToSample={handleSeedSamplePlaces}
        />

        {/* Family Sharing Modal */}
        {isFamilySharingOpen && (
          <FamilySharingModal
            key={`${isFamilySharingOpen}-${familyConfig?.wifeEmail || ''}-${familyConfig?.updatedAt || 0}`}
            isOpen={isFamilySharingOpen}
            onClose={() => setIsFamilySharingOpen(false)}
            config={familyConfig}
            currentUserEmail={userEmail}
            onSuccessToast={showToast}
          />
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </APIProvider>
  );
}
