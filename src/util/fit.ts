/**
 * Compute scaled image dimensions that fit within a max box while preserving
 * aspect ratio. Never enlarges past native size (max scale 1) so any text baked
 * into the image stays crisp.
 */
export function fitWithin(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number,
): { scale: number; width: number; height: number } {
  if (srcW <= 0 || srcH <= 0 || maxW <= 0 || maxH <= 0) {
    return { scale: 0, width: 0, height: 0 };
  }
  const scale = Math.min(maxW / srcW, maxH / srcH, 1);
  return { scale, width: srcW * scale, height: srcH * scale };
}
