"use client";

import { useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import Image from "@/components/atoms/CloudinaryImage";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Touch swipe state for main gallery
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch swipe state for fullscreen modal
  const [fsDragOffset, setFsDragOffset] = useState(0);
  const [fsDragging, setFsDragging] = useState(false);
  const fsTouchStartX = useRef<number | null>(null);
  const fsTouchEndX = useRef<number | null>(null);
  const fsContainerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-surface-light rounded-lg flex items-center justify-center">
        <span className="text-text-muted">No images available</span>
      </div>
    );
  }

  const hasMultipleImages = images.length > 1;

  const goToPrev = () => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNext = () => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // --- Main gallery touch handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (touchStartX.current !== null) {
      const diff = touchStartX.current - e.touches[0].clientX;
      const containerWidth = containerRef.current?.offsetWidth || 1;
      setDragOffset(-(diff / containerWidth) * 100);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragOffset(0);

    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const SWIPE_THRESHOLD = 50;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [images.length]);

  // --- Fullscreen touch handlers ---
  const handleFsTouchStart = useCallback((e: React.TouchEvent) => {
    fsTouchStartX.current = e.touches[0].clientX;
    fsTouchEndX.current = null;
    setFsDragging(true);
    setFsDragOffset(0);
  }, []);

  const handleFsTouchMove = useCallback((e: React.TouchEvent) => {
    fsTouchEndX.current = e.touches[0].clientX;
    if (fsTouchStartX.current !== null) {
      const diff = fsTouchStartX.current - e.touches[0].clientX;
      const containerWidth = fsContainerRef.current?.offsetWidth || 1;
      setFsDragOffset(-(diff / containerWidth) * 100);
    }
  }, []);

  const handleFsTouchEnd = useCallback(() => {
    setFsDragging(false);
    setFsDragOffset(0);

    if (fsTouchStartX.current === null || fsTouchEndX.current === null) return;
    const diff = fsTouchStartX.current - fsTouchEndX.current;
    const SWIPE_THRESHOLD = 50;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }

    fsTouchStartX.current = null;
    fsTouchEndX.current = null;
  }, [images.length]);

  return (
    <>
      <div className="space-y-3">
        {/* Main Image — Touch swipeable carousel */}
        <div
          ref={containerRef}
          className="relative aspect-[16/10] rounded-lg overflow-hidden bg-surface-light group"
          onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
          onTouchMove={hasMultipleImages ? handleTouchMove : undefined}
          onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
        >
          <div
            className="flex h-full"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(calc(-${activeIndex * (100 / images.length)}% + ${isDragging ? dragOffset / images.length : 0}%))`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative h-full shrink-0"
                style={{ width: `${100 / images.length}%` }}
              >
                <Image
                  src={img}
                  alt={`${title} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows — desktop hover only */}
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <Expand className="w-4 h-4" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full font-sans">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {hasMultipleImages && (
          <div className="flex gap-2 overflow-x-auto px-1 pt-1 pb-1" style={{ scrollbarWidth: "none" }}>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 md:w-24 md:h-16 rounded-lg overflow-hidden transition-all duration-200 bg-surface-light ${
                  idx === activeIndex
                    ? "ring-2 ring-brand-primary ring-offset-1 ring-offset-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal — Touch swipeable */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            ✕
          </button>

          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10 hidden sm:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10 hidden sm:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            ref={fsContainerRef}
            className="relative w-full max-w-5xl aspect-[16/10] mx-2 sm:mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={hasMultipleImages ? handleFsTouchStart : undefined}
            onTouchMove={hasMultipleImages ? handleFsTouchMove : undefined}
            onTouchEnd={hasMultipleImages ? handleFsTouchEnd : undefined}
          >
            <div
              className="flex h-full"
              style={{
                width: `${images.length * 100}%`,
                transform: `translateX(calc(-${activeIndex * (100 / images.length)}% + ${fsDragging ? fsDragOffset / images.length : 0}%))`,
                transition: fsDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-full shrink-0"
                  style={{ width: `${100 / images.length}%` }}
                >
                  <Image
                    src={img}
                    alt={`${title} - Full ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              ))}
            </div>

            {/* Fullscreen Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full font-sans">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
