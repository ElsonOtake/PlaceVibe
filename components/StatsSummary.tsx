'use client';

import React from 'react';
import { PlaceEntry } from '@/types/place';
import { Star, MapPin, Layers, HeartHandshake } from 'lucide-react';

interface StatsSummaryProps {
  places: PlaceEntry[];
}

export function StatsSummary({ places }: StatsSummaryProps) {
  const total = places.length;

  // Top Rated Spot
  const topSpot = places.length > 0
    ? [...places].sort((a, b) => b.rating - a.rating)[0]
    : null;

  // Most Frequent Category
  const categoryCounts: Record<string, number> = {};
  places.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  let topCategory = '—';
  let topCategoryCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > topCategoryCount) {
      topCategoryCount = count;
      topCategory = cat;
    }
  });

  // Return Rate
  const returnCount = places.filter((p) => p.wouldReturn).length;
  const returnRate = total > 0 ? Math.round((returnCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Places Visited */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Places Visited</span>
          <MapPin className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {total}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {total === 1 ? '1 spot recorded' : `${total} spots recorded`}
          </div>
        </div>
      </div>

      {/* Top-Rated Spot */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Top-Rated Spot</span>
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div className="mt-2">
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate" title={topSpot?.name || '—'}>
            {topSpot ? topSpot.name : '—'}
          </div>
          <div className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
            {topSpot ? (
              <>
                <span>★ {topSpot.rating}.0</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-slate-500 font-normal">{topSpot.category}</span>
              </>
            ) : (
              <span className="text-slate-400 font-normal">No ratings yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Most Frequent Category */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Top Category</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2">
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {topCategory}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {topCategoryCount > 0 ? `${topCategoryCount} visits logged` : 'No spots yet'}
          </div>
        </div>
      </div>

      {/* Return Rate */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Return Rate</span>
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
            {returnRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {returnCount} of {total} spots recommended
          </div>
        </div>
      </div>
    </div>
  );
}
