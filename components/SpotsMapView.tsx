// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { PlaceEntry, PlaceCategory } from '@/types/place';
import {
  Star,
  MapPin,
  ExternalLink,
  Compass,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SpotsMapViewProps {
  places: PlaceEntry[];
  onEditPlace: (place: PlaceEntry) => void;
  selectedCategory: string;
}

// Category badge styles
const CATEGORY_COLORS: Record<PlaceCategory, { bg: string; text: string; pinBg: string }> = {
  'Coffee Shop': { bg: 'bg-amber-100', text: 'text-amber-800', pinBg: 'bg-amber-600' },
  Bookstore: { bg: 'bg-indigo-100', text: 'text-indigo-800', pinBg: 'bg-indigo-600' },
  Restaurant: { bg: 'bg-emerald-100', text: 'text-emerald-800', pinBg: 'bg-emerald-600' },
  Bakery: { bg: 'bg-orange-100', text: 'text-orange-800', pinBg: 'bg-orange-600' },
  Bar: { bg: 'bg-purple-100', text: 'text-purple-800', pinBg: 'bg-purple-600' },
  Other: { bg: 'bg-slate-100', text: 'text-slate-800', pinBg: 'bg-slate-600' },
};

function MapBoundsController({ places }: { places: PlaceEntry[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const spotsWithCoords = places.filter(
      (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
    );
    if (spotsWithCoords.length === 0) return;

    if (spotsWithCoords.length === 1) {
      map.setCenter({
        lat: spotsWithCoords[0].latitude!,
        lng: spotsWithCoords[0].longitude!,
      });
      map.setZoom(14);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    spotsWithCoords.forEach((p) => {
      bounds.extend({ lat: p.latitude!, lng: p.longitude! });
    });
    map.fitBounds(bounds, 60);
  }, [map, places]);

  return null;
}

export function SpotsMapView({
  places,
  onEditPlace,
  selectedCategory,
}: SpotsMapViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<PlaceEntry | null>(null);

  // Spots with valid coordinates
  const mappedPlaces = useMemo(() => {
    return places.filter(
      (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
    );
  }, [places]);

  // Spots without coordinates (can prompt user to enrich via search)
  const unmappedPlaces = useMemo(() => {
    return places.filter(
      (p) => typeof p.latitude !== 'number' || typeof p.longitude !== 'number'
    );
  }, [places]);

  // Initial center default
  const defaultCenter = useMemo(() => {
    if (mappedPlaces.length > 0) {
      return {
        lat: mappedPlaces[0].latitude!,
        lng: mappedPlaces[0].longitude!,
      };
    }
    return { lat: 37.7749, lng: -122.4194 }; // San Francisco default
  }, [mappedPlaces]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[680px]">
      {/* Interactive Map Canvas */}
      <div className="relative flex-1 h-full min-h-[380px] w-full">
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={defaultCenter}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapBoundsController places={mappedPlaces} />

          {mappedPlaces.map((spot) => {
            const catColors = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.Other;
            const isSelected = selectedSpot?.id === spot.id;

            return (
              <AdvancedMarker
                key={spot.id}
                position={{ lat: spot.latitude!, lng: spot.longitude! }}
                onClick={() => setSelectedSpot(spot)}
                title={`${spot.name} (${spot.rating}★)`}
              >
                <div
                  className={`group relative flex items-center justify-center transition-all duration-200 transform cursor-pointer ${
                    isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full ${catColors.pinBg} text-white shadow-lg border-2 border-white flex items-center justify-center font-bold text-xs`}
                  >
                    <span className="flex items-center gap-0.5">
                      {spot.rating}
                      <Star className="w-2.5 h-2.5 fill-white" />
                    </span>
                  </div>
                  {/* Pin tail */}
                  <div
                    className={`absolute -bottom-1.5 w-2 h-2 ${catColors.pinBg} rotate-45 border-r border-b border-white`}
                  />
                </div>
              </AdvancedMarker>
            );
          })}

          {selectedSpot && typeof selectedSpot.latitude === 'number' && typeof selectedSpot.longitude === 'number' && (
            <InfoWindow
              position={{
                lat: selectedSpot.latitude,
                lng: selectedSpot.longitude,
              }}
              onCloseClick={() => setSelectedSpot(null)}
            >
              <div className="p-1 max-w-[280px] text-slate-800">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {selectedSpot.name}
                  </h4>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                      (CATEGORY_COLORS[selectedSpot.category] || CATEGORY_COLORS.Other).bg
                    } ${
                      (CATEGORY_COLORS[selectedSpot.category] || CATEGORY_COLORS.Other).text
                    }`}
                  >
                    {selectedSpot.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= selectedSpot.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-700 text-[11px]">
                    {selectedSpot.rating}.0
                  </span>
                  {selectedSpot.priceRange && (
                    <span className="text-slate-400 font-normal">
                      • {selectedSpot.priceRange}
                    </span>
                  )}
                </div>

                {selectedSpot.formattedAddress && (
                  <p className="text-[11px] text-slate-500 flex items-start gap-1 mb-2 line-clamp-2">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedSpot.formattedAddress}</span>
                  </p>
                )}

                {/* Google Maps benchmark if available */}
                {selectedSpot.googleRating && (
                  <div className="bg-amber-50/70 border border-amber-200/50 rounded px-2 py-1 mb-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Google Rating:</span>
                    <span className="font-bold text-slate-900">
                      ★ {selectedSpot.googleRating.toFixed(1)}
                      {selectedSpot.googleRatingCount ? ` (${selectedSpot.googleRatingCount})` : ''}
                    </span>
                  </div>
                )}

                {selectedSpot.pros.length > 0 && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 rounded p-1 mb-1.5 line-clamp-2">
                    <span className="font-semibold text-emerald-900">Top Pro:</span>{' '}
                    {selectedSpot.pros[0]}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 mt-2">
                  <button
                    onClick={() => onEditPlace(selectedSpot)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                  >
                    Edit Log
                  </button>
                  {selectedSpot.googleMapsUrl && (
                    <a
                      href={selectedSpot.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-sm rounded-lg p-2 text-xs z-10 hidden sm:block max-w-[210px]">
          <div className="font-bold text-slate-800 text-[11px] mb-1.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Map Legend ({mappedPlaces.length} pinned)</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => (
              <div key={cat} className="flex items-center gap-1.5 text-slate-600">
                <span className={`w-2.5 h-2.5 rounded-full ${colors.pinBg}`} />
                <span className="truncate">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spot List Sidebar */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200/80 flex flex-col bg-slate-50/50 h-56 lg:h-full">
        <div className="p-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Spots on Map ({mappedPlaces.length})
            </h3>
            <p className="text-[11px] text-slate-400">Click any spot to locate</p>
          </div>
          {unmappedPlaces.length > 0 && (
            <span
              className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium"
              title={`${unmappedPlaces.length} spots don't have coordinates. Edit them to search and attach Google Maps location.`}
            >
              {unmappedPlaces.length} unmapped
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100">
          {mappedPlaces.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">No spots mapped yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Log a visit and pick a location with Google Maps to see it on the map.
              </p>
            </div>
          ) : (
            mappedPlaces.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              const catColors = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.Other;

              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/80 border border-amber-300 shadow-xs'
                      : 'bg-white hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="font-bold text-xs text-slate-900 leading-tight truncate">
                      {spot.name}
                    </h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${catColors.bg} ${catColors.text}`}
                    >
                      {spot.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1 text-[11px]">
                    <span className="flex text-amber-500 font-bold items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {spot.rating}.0
                    </span>
                    {spot.googleRating && (
                      <span className="text-[10px] text-slate-400">
                        • G: {spot.googleRating.toFixed(1)}★
                      </span>
                    )}
                    {spot.wouldReturn ? (
                      <span className="text-[10px] text-emerald-600 font-medium ml-auto flex items-center gap-0.5">
                        <ThumbsUp className="w-2.5 h-2.5" /> Return
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-500 font-medium ml-auto flex items-center gap-0.5">
                        <ThumbsDown className="w-2.5 h-2.5" /> Pass
                      </span>
                    )}
                  </div>

                  {spot.formattedAddress && (
                    <p className="text-[10px] text-slate-500 truncate mt-1">
                      {spot.formattedAddress}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
