import crypto from 'crypto';

// ============================================
// Slug Utility — Vehicle URL Slug Generation
// ============================================

const SLUG_CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_SUFFIX_LENGTH = 4;
const MAX_RETRIES = 3;

/**
 * Generates a URL-safe base slug from a vehicle title and year.
 * Strips special characters, collapses whitespace to underscores,
 * converts to lowercase, and appends the year.
 *
 * Example: "BMW X5 xDrive40i" + 2024 → "bmw_x5_xdrive40i_2024"
 */
export function buildBaseSlug(title: string, year: number): string {
  return (
    title
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase() +
    '_' +
    year
  );
}

/**
 * Generates a cryptographically random alphanumeric suffix.
 * Uses `crypto.randomBytes` for true randomness (not Math.random).
 *
 * Character set: a-z, 0-9 (36 chars)
 * Default length 4 → 36⁴ = 1,679,616 unique combinations per base slug.
 */
export function generateRandomSuffix(length: number = DEFAULT_SUFFIX_LENGTH): string {
  const bytes = crypto.randomBytes(length);
  let suffix = '';
  for (let i = 0; i < length; i++) {
    suffix += SLUG_CHARSET[bytes[i] % SLUG_CHARSET.length];
  }
  return suffix;
}

/**
 * Builds a unique slug with collision detection.
 *
 * Strategy:
 *  1. Try the clean base slug first (best-case: cleanest URL).
 *  2. If taken, append `_xxxx` (4-char random suffix).
 *  3. Retry up to MAX_RETRIES times if the suffixed slug also collides.
 *  4. Throw on exhaustion (statistically near-impossible with 1.6M+ combos).
 *
 * @param title       - Vehicle title (e.g., "BMW X5 xDrive40i")
 * @param year        - Vehicle year (e.g., 2024)
 * @param existingId  - The document's own _id (null for new documents)
 * @param checkExists - Async callback that returns true if a slug is already taken
 *                      (excluding the document with `existingId`)
 */
export async function generateUniqueSlug(
  title: string,
  year: number,
  existingId: string | null,
  checkExists: (slug: string, excludeId: string | null) => Promise<boolean>
): Promise<string> {
  const base = buildBaseSlug(title, year);

  // Attempt 1: Use the clean base slug (no suffix)
  const baseTaken = await checkExists(base, existingId);
  if (!baseTaken) {
    return base;
  }

  // Attempt 2–N: Append random suffix until unique
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const suffix = generateRandomSuffix();
    const candidate = `${base}_${suffix}`;
    const taken = await checkExists(candidate, existingId);
    if (!taken) {
      return candidate;
    }
  }

  // Fallback: should never reach here with 1.6M+ combinations
  throw new Error(
    `Failed to generate unique slug for "${title} ${year}" after ${MAX_RETRIES} attempts. ` +
    `This indicates an extremely unlikely collision — please retry.`
  );
}
