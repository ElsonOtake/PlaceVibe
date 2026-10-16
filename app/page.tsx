// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Real-time Subscriptions when authorized
  useEffect(() => {
    if (!user || !isAuthorized) {
      return;
    }

    // Subscribe to family configuration
    const unsubConfig = subscribeToFamilyConfig(
      (cfg) => {
        setFamilyConfig(cfg);
      },
      (err) => {
        console.error('Failed to load family config:', err);
      }
    );

    // Subscribe to places
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
      unsubConfig();
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
      showToast('Signed in successfully!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setPlaces([]);
      showToast('Signed out');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Sign out failed');
    }
  };

  // Save or Update Entry
  const handleSaveEntry = async (
    entryData: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (!user) {
      showToast('Please sign in to save visits');
      return;
    }

    try {
      if (existingId) {
        await updatePlaceDoc(existingId, entryData, effectiveAllowedEmails);
        showToast(`Updated "${entryData.name}"`);
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
        showToast(`Logged new visit to "${entryData.name}"`);
      }
      setIsFormOpen(false);
      setEditingPlace(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save visit');
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
      showToast(`Deleted "${deleteTarget.name}"`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete entry');
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
      showToast('Seeded 5 curated sample spots with Google Maps coordinates!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to seed sample spots');
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Auth State Handling */}
          {!authLoading && !user && (
            <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div className="max-w-xl mx-auto space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Every Visited Spot
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cloud persistence enabled via Firestore with Google Maps location intelligence. Sign in with your Google account ({PRIMARY_OWNER_EMAIL} or your wife&apos;s email) to access, log, and sync your favorite spots in real time.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            </div>
          )}

          {/* Signed in but NOT authorized */}
          {!authLoading && user && !isAuthorized && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Access Restricted
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You are signed in as <span className="font-mono font-semibold text-slate-900">{user.email}</span>. This journal is private for <span className="font-semibold text-slate-900">{PRIMARY_OWNER_EMAIL}</span> and his wife.
                </p>
                <p className="text-xs text-slate-500">
                  If you are Elson&apos;s wife, ask Elson to open &ldquo;Family Access&rdquo; and add your email address ({user.email}) to the allowed access list.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Sign Out / Switch Account
                </button>
              </div>
            </div>
          )}

          {/* Authorized User View */}
          {isAuthorized && (
            <>
              {/* Hero Section */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                        <Coffee className="w-3.5 h-3.5 text-amber-600" />
                        <span>Family Spot &amp; Visit Journal</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Google Maps Intelligence</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                        <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live Cloud Database</span>
                      </div>

                      {familyConfig?.wifeEmail && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>Shared with {familyConfig.wifeEmail}</span>
                        </div>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                      Every Visited Spot
                    </h1>
                    <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      Synced in real time across devices. Search any spot on Google Maps to pre-fill addresses, categories, and ratings, rate the personal vibe, and map your shared favorite places.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingPlace(null);
                        setIsFormOpen(true);
                      }}
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Log New Visit</span>
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
                      Your cloud journal is currently empty
                    </h3>
                    <p className="text-xs text-slate-600">
                      Would you like to populate 5 curated starter spots (Blue Bottle Coffee, Livraria Cultura, Osteria Stella, etc.) with coordinates on Google Maps?
                    </p>
                  </div>
                  <button
                    onClick={handleSeedSamplePlaces}
                    disabled={isSeeding}
                    className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                    <span>{isSeeding ? 'Loading Spots...' : 'Populate 5 Starter Spots'}</span>
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
                      Visits (
                      <span className="font-mono tabular-nums text-slate-700">
                        {filteredPlaces.length}
                      </span>
                      )
                    </h2>

                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                      >
                        Show all {places.length} spots
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
                      <span>Grid View</span>
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
                      <span>Map View</span>
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
                        ? 'No spots recorded yet'
                        : 'No matching places found'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      {places.length === 0
                        ? 'Log a cafe, restaurant, or bookstore visit with Google Maps to start building your shared journal.'
                        : 'Try adjusting your search terms or clearing the selected filters.'}
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
              Every Visited Spot — Private Cloud Journal for Elson &amp; Wife. Stored securely in Firestore with Google Maps location intelligence.
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
        <FamilySharingModal
          isOpen={isFamilySharingOpen}
          onClose={() => setIsFamilySharingOpen(false)}
          config={familyConfig}
          currentUserEmail={userEmail}
          onSuccessToast={showToast}
        />

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
