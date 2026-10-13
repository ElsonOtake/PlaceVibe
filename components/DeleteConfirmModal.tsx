'use client';

import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <Trash2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Delete this entry?</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Are you sure you want to remove <span className="font-semibold text-slate-800">&ldquo;{placeName}&rdquo;</span> from your visit journal? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
          >
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  );
}
