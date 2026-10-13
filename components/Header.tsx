'use client';

import React from 'react';
import { Plus, Download, Compass } from 'lucide-react';

interface HeaderProps {
  onNewVisit: () => void;
  onOpenExport: () => void;
  totalSpots: number;
}

export function Header({ onNewVisit, onOpenExport, totalSpots }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              PlaceVibe
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-500 border-l border-slate-200 pl-2">
              Personal Spot & Cafe Journal
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenExport}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export HTML or backup data"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export & Backup</span>
            <span className="sm:hidden">Export</span>
          </button>

          <button
            onClick={onNewVisit}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Visit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
