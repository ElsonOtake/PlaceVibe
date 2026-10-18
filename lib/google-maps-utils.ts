// Source: Google Maps Platform Code Assist
import { PlaceCategory, PriceRange } from '@/types/place';

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.VITE_GOOGLE_MAPS_API_KEY ||
  '';

/**
 * Intelligent mapping of Google Places API (New) types to our 6 PlaceVibe categories.
 */
export function mapGoogleTypesToCategory(types?: string[]): PlaceCategory {
  if (!types || types.length === 0) return 'Other';
  const typeSet = new Set(types);

  if (
    typeSet.has('cafe') ||
    typeSet.has('coffee_shop') ||
    typeSet.has('tea_house') ||
    typeSet.has('espresso_bar')
  ) {
    return 'Coffee Shop';
  }
  if (typeSet.has('book_store') || typeSet.has('library')) {
    return 'Bookstore';
  }
  if (typeSet.has('bakery') || typeSet.has('pastry_shop')) {
    return 'Bakery';
  }
  if (
    typeSet.has('bar') ||
    typeSet.has('night_club') ||
    typeSet.has('pub') ||
    typeSet.has('wine_bar') ||
    typeSet.has('cocktail_bar') ||
    typeSet.has('brewery')
  ) {
    return 'Bar';
  }
  if (
    typeSet.has('restaurant') ||
    typeSet.has('food') ||
    typeSet.has('meal_takeaway') ||
    typeSet.has('meal_delivery') ||
    typeSet.has('bistro') ||
    typeSet.has('diner') ||
    typeSet.has('pizzeria')
  ) {
    return 'Restaurant';
  }
  return 'Other';
}

/**
 * Maps Google Places price level representation to standard $ - $$$$ notation.
 */
export function mapGooglePriceLevel(priceLevel?: string | number | null): PriceRange | undefined {
  if (!priceLevel) return undefined;
  if (priceLevel === 'PRICE_LEVEL_INEXPENSIVE' || priceLevel === 1 || priceLevel === '1') return '$';
  if (priceLevel === 'PRICE_LEVEL_MODERATE' || priceLevel === 2 || priceLevel === '2') return '$$';
  if (priceLevel === 'PRICE_LEVEL_EXPENSIVE' || priceLevel === 3 || priceLevel === '3') return '$$$';
  if (priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE' || priceLevel === 4 || priceLevel === '4') return '$$$$';
  return undefined;
}
