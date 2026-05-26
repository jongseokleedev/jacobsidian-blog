/**
 * Buckets a raw view count into a display string.
 * Returns null if count is below 100 (not shown publicly).
 */
export function bucketViewCount(count: number): string | null {
  if (count < 100) return null;

  if (count < 1000) {
    const decimal = Math.floor(count / 100) / 10;
    return `${decimal}k+`;
  }

  if (count < 10000) {
    const k = Math.floor(count / 1000);
    return `${k}k+`;
  }

  const k = Math.floor(count / 10000) * 10;
  return `${k}k+`;
}
