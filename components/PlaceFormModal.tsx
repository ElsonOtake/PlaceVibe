'use client';

import React, { useState } from 'react';
import {
  PlaceEntry,
  PlaceCategory,
  PriceRange,
  PLACE_CATEGORIES,
  POPULAR_PROS,
  POPULAR_CONS,
} from '@/types/place';
import { X, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  initialData?: PlaceEntry | null;
}

interface FormInnerProps {
  onClose: () => void;
  onSave: (entry: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  initialData?: PlaceEntry | null;
}

function FormInner({ onClose, onSave, initialData }: FormInnerProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<PlaceCategory>(
    initialData?.category || 'Coffee Shop'
  );
  const [location, setLocation] = useState(initialData?.location || '');
  const [dateVisited, setDateVisited] = useState(
    initialData?.dateVisited || new Date().toISOString().slice(0, 10)
  );
  const [rating, setRating] = useState(initialData?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [priceRange, setPriceRange] = useState<PriceRange>(
    initialData?.priceRange || '$$'
  );
  const [wouldReturn, setWouldReturn] = useState(
    initialData?.wouldReturn ?? true
  );
  const [pros, setPros] = useState<string[]>(initialData?.pros ? [...initialData.pros] : []);
  const [cons, setCons] = useState<string[]>(initialData?.cons ? [...initialData.cons] : []);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');
  const [error, setError] = useState('');

  const handleAddPro = () => {
    const trimmed = proInput.trim();
    if (trimmed && !pros.includes(trimmed)) {
      setPros([...pros, trimmed]);
      setProInput('');
    }
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleAddPopularPro = (item: string) => {
    if (!pros.includes(item)) {
      setPros([...pros, item]);
    }
  };

  const handleAddCon = () => {
    const trimmed = conInput.trim();
    if (trimmed && !cons.includes(trimmed)) {
      setCons([...cons, trimmed]);
      setConInput('');
    }
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleAddPopularCon = (item: string) => {
    if (!cons.includes(item)) {
      setCons([...cons, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide the place or franchise name.');
      return;
    }
    if (!dateVisited) {
      setError('Please select the date visited.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        category,
        location: location.trim() || undefined,
        dateVisited,
        rating,
        priceRange,
        wouldReturn,
        pros,
        cons,
        notes: notes.trim(),
      },
      initialData ? initialData.id : undefined
    );
  };

  const ratingLabels: Record<number, string> = {
    1: '1.0 — Poor / Avoid',
    2: '2.0 — Disappointing',
    3: '3.0 — Average / Decent',
    4: '4.0 — Very Good / Recommended',
    5: '5.0 — Outstanding / Must Visit',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {initialData?.name ? `Edit Visit: ${initialData.name}` : 'Log a Spot Visit'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Record candid pros & cons, rate the vibe, and store notes for next time.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Place or Franchise Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              required
              placeholder="e.g., Blue Bottle Coffee"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategory)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
            >
              {PLACE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Neighborhood
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hayes Valley, SF"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date Visited *
            </label>
            <input
              type="date"
              value={dateVisited}
              onChange={(e) => setDateVisited(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Rating and Price Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Overall Rating (1 - 5 Stars) *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const effectiveRating = hoverRating || rating;
                const isFilled = starVal <= effectiveRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starVal)}
                    className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {ratingLabels[hoverRating || rating]}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price Range
            </label>
            <div className="flex items-center gap-1">
              {(['$', '$$', '$$$', '$$$$'] as PriceRange[]).map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setPriceRange(pr)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                    priceRange === pr
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Would Return Toggle */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              {wouldReturn ? (
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ThumbsDown className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Would you return to this spot?</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {wouldReturn
                ? 'Marked as recommended in your journal'
                : 'Marked as pass / would not return'}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={wouldReturn}
              onChange={(e) => setWouldReturn(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Pros (Good Points) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-emerald-800">
              Pros / Highlights (Good Points)
            </label>
            <span className="text-[11px] text-slate-400">Press Enter to add</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={proInput}
              onChange={(e) => setProInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPro();
                }
              }}
              placeholder="e.g. Great pour-over, Quiet workspace"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddPro}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          {pros.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pros.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md"
                >
                  <span>+ {p}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePro(idx)}
                    className="text-emerald-600 hover:text-emerald-900 ml-1 font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="pt-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Quick Suggestions:
            </div>
            <div className="flex flex-wrap gap-1">
              {POPULAR_PROS.map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => handleAddPopularPro(pop)}
                  disabled={pros.includes(pop)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    pros.includes(pop)
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-800'
                  }`}
                >
                  + {pop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cons (Bad Points) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-rose-800">
              Cons / Downsides (Could Be Better)
            </label>
            <span className="text-[11px] text-slate-400">Press Enter to add</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={conInput}
              onChange={(e) => setConInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCon();
                }
              }}
              placeholder="e.g. No power outlets, Noisy music"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddCon}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          {cons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cons.map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-md"
                >
                  <span>- {c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCon(idx)}
                    className="text-rose-600 hover:text-rose-900 ml-1 font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="pt-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Quick Suggestions:
            </div>
            <div className="flex flex-wrap gap-1">
              {POPULAR_CONS.map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => handleAddPopularCon(pop)}
                  disabled={cons.includes(pop)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    cons.includes(pop)
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-800'
                  }`}
                >
                  - {pop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes & Observations */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Notes & Personal Observations
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Atmosphere, seating tips, favorite tables, pastry freshness, or beverage recommendations..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {initialData ? 'Update Visit' : 'Save Visit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function PlaceFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PlaceFormModalProps) {
  if (!isOpen) return null;

  const formKey = initialData?.id || (initialData?.name ? `dup-${initialData.name}` : 'new-entry');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <FormInner
        key={formKey}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
      />
    </div>
  );
}
