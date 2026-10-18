import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { PlaceEntry, FamilyConfig, INITIAL_MOCK_ENTRIES } from '@/types/place';

export const PRIMARY_OWNER_EMAIL = 'elsonotake@gmail.com';
export const FAMILY_ID = 'elson_family';

// Subscribe to places in real-time
export function subscribeToPlaces(
  onSuccess: (places: PlaceEntry[]) => void,
  onError?: (error: unknown) => void
) {
  const placesCol = collection(db, 'places');
  return onSnapshot(
    placesCol,
    (snapshot) => {
      const places: PlaceEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt =
          data.createdAt instanceof Timestamp
            ? data.createdAt.toMillis()
            : typeof data.createdAt === 'number'
            ? data.createdAt
            : Date.now();
        const updatedAt =
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toMillis()
            : typeof data.updatedAt === 'number'
            ? data.updatedAt
            : Date.now();

        places.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'Other',
          location: data.location || undefined,
          formattedAddress: data.formattedAddress || undefined,
          rating: typeof data.rating === 'number' ? data.rating : 5,
          pros: Array.isArray(data.pros) ? data.pros : [],
          cons: Array.isArray(data.cons) ? data.cons : [],
          dateVisited: data.dateVisited || new Date().toISOString().slice(0, 10),
          notes: data.notes || '',
          wouldReturn: !!data.wouldReturn,
          priceRange: data.priceRange || undefined,
          googlePlaceId: data.googlePlaceId || undefined,
          googleMapsUrl: data.googleMapsUrl || undefined,
          googleRating: typeof data.googleRating === 'number' ? data.googleRating : undefined,
          googleRatingCount: typeof data.googleRatingCount === 'number' ? data.googleRatingCount : undefined,
          latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
          longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
          website: data.website || undefined,
          editorialSummary: data.editorialSummary || undefined,
          familyId: data.familyId || FAMILY_ID,
          allowedEmails: Array.isArray(data.allowedEmails) ? data.allowedEmails : [],
          createdByUid: data.createdByUid || '',
          createdByEmail: data.createdByEmail || '',
          createdByName: data.createdByName || undefined,
          createdAt,
          updatedAt,
        });
      });

      // Sort by dateVisited descending by default
      places.sort(
        (a, b) => new Date(b.dateVisited).getTime() - new Date(a.dateVisited).getTime()
      );

      onSuccess(places);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, 'places');
    }
  );
}

// Subscribe to Family Configuration
const FAMILY_CONFIG_CACHE_KEY = 'placevibe_family_config_cache';

export function getCachedFamilyConfig(): FamilyConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FAMILY_CONFIG_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FamilyConfig;
  } catch {
    return null;
  }
}

export function subscribeToFamilyConfig(
  onSuccess: (config: FamilyConfig | null) => void,
  onError?: (error: unknown) => void
) {
  // If we have a local cache, supply it immediately so UI never flashes restricted
  const cached = getCachedFamilyConfig();
  if (cached) {
    onSuccess(cached);
  }

  const configDocRef = doc(db, 'family_config', 'settings');
  return onSnapshot(
    configDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedAt =
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toMillis()
            : Date.now();
        const configObj: FamilyConfig = {
          id: docSnap.id,
          ownerEmail: data.ownerEmail || PRIMARY_OWNER_EMAIL,
          wifeEmail: data.wifeEmail || '',
          allowedEmails: Array.isArray(data.allowedEmails)
            ? data.allowedEmails
            : [PRIMARY_OWNER_EMAIL],
          updatedAt,
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(FAMILY_CONFIG_CACHE_KEY, JSON.stringify(configObj));
          } catch {
            // Ignore storage quota
          }
        }
        onSuccess(configObj);
      } else {
        // Document does not exist yet; if we have cached, keep it, else null
        if (!cached) {
          onSuccess(null);
        }
      }
    },
    (err) => {
      onError?.(err);
      console.warn('Family configuration snapshot notice:', err);
    }
  );
}

