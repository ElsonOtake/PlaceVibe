'use client';

import React, { useState } from 'react';
import { PlaceEntry } from '@/types/place';
import { generateStandaloneHtml } from '@/lib/standalone-html-generator';
import {
  X,
  FileCode,
  Download,
  Copy,
  Check,
  FileJson,
  Upload,
  RotateCcw,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: PlaceEntry[];
  onImport: (imported: PlaceEntry[]) => void;
  onResetToSample: () => void;
}

export function ExportModal({
  isOpen,
  onClose,
  places,
  onImport,
  onResetToSample,
}: ExportModalProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    const htmlContent = generateStandaloneHtml(places);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placevibe-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = async () => {
    const htmlContent = generateStandaloneHtml(places);
    await navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(places, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placevibe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImport(parsed);
          setImportStatus(`Successfully restored ${parsed.length} entries!`);
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Invalid JSON format: expected an array of places.');
        }
      } catch {
        setImportStatus('Failed to parse file: invalid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Export & Backup Options
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download your journal, get a standalone single-file HTML version, or restore backups.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importStatus && (
          <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
            {importStatus}
          </div>
        )}

        <div className="space-y-3">
          {/* Standalone Single HTML File */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">
                  Single-File HTML Bundle
                </span>
              </div>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                Self-Contained
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Includes complete responsive layout, Tailwind CSS via CDN, and full local storage logic. Open anywhere in any browser with zero setup.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadHtml}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .html</span>
              </button>
              <button
                onClick={handleCopyHtml}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* JSON Data Backup */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileJson className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  JSON Data Export
                </div>
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {places.length} places recorded
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-slate-500" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* JSON Restore */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Restore from JSON
                </div>
                <div className="text-[11px] text-slate-500">
                  Load visits from a previous backup file
                </div>
              </div>
            </div>
            <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
              <span>Select File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset to Sample Entries */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Reset journal to default sample entries? This will replace your current list with the 5 curated initial spots.'
                  )
                ) {
                  onResetToSample();
                  onClose();
                }
              }}
              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Sample Places</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
