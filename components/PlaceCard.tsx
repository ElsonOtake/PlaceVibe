'use client';

import React, { useState } from 'react';
import { PlaceEntry } from '@/types/place';
import {
  Star,
  Check,
  X,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Copy,
  CheckCheck,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface PlaceCardProps {
  place: PlaceEntry;
  onEdit: (place: PlaceEntry) => void;
  onDelete: (id: string, name: string) => void;
  onDuplicate: (place: PlaceEntry) => void;
}

export function PlaceCard({ place, onEdit, onDelete, onDuplicate }: PlaceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const text = [
      `📍 ${place.name} (${place.category})`,
      place.location ? `Location: ${place.location}` : '',
      `Rating: ${place.rating}/5.0 | Date: ${place.dateVisited}`,
      `Would Return: ${place.wouldReturn ? 'Yes ✅' : 'No ❌'}`,
      place.pros.length > 0 ? `Pros:\n${place.pros.map((p) => `  + ${p}`).join('\n')}` : '',
      place.cons.length > 0 ? `Cons:\n${place.cons.map((c) => `  - ${c}`).join('\n')}` : '',
      place.notes ? `Notes: ${place.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Stars
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= place.rating;
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${
          isFilled
            ? 'text-amber-400 fill-amber-400'
            : 'text-slate-200 fill-slate-100'
        }`}
      />
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug truncate" title={place.name}>
              {place.name}
            </h3>
            {/* Unboxed clean metadata */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="font-medium text-slate-700">{place.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{place.dateVisited}</span>
              </span>
              {place.location && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 truncate max-w-[150px]" title={place.location}>
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{place.location}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {place.wouldReturn ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                <ThumbsUp className="w-3 h-3 text-emerald-600" />
                <span>Would Return</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                <ThumbsDown className="w-3 h-3 text-slate-500" />
                <span>Won&apos;t Return</span>
              </span>
            )}
            {place.priceRange && (
              <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider">
                {place.priceRange}
              </span>
            )}
          </div>
        </div>

        {/* Rating Score */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex items-center gap-0.5">{stars}</div>
          <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
            {place.rating}.0
          </span>
          <span className="text-[11px] text-slate-400">
            {place.rating === 5
              ? 'Outstanding'
              : place.rating === 4
              ? 'Very Good'
              : place.rating === 3
              ? 'Average'
              : place.rating === 2
              ? 'Disappointing'
              : 'Poor'}
          </span>
        </div>
      </div>

      {/* Card Content: Pros, Cons, Notes */}
      <div className="space-y-3.5 flex-1">
        {/* Pros */}
        {place.pros && place.pros.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Good Points</span>
            </div>
            <ul className="space-y-1">
              {place.pros.map((pro, idx) => (
                <li
                  key={idx}
                  className="text-xs text-emerald-950 bg-emerald-50/80 border border-emerald-100/90 px-2.5 py-1 rounded-md flex items-start gap-1.5 leading-relaxed"
                >
                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">+</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {place.cons && place.cons.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-rose-800 tracking-wider uppercase flex items-center gap-1">
              <X className="w-3 h-3 text-rose-600" />
              <span>Could Be Better</span>
            </div>
            <ul className="space-y-1">
              {place.cons.map((con, idx) => (
                <li
                  key={idx}
                  className="text-xs text-rose-950 bg-rose-50/80 border border-rose-100/90 px-2.5 py-1 rounded-md flex items-start gap-1.5 leading-relaxed"
                >
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">-</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {place.notes && (
          <div className="text-xs text-slate-700 bg-slate-50/90 p-3 rounded-xl border border-slate-100/80 italic leading-relaxed">
            &ldquo;{place.notes}&rdquo;
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Copy visit summary to clipboard"
        >
          {copied ? (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onDuplicate(place)}
            className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium cursor-pointer"
            title="Log another visit to this spot"
          >
            Log Again
          </button>
          <button
            onClick={() => onEdit(place)}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3 h-3 text-slate-500" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(place.id, place.name)}
            className="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}
