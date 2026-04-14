"use client";

/* eslint-disable @next/next/no-img-element */

// Per-logo scale overrides for SVGs with excess internal whitespace
const scaleOverrides: Record<number, string> = {
  6: "scale-125",
};

// Selected indices for mid-tier brands (Toyota, Hyundai, Kia, Honda, Tata, Suzuki, etc.)
// Assumes SVG assets 1-8 are mapped to these; adjust IDs based on actual asset names if needed.
const midTierBrandIds = [1, 2, 3, 4, 5, 7, 8, 9];

const brandLogos = midTierBrandIds
  .map((id) => ({
    id,
    src: `/brands/${id}.svg`,
    alt: `Brand ${id}`,
    extraScale: scaleOverrides[id] || "",
  }));

export default function BrandCarousel() {
  return (
    <section className="py-10 sm:py-12 bg-surface-light border-y border-border-light relative overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          Brands We Deal In
        </h2>
        <p className="text-text-secondary text-sm mt-1">All major brands, certified quality</p>
      </div>

      {/* Scrolling Brand Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee container */}
        <div className="flex animate-marquee">
          {/* First set */}
          <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-3 sm:px-4">
            {brandLogos.map((logo) => (
              <div
                key={logo.id}
                className="flex items-center justify-center w-28 h-20 sm:w-36 sm:h-24 rounded-lg border border-border-light bg-white hover:border-brand-primary/30 hover:shadow-sm transition-all duration-300 cursor-default group p-3 sm:p-4"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${logo.extraScale}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-3 sm:px-4" aria-hidden="true">
            {brandLogos.map((logo) => (
              <div
                key={`dup-${logo.id}`}
                className="flex items-center justify-center w-28 h-20 sm:w-36 sm:h-24 rounded-lg border border-border-light bg-white hover:border-brand-primary/30 hover:shadow-sm transition-all duration-300 cursor-default group p-3 sm:p-4"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={`w-full h-full object-contain ${logo.extraScale}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
