// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  PlaceEntry,
  PlaceCategory,
  PriceRange,
  PLACE_CATEGORIES,
  POPULAR_PROS,
  POPULAR_CONS,
} from '@/types/place';
import { useAutocompleteSuggestions } from '@/hooks/use-autocomplete-suggestions';
import {
  mapGoogleTypesToCategory,
  mapGooglePriceLevel,
} from '@/lib/google-maps-utils';
import { useLanguage } from '@/lib/i18n';
import {
  X,
  Star,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Compass,
} from 'lucide-react';

interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    entry: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => void | Promise<void>;
  initialData?: PlaceEntry | null;
}

interface FormInnerProps {
  onClose: () => void;
  onSave: (
    entry: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => void | Promise<void>;
  initialData?: PlaceEntry | null;
}

function FormInner({ onClose, onSave, initialData }: FormInnerProps) {
  const { t, language } = useLanguage();

  const popularProsList =
    language === 'pt-BR'
      ? [
          'Wi-Fi rápido',
          'Ambiente silencioso',
          'Ótimo café coado',
          'Espaço amplo',
          'Atendimento acolhedor',
          'Ambiente aconchegante',
          'Boa iluminação natural',
          'Área externa / mesas ao ar livre',
          'Tomadas disponíveis',
          'Aceita pets',
        ]
      : POPULAR_PROS;

  const popularConsList =
    language === 'pt-BR'
      ? [
          'Sem tomadas',
          'Música alta',
          'Preço elevado',
          'Fila demorada',
          'Mesas apertadas',
          'Wi-Fi instável',
          'Difícil estacionar',
          'Poucas opções de comida',
        ]
      : POPULAR_CONS;

  // Core journal fields
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
  const [pros, setPros] = useState<string[]>(
    initialData?.pros ? [...initialData.pros] : []
  );
  const [cons, setCons] = useState<string[]>(
    initialData?.cons ? [...initialData.cons] : []
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Google Maps enriched fields
  const [googlePlaceId, setGooglePlaceId] = useState(
    initialData?.googlePlaceId || ''
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    initialData?.googleMapsUrl || ''
  );
  const [googleRating, setGoogleRating] = useState<number | undefined>(
    initialData?.googleRating
  );
  const [googleRatingCount, setGoogleRatingCount] = useState<number | undefined>(
    initialData?.googleRatingCount
  );
  const [latitude, setLatitude] = useState<number | undefined>(
    initialData?.latitude
  );
  const [longitude, setLongitude] = useState<number | undefined>(
    initialData?.longitude
  );
  const [formattedAddress, setFormattedAddress] = useState(
    initialData?.formattedAddress || ''
  );
  const [website, setWebsite] = useState(initialData?.website || '');
  const [editorialSummary, setEditorialSummary] = useState(
    initialData?.editorialSummary || ''
  );

  // Google Maps live search state
  const [mapSearchInput, setMapSearchInput] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [hasEnrichedNotice, setHasEnrichedNotice] = useState(false);

  const { suggestions, isLoading: isSuggestionsLoading, resetSession } =
    useAutocompleteSuggestions(mapSearchInput);

  const [proInput, setProInput] = useState('');
  const [conInput, setConInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Select place from Google Maps Autocomplete
  const handleSelectGooglePlace = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!suggestion.placePrediction) return;

    try {
      setIsEnriching(true);
      setError('');

      // 1. Convert prediction to full Place object
      const place = suggestion.placePrediction.toPlace();

      // 2. Fetch required details from Places API (New)
      await place.fetchFields({
        fields: [
          'displayName',
          'formattedAddress',
          'location',
          'rating',
          'userRatingCount',
          'types',
          'priceLevel',
          'websiteURI',
          'googleMapsURI',
          'editorialSummary',
        ],
      });

      // 3. Pre-fill form fields
      if (place.displayName) setName(place.displayName);
      if (place.formattedAddress) {
        setLocation(place.formattedAddress);
        setFormattedAddress(place.formattedAddress);
      }

      // Auto map category
      const detectedCat = mapGoogleTypesToCategory(place.types);
      if (detectedCat) setCategory(detectedCat);

      // Auto map price range
      const detectedPrice = mapGooglePriceLevel(place.priceLevel);
      if (detectedPrice) setPriceRange(detectedPrice);

      // Coordinates
      if (place.location) {
        setLatitude(place.location.lat());
        setLongitude(place.location.lng());
      }

      // Google Maps metadata
      if (typeof place.rating === 'number') setGoogleRating(place.rating);
      if (typeof place.userRatingCount === 'number')
        setGoogleRatingCount(place.userRatingCount);
      if (place.googleMapsURI) setGoogleMapsUrl(place.googleMapsURI);
      if (place.websiteURI) setWebsite(place.websiteURI);
      if (place.id) setGooglePlaceId(place.id);

      if (place.editorialSummary) {
        setEditorialSummary(place.editorialSummary);
        // Pre-fill notes if user hasn't written any yet
        setNotes((prevNotes) =>
          prevNotes.trim() ? prevNotes : place.editorialSummary || ''
        );
      }

      setHasEnrichedNotice(true);
      setMapSearchInput('');
      setIsSearchingMap(false);
      resetSession();
    } catch (err: unknown) {
      console.error('Failed to fetch Google Place details:', err);
      setError('Could not fetch details for this spot from Google Maps.');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleClearGoogleData = () => {
    setGooglePlaceId('');
    setGoogleMapsUrl('');
    setGoogleRating(undefined);
    setGoogleRatingCount(undefined);
    setLatitude(undefined);
    setLongitude(undefined);
    setFormattedAddress('');
    setWebsite('');
    setEditorialSummary('');
    setHasEnrichedNotice(false);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmittingRef.current || isSubmitting) return;

    if (!name.trim()) {
      setError(
        language === 'pt-BR'
          ? 'Por favor, informe o nome do local.'
          : 'Please provide the place or franchise name.'
      );
      return;
    }
    if (!dateVisited) {
      setError(
        language === 'pt-BR'
          ? 'Por favor, selecione a data da visita.'
          : 'Please select the date visited.'
      );
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      await onSave(
        {
          name: name.trim(),
          category,
          location: location.trim() || undefined,
          formattedAddress: formattedAddress.trim() || undefined,
          dateVisited,
          rating,
          priceRange,
          wouldReturn,
          pros,
          cons,
          notes: notes.trim(),
          // Enriched Google Maps properties
          googlePlaceId: googlePlaceId || undefined,
          googleMapsUrl: googleMapsUrl || undefined,
          googleRating,
          googleRatingCount,
          latitude,
          longitude,
          website: website || undefined,
          editorialSummary: editorialSummary || undefined,
        },
        initialData ? initialData.id : undefined
      );
    } catch (err) {
      console.error('Error saving place:', err);
      setError(
        err instanceof Error
          ? err.message
          : language === 'pt-BR'
          ? 'Erro ao salvar visita.'
          : 'Failed to save visit.'
      );
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> =
    language === 'pt-BR'
      ? {
          1: '1.0 — Ruim / Evitar',
          2: '2.0 — Abaixo do Esperado',
          3: '3.0 — Regular / Aceitável',
          4: '4.0 — Muito Bom / Recomendado',
          5: '5.0 — Excelente / Imperdível',
        }
      : {
          1: '1.0 — Poor / Avoid',
          2: '2.0 — Disappointing',
          3: '3.0 — Average / Decent',
          4: '4.0 — Very Good / Recommended',
          5: '5.0 — Outstanding / Must Visit',
        };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full shadow-2xl my-auto sm:my-8 max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden min-w-0">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4 shrink-0 bg-white">
        <div className="min-w-0 flex-1 pr-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {initialData?.name
              ? language === 'pt-BR'
                ? `Editar Visita: ${initialData.name}`
                : `Edit Visit: ${initialData.name}`
              : t.logNewVisitTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none">
            {language === 'pt-BR'
              ? 'Use o Google Maps para preencher automaticamente as informações do local e registre suas impressões sinceras.'
              : 'Use Google Maps to pre-fill spot information, then record your candid pros & cons.'}
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Form Body */}
      <form
        id="place-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3.5 sm:px-6 sm:py-5 space-y-4 min-w-0"
      >
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl break-words">
            {error}
          </div>
        )}

        {/* Google Maps Search & Autocomplete Bar */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {language === 'pt-BR'
                  ? 'Busca e Preenchimento pelo Google Maps'
                  : 'Google Maps Spot Search & Auto-Fill'}
              </span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              {language === 'pt-BR'
                ? 'Preenche Nome, Endereço e Nota'
                : 'Pre-fills Name, Address & Rating'}
            </span>
          </div>

          <div className="relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={mapSearchInput}
                onChange={(e) => {
                  setMapSearchInput(e.target.value);
                  setIsSearchingMap(true);
                }}
                onFocus={() => setIsSearchingMap(true)}
                placeholder={
                  language === 'pt-BR'
                    ? 'Buscar local no Google Maps (ex: Café, Restaurante)...'
                    : 'Search place on Google Maps (e.g. Blue Bottle, Tartine)...'
                }
                className="w-full min-w-0 pl-9 pr-8 py-2 text-xs bg-white border border-amber-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              {mapSearchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setMapSearchInput('');
                    resetSession();
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {isSearchingMap && (isSuggestionsLoading || suggestions.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                {isSuggestionsLoading ? (
                  <div className="p-3 text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Searching Google Maps Places...</span>
                  </div>
                ) : (
                  suggestions.map((suggestion, idx) => {
                    const prediction = suggestion.placePrediction;
                    const mainText =
                      prediction?.mainText?.text ||
                      prediction?.text?.text ||
                      '';
                    const secondaryText =
                      prediction?.secondaryText?.text || '';

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectGooglePlace(suggestion)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {mainText}
                          </p>
                          {secondaryText && (
                            <p className="text-[11px] text-slate-500 truncate">
                              {secondaryText}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Loading details feedback */}
          {isEnriching && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-white/80 p-2 rounded-lg border border-amber-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
              <span>Fetching spot coordinates and address details...</span>
            </div>
          )}

          {/* Active Google Maps Connection Preview */}
          {(googlePlaceId || (latitude && longitude) || googleRating) && (
            <div className="bg-white/95 border border-emerald-200 rounded-xl p-2.5 flex items-start justify-between gap-2 shadow-xs min-w-0">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 flex-wrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Linked to Google Maps Location</span>
                  {googleRating && (
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                      ★ {googleRating.toFixed(1)}
                      {googleRatingCount ? ` (${googleRatingCount})` : ''}
                    </span>
                  )}
                </div>
                {formattedAddress && (
                  <p className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{formattedAddress}</span>
                  </p>
                )}
                {hasEnrichedNotice && (
                  <p className="text-[10px] text-emerald-700 italic">
                    ✓ Form auto-filled with official spot details.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleClearGoogleData}
                  className="text-[11px] text-slate-400 hover:text-rose-600 px-1.5 py-1 transition-colors cursor-pointer shrink-0"
                  title="Unlink Google Maps spot"
                >
                  Unlink
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.nameLabel} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              required
              placeholder={t.namePlaceholder}
              className="w-full min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.categoryLabel} *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategory)}
              className="w-full min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white cursor-pointer"
            >
              {PLACE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t.categoryLabels[cat] || cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.locationLabel}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="w-full min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.dateVisitedLabel} *
            </label>
            <input
              type="date"
              value={dateVisited}
              onChange={(e) => setDateVisited(e.target.value)}
              required
              className="w-full min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
            />
          </div>
        </div>

        {/* Rating and Price Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 min-w-0">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'pt-BR' ? 'Sua Avaliação (1 a 5 Estrelas) *' : 'Personal Rating (1 - 5 Stars) *'}
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
                    className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
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
              {t.priceRangeLabel}
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
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
              {wouldReturn ? (
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <ThumbsDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span>{t.wouldReturnQuestion}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 break-words">
              {wouldReturn
                ? language === 'pt-BR'
                  ? 'Marcado como recomendado no seu diário'
                  : 'Marked as recommended in your journal'
                : language === 'pt-BR'
                ? 'Marcado como não recomendado'
                : 'Marked as pass / would not return'}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
        <div className="space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-semibold text-emerald-800">
              {t.highlightsTitle} ({language === 'pt-BR' ? 'Pontos Positivos' : 'Good Points'})
            </label>
            <span className="text-[11px] text-slate-400">
              {language === 'pt-BR' ? 'Pressione Enter para adicionar' : 'Press Enter to add'}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
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
              placeholder={t.prosPlaceholder}
              className="flex-1 min-w-0 w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddPro}
              className="shrink-0 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'pt-BR' ? 'Adicionar' : 'Add'}
            </button>
          </div>

          {pros.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 max-w-full">
              {pros.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md max-w-full"
                >
                  <span className="break-words line-clamp-2">+ {p}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePro(idx)}
                    className="text-emerald-600 hover:text-emerald-900 ml-1 font-bold cursor-pointer shrink-0 text-sm leading-none"
                    aria-label="Remove highlight"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="pt-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              {language === 'pt-BR' ? 'Sugestões Rápidas:' : 'Quick Suggestions:'}
            </div>
            <div className="flex flex-wrap gap-1 max-w-full">
              {popularProsList.map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => handleAddPopularPro(pop)}
                  disabled={pros.includes(pop)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer max-w-full text-left break-words ${
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
        <div className="space-y-2 pt-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-semibold text-rose-800">
              {t.considerationsTitle} ({language === 'pt-BR' ? 'Pontos a Melhorar' : 'Could Be Better'})
            </label>
            <span className="text-[11px] text-slate-400">
              {language === 'pt-BR' ? 'Pressione Enter para adicionar' : 'Press Enter to add'}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full min-w-0">
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
              placeholder={t.consPlaceholder}
              className="flex-1 min-w-0 w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddCon}
              className="shrink-0 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'pt-BR' ? 'Adicionar' : 'Add'}
            </button>
          </div>

          {cons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 max-w-full">
              {cons.map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-md max-w-full"
                >
                  <span className="break-words line-clamp-2">- {c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCon(idx)}
                    className="text-rose-600 hover:text-rose-900 ml-1 font-bold cursor-pointer shrink-0 text-sm leading-none"
                    aria-label="Remove consideration"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="pt-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              {language === 'pt-BR' ? 'Sugestões Rápidas:' : 'Quick Suggestions:'}
            </div>
            <div className="flex flex-wrap gap-1 max-w-full">
              {popularConsList.map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => handleAddPopularCon(pop)}
                  disabled={cons.includes(pop)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer max-w-full text-left break-words ${
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
        <div className="space-y-1 min-w-0">
          <label className="block text-xs font-semibold text-slate-700">
            {t.notesLabel}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="w-full min-w-0 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
          />
        </div>
      </form>

      {/* Sticky Bottom Action Buttons — Always visible and accessible on mobile */}
      <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200/80 bg-slate-50/90 sm:bg-white/95 backdrop-blur-xs flex items-center justify-end gap-2.5 sm:gap-3 z-20">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-3.5 py-2 sm:px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          form="place-form"
          disabled={isSubmitting}
          className="px-4 py-2 sm:px-5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>
            {isSubmitting
              ? t.savingVisit
              : initialData
              ? language === 'pt-BR'
                ? 'Atualizar Visita'
                : 'Update Visit'
              : t.saveVisit}
          </span>
        </button>
      </div>
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

  const formKey =
    initialData?.id ||
    (initialData?.name ? `dup-${initialData.name}` : 'new-entry');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <FormInner
        key={formKey}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
      />
    </div>
  );
}
