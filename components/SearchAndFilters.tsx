'use client';

import React from 'react';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { PLACE_CATEGORIES, PlaceCategory, SortOption } from '@/types/place';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedReturnFilter: 'all' | 'return-yes' | 'return-no';
  onReturnFilterChange: (val: 'all' | 'return-yes' | 'return-no') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedReturnFilter,
  onReturnFilterChange,
  sortBy,
  onSortChange,
  categoryCounts,
  totalCount,
  onResetFilters,
  hasActiveFilters,
}: SearchAndFiltersProps) {
  const allCategories = ['All', ...PLACE_CATEGORIES];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        {/* Live Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search spot name, neighborhood, pros, cons, or notes..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters & Sort Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Recommendation Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedReturnFilter}
              onChange={(e) =>
                onReturnFilterChange(
                  e.target.value as 'all' | 'return-yes' | 'return-no'
                )
              }
              className="bg-transparent text-slate-800 font-semibold focus:outline-none text-xs cursor-pointer py-1"
            >
              <option value="all">All Experiences</option>
              <option value="return-yes">Would Return Only</option>
              <option value="return-no">Won&apos;t Return Only</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none text-xs cursor-pointer py-1"
            >
              <option value="date-desc">Most Recent</option>
              <option value="date-asc">Oldest Visit</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
              <option value="name-desc">Alphabetical (Z-A)</option>
            </select>
          </div>

          {/* Clear Filter button if active */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'All' ? totalCount : categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
