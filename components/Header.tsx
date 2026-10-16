'use client';

import React from 'react';
import { Plus, Download, Compass, LogIn, LogOut, Users, Heart } from 'lucide-react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  isAuthorized: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenFamilySharing: () => void;
  onNewVisit: () => void;
  onOpenExport: () => void;
  totalSpots: number;
}

export function Header({
  user,
  isAuthorized,
  onSignIn,
  onSignOut,
  onOpenFamilySharing,
  onNewVisit,
  onOpenExport,
  totalSpots,
}: HeaderProps) {
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
              Every Visited Spot
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-500 border-l border-slate-200 pl-2">
              Family Spot & Visit Journal
            </span>
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Family Sharing Button */}
              <button
                onClick={onOpenFamilySharing}
                className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Manage family access (Elson & Wife)"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span className="hidden md:inline">Family Access</span>
              </button>

              {/* Export Button */}
              <button
                onClick={onOpenExport}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Export HTML or backup data"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Log Visit Button (only if authorized) */}
              {isAuthorized && (
                <button
                  onClick={onNewVisit}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Visit</span>
                </button>
              )}

              {/* User Profile Pill & Sign Out */}
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                <div
                  className="hidden lg:flex flex-col items-end text-[11px] leading-tight"
                  title={user.email || ''}
                >
                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onOpenExport}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={onSignIn}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
