export type PlaceCategory =
  | 'Coffee Shop'
  | 'Bookstore'
  | 'Restaurant'
  | 'Bakery'
  | 'Bar'
  | 'Other';

export const PLACE_CATEGORIES: PlaceCategory[] = [
  'Coffee Shop',
  'Bookstore',
  'Restaurant',
  'Bakery',
  'Bar',
  'Other',
];

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface PlaceEntry {
  id: string;
  name: string;
  category: PlaceCategory;
  location?: string;
  rating: number; // 1 to 5 (e.g. 1, 2, 3, 4, 5)
  pros: string[];
  cons: string[];
  dateVisited: string; // YYYY-MM-DD
  notes: string;
  wouldReturn: boolean;
  priceRange?: PriceRange;
  // Google Maps enriched spot info
  googlePlaceId?: string;
  googleMapsUrl?: string;
  googleRating?: number;
  googleRatingCount?: number;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  website?: string;
  editorialSummary?: string;
  familyId?: string;
  allowedEmails?: string[];
  createdByUid?: string;
  createdByEmail?: string;
  createdByName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FamilyConfig {
  id: string;
  ownerEmail: string;
  wifeEmail?: string;
  allowedEmails: string[];
  updatedAt: number;
}

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'rating-desc'
  | 'rating-asc'
  | 'name-asc'
  | 'name-desc';

export const POPULAR_PROS = [
  'Fast Wi-Fi',
  'Quiet workspace',
  'Great pour-over',
  'Ample seating',
  'Friendly staff',
  'Cozy vibe',
  'Natural light',
  'Outdoor patio',
  'Power outlets available',
  'Dog friendly',
];

export const POPULAR_CONS = [
  'No power outlets',
  'Noisy music',
  'Expensive',
  'Long wait',
  'Cramped seating',
  'Weak Wi-Fi',
  'Hard to find parking',
  'Limited food options',
  'Cold draft inside',
];

export const INITIAL_MOCK_ENTRIES: PlaceEntry[] = [
  {
    id: 'pv-mock-1',
    name: 'Blue Bottle Coffee',
    category: 'Coffee Shop',
    location: '315 Linden St, Hayes Valley, San Francisco, CA',
    formattedAddress: '315 Linden St, San Francisco, CA 94102',
    latitude: 37.7763,
    longitude: -122.4233,
    googleRating: 4.5,
    googleRatingCount: 1680,
    googleMapsUrl: 'https://maps.google.com/?q=Blue+Bottle+Coffee+Hayes+Valley',
    rating: 5,
    pros: [
      'Flawless single-origin pour-over (Bella Donovan)',
      'Minimalist natural wood interior & warm light',
      'Knowledgeable, welcoming baristas',
    ],
    cons: [
      'Very limited power outlets near seating',
      'Pastry selection sells out before noon',
      'Pricey specialty drinks ($7.50)',
    ],
    dateVisited: '2026-10-08',
    notes:
      'Came for a morning deep work sprint. The Hayes Valley espresso is consistently top-tier. Arrive right before 9 AM to snag the corner window bench.',
    wouldReturn: true,
    priceRange: '$$$',
    createdAt: 1728374400000,
    updatedAt: 1728374400000,
  },
  {
    id: 'pv-mock-2',
    name: 'Livraria Cultura & Mezzanine',
    category: 'Bookstore',
    location: 'Av. Paulista, 2073, Cerqueira César, São Paulo',
    formattedAddress: 'Av. Paulista, 2073 - Bela Vista, São Paulo - SP',
    latitude: -23.5587,
    longitude: -46.6601,
    googleRating: 4.8,
    googleRatingCount: 5200,
    googleMapsUrl: 'https://maps.google.com/?q=Livraria+Cultura+Paulista',
    rating: 5,
    pros: [
      'Endless multi-tier wooden reading bleachers',
      'Curated indie fiction & design monographs',
      'Quiet workspace etiquette observed by visitors',
      'Quiet cafe with artisanal chamomile & herbal teas',
    ],
    cons: [
      'High foot traffic on Saturday afternoons',
      'Checkout lines can be slow during peak hours',
    ],
    dateVisited: '2026-10-02',
    notes:
      'A true city sanctuary. Spent two peaceful hours reviewing typography history. Perfect natural diffused light from the glass atrium ceiling.',
    wouldReturn: true,
    priceRange: '$$',
    createdAt: 1727856000000,
    updatedAt: 1727856000000,
  },
  {
    id: 'pv-mock-3',
    name: 'Osteria Stella Di Notte',
    category: 'Restaurant',
    location: 'North End Waterfront, Boston, MA',
    formattedAddress: '242 Hanover St, Boston, MA 02113',
    latitude: 42.3647,
    longitude: -71.0542,
    googleRating: 4.6,
    googleRatingCount: 890,
    googleMapsUrl: 'https://maps.google.com/?q=Osteria+North+End+Boston',
    rating: 4,
    pros: [
      'Handmade cacio e pepe and squid ink tagliolini',
      'Charming candlelit patio with autumn heaters',
      'Attentive sommelier paired an exceptional Sangiovese',
    ],
    cons: [
      'Acoustics make it slightly noisy inside during dinner rush',
      'Strict 90-minute table turnover limit',
    ],
    dateVisited: '2026-09-24',
    notes:
      'Great dinner date spot. Pasta was cooked to genuine al dente perfection. Book at least a week ahead for an outdoor patio seat.',
    wouldReturn: true,
    priceRange: '$$$$',
    createdAt: 1727164800000,
    updatedAt: 1727164800000,
  },
  {
    id: 'pv-mock-4',
    name: 'The Rusty Taphouse',
    category: 'Bar',
    location: 'Warehouse District, Portland, OR',
    formattedAddress: '1022 SE Ankeny St, Portland, OR 97214',
    latitude: 45.5228,
    longitude: -122.6551,
    googleRating: 4.2,
    googleRatingCount: 420,
    googleMapsUrl: 'https://maps.google.com/?q=Taphouse+Portland+OR',
    rating: 2,
    pros: [
      'Generous rotating draft list of local IPAs and ciders',
      'Trivia night on Tuesdays',
    ],
    cons: [
      'Sticky tables that take forever to get wiped down',
      'Overbearing bass music makes conversation impossible',
      'Lukewarm bar fries with stale dipping sauce',
    ],
    dateVisited: '2026-09-15',
    notes:
      'Stopped by for casual Friday drinks with colleagues. Left after 40 minutes because we were shouting across a four-top table. Would not return unless dragged to trivia.',
    wouldReturn: false,
    priceRange: '$$',
    createdAt: 1726387200000,
    updatedAt: 1726387200000,
  },
  {
    id: 'pv-mock-5',
    name: 'Flour & Stone Hearth',
    category: 'Bakery',
    location: 'Market Street Market, San Francisco, CA',
    formattedAddress: '55 4th St, San Francisco, CA 94103',
    latitude: 37.7858,
    longitude: -122.4045,
    googleRating: 4.9,
    googleRatingCount: 2310,
    googleMapsUrl: 'https://maps.google.com/?q=Flour+Bakery+San+Francisco',
    rating: 5,
    pros: [
      'Naturally leavened sourdough country loaves with blistered crust',
      'Cardamom morning buns that shatter with crispness',
      'Warm counter service and generous sample tastings',
    ],
    cons: [
      'Line wraps around the sidewalk by 8:30 AM',
      'Takeout only; no indoor seating available',
    ],
    dateVisited: '2026-10-11',
    notes:
      'Arrived at 8:15 AM on Sunday. The fresh sourdough stayed soft with crunchy crust for 4 days. Absolutely worth the 20-minute morning queue.',
    wouldReturn: true,
    priceRange: '$',
    createdAt: 1728633600000,
    updatedAt: 1728633600000,
  },
];
