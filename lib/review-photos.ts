import photoMap from "./data/review-photo-map.json";

const LOCAL_PHOTOS = photoMap as Record<string, string>;

export function driveId(src: string) {
  return src.match(/(?:id=|\/d\/)([A-Za-z0-9_-]+)/)?.[1] ?? null;
}

export function localizeReviewPhoto(src: string) {
  const id = driveId(src);
  if (!id) return src;
  const file = LOCAL_PHOTOS[id];
  return file ? `/vion/reviews/${file}` : src;
}

export function localizeReviewPhotos(photos: string[] | null | undefined) {
  return (photos ?? []).filter(Boolean).map(localizeReviewPhoto);
}
