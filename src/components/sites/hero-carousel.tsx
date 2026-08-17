"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const count = slides.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % count), [count]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + count) % count), [count]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const onTouchStart = (e: React.TouchEvent) => setStartX(e.touches[0].clientX);
  const onMouseDown = (e: React.MouseEvent) => { setStartX(e.clientX); setIsDragging(true); };
  const onDragEnd = (endX: number) => {
    if (startX === null) return;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setStartX(null); setIsDragging(false);
  };
  const onTouchEnd = (e: React.TouchEvent) => onDragEnd(e.changedTouches[0].clientX);
  const onMouseUp = (e: React.MouseEvent) => { if (isDragging) onDragEnd(e.clientX); };

  if (!slides.length) return null;

  return (
    <section
      className="relative overflow-hidden select-none"
      style={{ touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full">
            {/* Background Image */}
            <div className="relative h-[55vh] min-h-[360px] md:h-[70vh] max-h-[680px] overflow-hidden">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                draggable="false"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-end pb-16 md:pb-20 px-6 md:px-14 lg:px-20">
                <div className="max-w-2xl space-y-4">
                  {slide.subtitle && (
                    <p className="text-sm font-bold text-white/70 uppercase tracking-widest">
                      {slide.subtitle}
                    </p>
                  )}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg">
                    {slide.title}
                  </h1>
                  {slide.ctaLabel && slide.ctaUrl && (
                    <div className="pt-2">
                      <Link
                        href={slide.ctaUrl}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-sm text-white site-bg-primary shadow-xl hover:scale-105 hover:shadow-primary/40 transition-all duration-300"
                      >
                        {slide.ctaLabel}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow Navigation (desktop) */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition flex items-center justify-center shadow"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition flex items-center justify-center shadow"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
