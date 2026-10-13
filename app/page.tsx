'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import {
  PlaceEntry,
  SortOption,
  INITIAL_MOCK_ENTRIES,
} from '@/types/place';
import { placesStore } from '@/lib/storage';
import { Header } from '@/components/Header';
import { StatsSummary } from '@/components/StatsSummary';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceFormModal } from '@/components/PlaceFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ExportModal } from '@/components/ExportModal';
import { Plus, Coffee, Sparkles } from 'lucide-react';

export default function HomePage() {
  const places = useSyncExternalStore(
    placesStore.subscribe,
    placesStore.getSnapshot,
    placesStore.getServerSnapshot
  );

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

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // User feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Save or Update Entry
  const handleSaveEntry = (
    entryData: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = Date.now();
    if (existingId) {
      // Update
      const updated = places.map((p) =>
        p.id === existingId
          ? {
              ...p,
              ...entryData,
              updatedAt: now,
            }
          : p
      );
      placesStore.savePlaces(updated);
      showToast(`Updated "${entryData.name}"`);
    } else {
      // Create new
      const newEntry: PlaceEntry = {
        id: `pv-${now}-${Math.random().toString(36).substr(2, 5)}`,
        ...entryData,
        createdAt: now,
        updatedAt: now,
      };
      placesStore.savePlaces([newEntry, ...places]);
      showToast(`Logged new visit to "${entryData.name}"`);
    }
    setIsFormOpen(false);
    setEditingPlace(null);
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
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const filtered = places.filter((p) => p.id !== deleteTarget.id);
    placesStore.savePlaces(filtered);
    showToast(`Deleted "${deleteTarget.name}"`);
    setDeleteTarget(null);
  };

  // Reset to sample entries
  const handleResetToSample = () => {
    placesStore.savePlaces(INITIAL_MOCK_ENTRIES);
    showToast('Reset to default sample entries');
  };

  // Import JSON entries
  const handleImport = (imported: PlaceEntry[]) => {
    placesStore.savePlaces(imported);
    showToast(`Restored ${imported.length} visits from backup`);
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
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Would return filter
      if (selectedReturnFilter === 'return-yes' && !p.wouldReturn) return false;
      if (selectedReturnFilter === 'return-no' && p.wouldReturn) return false;

      // Live search query
      if (query) {
        const matchName = (p.name || '').toLowerCase().includes(query);
        const matchLoc = (p.location || '').toLowerCase().includes(query);
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

    // Sorting
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
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        onNewVisit={() => {
          setEditingPlace(null);
          setIsFormOpen(true);
        }}
        onOpenExport={() => setIsExportOpen(true)}
        totalSpots={places.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-2 border border-amber-200/60">
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                <span>Personal Spot & Cafe Journal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Remember Every Spot You Visit
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Log coffees, bookstores, restaurants, and bars. Record honest pros and cons so you never wonder whether that corner spot had good Wi-Fi or loud music.
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

        {/* Places Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Journal Entries (
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

          {/* Cards Grid */}
          {filteredPlaces.length > 0 ? (
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
                {places.length === 0 ? 'No spots recorded yet' : 'No matching places found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {places.length === 0
                  ? 'Start by logging your favorite coffee shop, local bookstore, or cozy restaurant.'
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
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            PlaceVibe — Personal Spot & Cafe Tracker. Stored in your local browser memory.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Export HTML Bundle
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={handleResetToSample}
              className="hover:text-slate-900 transition-colors text-slate-400 cursor-pointer"
            >
              Restore Sample Spots
            </button>
          </div>
        </div>
      </footer>

      {/* Form Modal (Add / Edit) */}
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
        places={places}
        onImport={handleImport}
        onResetToSample={handleResetToSample}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
