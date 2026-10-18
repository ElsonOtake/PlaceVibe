'use client';

import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  placeName: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  placeName,
}: DeleteConfirmModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <Trash2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">{t.deleteTitle}</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {t.deleteDesc(placeName)}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
          >
            {t.deleteConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
