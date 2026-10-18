'use client';

import React from 'react';
import { Plus, Download, Compass, LogIn, LogOut, Heart, Globe } from 'lucide-react';
import type { User } from 'firebase/auth';
import { useLanguage } from '@/lib/i18n';

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
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-sm xs:text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap truncate">
              {t.brandTitle}
            </span>
            <span className="hidden md:inline-block text-xs text-slate-500 border-l border-slate-200 pl-2 whitespace-nowrap">
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Selector (EN / PT-BR) */}
          <div
            className="flex items-center rounded-lg border border-slate-200 bg-slate-100/90 p-0.5 text-xs font-semibold shrink-0"
            role="group"
            aria-label={t.languageSelectLabel}
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={t.english}
              aria-pressed={language === 'en'}
            >
              <span className="text-xs" aria-hidden="true">🇺🇸</span>
              <span className="text-[11px]">EN</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('pt-BR')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                language === 'pt-BR'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={t.portuguese}
              aria-pressed={language === 'pt-BR'}
            >
              <span className="text-xs" aria-hidden="true">🇧🇷</span>
              <span className="text-[11px]">PT</span>
            </button>
          </div>

          {user ? (
            <>
              {/* Family Sharing Button */}
              <button
                onClick={onOpenFamilySharing}
                className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                title={`${t.familyAccess} (Elson & Family)`}
                aria-label={t.familyAccess}
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span className="hidden md:inline">{t.familyAccess}</span>
              </button>

              {/* Export Button */}
              <button
                onClick={onOpenExport}
                className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                title={t.export}
                aria-label={t.export}
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">{t.export}</span>
              </button>

              {/* Log Visit Button (only if authorized) */}
              {isAuthorized && (
                <button
                  onClick={onNewVisit}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
                  title={t.logVisit}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t.logVisit}</span>
                </button>
              )}

              {/* User Profile Pill & Sign Out */}
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200 shrink-0">
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
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title={t.signOut}
                  aria-label={t.signOut}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onOpenExport}
                className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                aria-label={t.export}
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">{t.export}</span>
              </button>

              <button
                onClick={onSignIn}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.signIn}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
