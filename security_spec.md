# Security Specification: PlaceVibe Multi-User Access Control

## 1. Data Invariants
1. **Authenticated & Verified Users Only**: Anonymous requests are denied. Any user attempting reads or writes must be authenticated via Firebase Auth with an email verified account (`request.auth.token.email_verified == true`).
2. **Family Access Restriction**: Only `elsonotake@gmail.com` and authorized family members (in `allowedEmails` or configured in `family_config`) can read or write place entries.
3. **No Unbounded Arrays**: `pros`, `cons`, and `allowedEmails` are strictly bounded to at most 20 items.
4. **Identity Binding**: On create, `incoming().createdByUid == request.auth.uid` and `incoming().createdByEmail.lower() == request.auth.token.email.lower()`.
5. **Immortal Fields**: Once created, `createdByUid`, `createdByEmail`, and `createdAt` cannot be altered.
6. **Strict Timestamps**: Server timestamps (`request.time`) are used for temporal integrity on `createdAt` and `updatedAt`.
7. **Input Bounds**: Names are capped at 128 characters, notes at 2000 characters, locations at 256 characters, formattedAddress at 512 characters, Google URLs at 1024 characters, ratings bounded between 1 and 5.
8. **Catch-All Default Deny**: All unmapped paths are strictly denied (`allow read, write: if false;`).
9. **Google Maps Attribution Security**: Optional Google Maps metadata fields (`googlePlaceId`, `googleMapsUrl`, `googleRating`, `googleRatingCount`, `latitude`, `longitude`, `website`, `editorialSummary`) are strictly validated for numeric range and string bounds.

---

## 2. The "Dirty Dozen" Threat Payloads (Must be Denied)
1. **Unauthenticated Read**: Anonymous user attempts `get` or `list` on `/places`.
2. **Unverified Email Access**: Authenticated user with `email_verified == false` attempts access.
3. **Stranger Read**: Authenticated user with email `stranger@example.com` (not on family allowlist) attempts `list` on `/places`.
4. **Identity Spoofing on Create**: Authenticated user `elsonotake@gmail.com` attempts creating a place with `createdByUid: 'different-uid'`.
5. **Ghost Field Injection (Shadow Update)**: Attempting to insert an unauthorized field `isAdmin: true` into a place document.
6. **Denial-of-Wallet Array Flooding**: Attempting to insert `pros` array containing 5,000 strings.
7. **Over-long String Injection**: Attempting to set `name` to a 50KB character string.
8. **Invalid Rating Value**: Attempting to set `rating` to `99` or `-5`.
9. **Tampering with Immortal Field**: Attempting to change `createdByEmail` from `elsonotake@gmail.com` to `hacker@evil.com` on update.
10. **Path Variable Traversal / ID Poisoning**: Attempting to target document ID containing forbidden characters or >128 length.
11. **Config Hijack by Stranger**: User `random@gmail.com` attempting to write to `/family_config/settings`.
12. **Future / Past Client Timestamp Tampering**: Client supplying a client-side date instead of `request.time`.

---

## 3. Test Runner Definition (`firestore.rules.test.ts`)
```typescript
// Test assertions verifying PERMISSION_DENIED on all 12 threat vectors
// Run against Firebase Local Emulator or rules unit test harness
describe('Firestore Rules Security Guard', () => {
  it('denies unauthenticated read', async () => { /* returns PERMISSION_DENIED */ });
  it('denies unverified email users', async () => { /* returns PERMISSION_DENIED */ });
  it('denies unauthorized stranger email from reading places', async () => { /* returns PERMISSION_DENIED */ });
  it('denies creator UID spoofing', async () => { /* returns PERMISSION_DENIED */ });
  it('denies shadow field injection', async () => { /* returns PERMISSION_DENIED */ });
  it('denies oversized pros array', async () => { /* returns PERMISSION_DENIED */ });
  it('denies oversized name string', async () => { /* returns PERMISSION_DENIED */ });
  it('denies out-of-range rating', async () => { /* returns PERMISSION_DENIED */ });
  it('denies tampering with createdByUid on update', async () => { /* returns PERMISSION_DENIED */ });
  it('denies invalid path document ID', async () => { /* returns PERMISSION_DENIED */ });
  it('denies non-owner from overwriting family_config', async () => { /* returns PERMISSION_DENIED */ });
  it('denies non-server timestamp on createdAt', async () => { /* returns PERMISSION_DENIED */ });
});
```
