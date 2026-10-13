import { PlaceEntry, INITIAL_MOCK_ENTRIES } from '@/types/place';

const STORAGE_KEY = 'placevibe_visits_v1';

let memoryPlaces: PlaceEntry[] = INITIAL_MOCK_ENTRIES;

// Preload from localStorage in browser environment if available
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPlaces = parsed;
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ENTRIES));
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ENTRIES));
    }
  } catch {
    memoryPlaces = INITIAL_MOCK_ENTRIES;
  }
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const placesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
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
          // ignore
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
    return memoryPlaces;
  },
  getServerSnapshot(): PlaceEntry[] {
    return INITIAL_MOCK_ENTRIES;
  },
  savePlaces(newPlaces: PlaceEntry[]) {
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
