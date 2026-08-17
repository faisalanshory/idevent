"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface Props {
  images: string[];
  title: string;
}

export default function EventGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images.length) return null;

  const prev = () => setLightbox(i => (i! - 1 + images.length) % images.length);
  const next = () => setLightbox(i => (i! + 1) % images.length);

  return (
    <>
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-4">Galeri Event</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className={`relative overflow-hidden rounded-xl bg-slate-100 group ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              style={{ aspectRatio: i === 0 ? "16/9" : "4/3" }}
            >
              <img
                src={img}
                alt={`${title} — foto ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-black text-xl">+{images.length - 4}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setLightbox(null)}
          >
            <X className="h-8 w-8" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-bold">
            {lightbox + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={e => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[85vh] px-16"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={images[lightbox]}
              alt={`${title} ${lightbox + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* Next */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={e => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox(i); }}
                className={`h-12 w-16 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-80"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