// Save or Update Family Config (Elson or wife)
export async function saveFamilyConfig(
  wifeEmail: string,
  extraEmails: string[] = []
) {
  const path = 'family_config/settings';
  try {
    const normalizedWife = wifeEmail.trim().toLowerCase();
    const normalizedExtras = extraEmails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => Boolean(e) && e.includes('@'));

    const emailSet = new Set<string>([PRIMARY_OWNER_EMAIL.toLowerCase()]);
    if (normalizedWife) emailSet.add(normalizedWife);
    normalizedExtras.forEach((e) => emailSet.add(e));

    const allowedEmails = Array.from(emailSet);

    // Save to local cache immediately so local UI updates without any delay
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          FAMILY_CONFIG_CACHE_KEY,
          JSON.stringify({
            id: 'settings',
            ownerEmail: PRIMARY_OWNER_EMAIL,
            wifeEmail: normalizedWife,
            allowedEmails,
            updatedAt: Date.now(),
          })
        );
      } catch {
        // Ignore quota
      }
    }

    // 1. Save family_config/settings document
    await setDoc(doc(db, 'family_config', 'settings'), {
      id: 'settings',
      ownerEmail: PRIMARY_OWNER_EMAIL,
      wifeEmail: normalizedWife,
      allowedEmails,
      updatedAt: serverTimestamp(),
    });

    // 2. Propagate new allowedEmails to existing places for instant seamless sharing
    try {
      const placesSnap = await getDocs(collection(db, 'places'));
      const batch = writeBatch(db);
      let count = 0;
      placesSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const currentAllowed = Array.isArray(data.allowedEmails) ? data.allowedEmails : [];
        const needsUpdate =
          allowedEmails.some((e) => !currentAllowed.includes(e)) ||
          currentAllowed.length !== allowedEmails.length;
        if (needsUpdate) {
          batch.update(docSnap.ref, {
            allowedEmails,
            updatedAt: serverTimestamp(),
          });
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
      }
    } catch (batchErr) {
      console.warn('Could not sync allowedEmails across existing places:', batchErr);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

let lastCreatedDocSignature = '';
let lastCreatedDocTime = 0;

export async function createPlaceDoc(
  entryData: Omit<PlaceEntry, 'id' | 'createdAt' | 'updatedAt'>,
  user: { uid: string; email: string; displayName?: string },
  allowedEmails: string[]
) {
  // Guard against duplicate document creation within 4 seconds with identical signature
  const signature = `${user.uid}:${entryData.name.trim().toLowerCase()}:${entryData.dateVisited}:${entryData.category}`;
  const now = Date.now();
  if (signature === lastCreatedDocSignature && now - lastCreatedDocTime < 4000) {
    console.warn('createPlaceDoc: Blocked duplicate document creation for signature:', signature);
    return;
  }
  lastCreatedDocSignature = signature;
  lastCreatedDocTime = now;

  const placeId = `pv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `places/${placeId}`;

  const emailSet = new Set<string>([PRIMARY_OWNER_EMAIL, user.email.toLowerCase()]);
  allowedEmails.forEach((e) => emailSet.add(e.toLowerCase()));

  const payload: Record<string, unknown> = {
    id: placeId,
    name: entryData.name.trim(),
    category: entryData.category,
    rating: entryData.rating,
    dateVisited: entryData.dateVisited,
    wouldReturn: entryData.wouldReturn,
    familyId: FAMILY_ID,
    allowedEmails: Array.from(emailSet),
    createdByUid: user.uid,
    createdByEmail: user.email.toLowerCase(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (entryData.location?.trim()) payload.location = entryData.location.trim();
  if (entryData.formattedAddress?.trim()) payload.formattedAddress = entryData.formattedAddress.trim();
  if (entryData.notes?.trim()) payload.notes = entryData.notes.trim();
  if (entryData.priceRange) payload.priceRange = entryData.priceRange;
  if (user.displayName) payload.createdByName = user.displayName;
  if (entryData.pros && entryData.pros.length > 0) payload.pros = entryData.pros;
  if (entryData.cons && entryData.cons.length > 0) payload.cons = entryData.cons;
  if (entryData.googlePlaceId) payload.googlePlaceId = entryData.googlePlaceId;
  if (entryData.googleMapsUrl) payload.googleMapsUrl = entryData.googleMapsUrl;
  if (typeof entryData.googleRating === 'number') payload.googleRating = entryData.googleRating;
  if (typeof entryData.googleRatingCount === 'number') payload.googleRatingCount = entryData.googleRatingCount;
  if (typeof entryData.latitude === 'number') payload.latitude = entryData.latitude;
  if (typeof entryData.longitude === 'number') payload.longitude = entryData.longitude;
  if (entryData.website) payload.website = entryData.website;
  if (entryData.editorialSummary) payload.editorialSummary = entryData.editorialSummary;

  try {
    await setDoc(doc(db, 'places', placeId), payload);
    return placeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Update Place
export async function updatePlaceDoc(
  placeId: string,
  updates: Partial<PlaceEntry>,
  allowedEmails: string[]
) {
  const path = `places/${placeId}`;

  const emailSet = new Set<string>([PRIMARY_OWNER_EMAIL]);
  allowedEmails.forEach((e) => emailSet.add(e.toLowerCase()));

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    allowedEmails: Array.from(emailSet),
  };

  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.rating !== undefined) payload.rating = updates.rating;
  if (updates.dateVisited !== undefined) payload.dateVisited = updates.dateVisited;
  if (updates.wouldReturn !== undefined) payload.wouldReturn = updates.wouldReturn;
  if (updates.location !== undefined) payload.location = updates.location.trim();
  if (updates.formattedAddress !== undefined) payload.formattedAddress = updates.formattedAddress.trim();
  if (updates.notes !== undefined) payload.notes = updates.notes.trim();
  if (updates.priceRange !== undefined) payload.priceRange = updates.priceRange;
  if (updates.pros !== undefined) payload.pros = updates.pros;
  if (updates.cons !== undefined) payload.cons = updates.cons;
  if (updates.googlePlaceId !== undefined) payload.googlePlaceId = updates.googlePlaceId;
  if (updates.googleMapsUrl !== undefined) payload.googleMapsUrl = updates.googleMapsUrl;
  if (updates.googleRating !== undefined) payload.googleRating = updates.googleRating;
  if (updates.googleRatingCount !== undefined) payload.googleRatingCount = updates.googleRatingCount;
  if (updates.latitude !== undefined) payload.latitude = updates.latitude;
  if (updates.longitude !== undefined) payload.longitude = updates.longitude;
  if (updates.website !== undefined) payload.website = updates.website;
  if (updates.editorialSummary !== undefined) payload.editorialSummary = updates.editorialSummary;

  try {
    await updateDoc(doc(db, 'places', placeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete Place
export async function deletePlaceDoc(placeId: string) {
  const path = `places/${placeId}`;
  try {
    await deleteDoc(doc(db, 'places', placeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed initial mock places into Firestore
export async function seedInitialFirestorePlaces(
  user: { uid: string; email: string; displayName?: string },
  allowedEmails: string[]
) {
  for (const mock of INITIAL_MOCK_ENTRIES) {
    await createPlaceDoc(
      {
        name: mock.name,
        category: mock.category,
        location: mock.location,
        formattedAddress: mock.formattedAddress,
        latitude: mock.latitude,
        longitude: mock.longitude,
        googleRating: mock.googleRating,
        googleRatingCount: mock.googleRatingCount,
        googleMapsUrl: mock.googleMapsUrl,
        rating: mock.rating,
        pros: mock.pros,
        cons: mock.cons,
        dateVisited: mock.dateVisited,
        notes: mock.notes,
        wouldReturn: mock.wouldReturn,
        priceRange: mock.priceRange,
      },
      user,
      allowedEmails
    );
  }
}
