import { PlaceEntry, INITIAL_MOCK_ENTRIES } from '@/types/place';

const STORAGE_KEY = 'placevibe_visits_v1';

let memoryPlaces: PlaceEntry[] = INITIAL_MOCK_ENTRIES;
let isHydrated = false;

function loadFromStorage(): PlaceEntry[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_ENTRIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ENTRIES));
  } catch {
    // fallback if localStorage is disabled or throws
  }
  return INITIAL_MOCK_ENTRIES;
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const placesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);

    // When the first client subscriber mounts after React finishes initial hydration,
    // transition to hydrated state and load client localStorage data
    if (!isHydrated) {
      isHydrated = true;
      memoryPlaces = loadFromStorage();
      notify();
    }

    // Also listen to cross-tab storage changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            memoryPlaces = parsed;
            notify();
          }
        } catch {
          // ignore invalid json
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }

    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  },

  getSnapshot(): PlaceEntry[] {
    // During initial client hydration, guarantee that snapshot matches server HTML
    if (!isHydrated) {
      return INITIAL_MOCK_ENTRIES;
    }
    return memoryPlaces;
  },

  getServerSnapshot(): PlaceEntry[] {
    return INITIAL_MOCK_ENTRIES;
  },

  savePlaces(newPlaces: PlaceEntry[]) {
    isHydrated = true;
    memoryPlaces = newPlaces;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
      } catch {
        // quota exceeded fallback
      }
    }
    notify();
  },
};
