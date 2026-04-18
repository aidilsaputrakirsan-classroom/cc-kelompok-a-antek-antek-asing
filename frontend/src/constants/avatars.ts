// --- AVATAR CONSTANTS ---
export const AVATAR_COUNT = 10;
export const DEFAULT_AVATAR_INDEX = 0;

// Avatar configuration with metadata
export const avatars = Array.from({ length: AVATAR_COUNT }, (_, i) => ({
  id: i,
  src: `/avatars/avatar-${i}.png`,
  label: `Avatar ${i + 1}`,
}));

/**
 * Get avatar path by index
 * Falls back to default avatar if index is invalid
 */
export const getAvatarPath = (index?: number | null): string => {
  if (typeof index !== "number" || index < 0 || index >= AVATAR_COUNT) {
    return `/avatars/avatar-${DEFAULT_AVATAR_INDEX}.png`;
  }
  return `/avatars/avatar-${index}.png`;
};

/**
 * Get default avatar path
 */
export const getDefaultAvatarPath = (): string => {
  return `/avatars/avatar-${DEFAULT_AVATAR_INDEX}.png`;
};

/**
 * Validate avatar index (frontend validation)
 */
export const validateAvatarIndex = (index: unknown): boolean => {
  if (typeof index !== "number") return false;
  return Number.isInteger(index) && index >= 0 && index < AVATAR_COUNT;
};
