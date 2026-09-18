"use client";

import { useState } from "react";
import { Thumb } from "@/components/ui";

export function ReviewPhotos({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;
  const i = open ?? 0;
  return (
    <>
      <div className="review-photos">
        {photos.map((src, idx) => (
          <button key={src + idx} type="button" onClick={() => setOpen(idx)}>
            <Thumb src={src} alt="" />
          </button>
        ))}
      </div>
      {open != null ? (
        <div className="dim center" onClick={() => setOpen(null)}>
          <div className="lightbox" onClick={(e) => e.stopPropagation()}>
            <img src={photos[i]} alt="" />
            {photos.length > 1 ? (
              <div className="lightbox-nav">
                <button type="button" onClick={() => setOpen((i - 1 + photos.length) % photos.length)}>
                  ‹
                </button>
                <span>
                  {i + 1}/{photos.length}
                </span>
                <button type="button" onClick={() => setOpen((i + 1) % photos.length)}>
                  ›
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
