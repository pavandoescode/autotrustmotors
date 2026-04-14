"use client";

import { useState } from "react";
import Link from "next/link";
import { Gauge, ArrowRight } from "lucide-react";
import Image from "@/components/atoms/CloudinaryImage";
import { IVehicle } from "@/types";
import { formatPrice } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: IVehicle;
  priority?: boolean;
}

const fuelColors: Record<string, { bg: string; text: string }> = {
  Petrol:           { bg: "bg-green-100",  text: "text-green-700" },
  Diesel:           { bg: "bg-blue-100",   text: "text-blue-700" },
  Electric:         { bg: "bg-teal-100",   text: "text-teal-700" },
  Hybrid:           { bg: "bg-cyan-100",   text: "text-cyan-700" },
  "Plug-in Hybrid": { bg: "bg-cyan-100",   text: "text-cyan-700" },
  CNG:              { bg: "bg-amber-100",  text: "text-amber-800" },
  LPG:              { bg: "bg-amber-100",  text: "text-amber-700" },
};

export default function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth > 0) {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  const isSold = vehicle.status === "Sold";
  const savings =
    vehicle.marketPrice && vehicle.marketPrice > vehicle.price
      ? vehicle.marketPrice - vehicle.price
      : 0;
  const fuelStyle = fuelColors[vehicle.fuelType] ?? { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    // `relative` is required so the stretched ::after on the title Link fills this card
    <div className="group relative bg-white border-2 border-border-light rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-brand-primary/40 hover:-translate-y-0.5">

      {/* Images (Scrollable Slider) */}
      <div className="relative aspect-[16/10] bg-surface-light overflow-hidden z-10 group/slider">
        {vehicle.images && vehicle.images.length > 0 ? (
          <>
            <div 
              className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth h-full w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={handleScroll}
            >
              {vehicle.images.map((img, index) => (
                <Link
                  key={index}
                  href={`/cars/${vehicle.slug}`}
                  className="relative w-full h-full shrink-0 snap-center snap-always block"
                >
                  <Image
                    src={img}
                    alt={`${vehicle.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority && index === 0}
                  />
                </Link>
              ))}
            </div>
            
            {/* Dots Indicator (Visual hint) */}
            {vehicle.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 z-20 pointer-events-none sm:hidden opacity-100 transition-opacity duration-300">
                {vehicle.images.slice(0, 5).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                      activeIndex === i ? "w-3 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
                {vehicle.images.length > 5 && <div className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm opacity-50 scale-75" />}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted bg-surface-light text-sm pointer-events-none">
            No Image
          </div>
        )}

        {/* Sold overlay text (no pointer events to not block swipe) */}
        {isSold && (
          <div className="absolute inset-0 bg-white/65 flex items-center justify-center z-10 pointer-events-none">
            <span className="px-4 py-1.5 bg-gray-800 text-white text-xs font-bold rounded uppercase tracking-widest leading-none">
              Sold
            </span>
          </div>
        )}

        {savings > 0 && !isSold && (
          <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 bg-action-green text-white text-[11px] font-bold rounded-md shadow-sm pointer-events-none">
            Save {formatPrice(savings, { short: true })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Title — ::after stretched to fill the whole card = entire card is clickable */}
        <div className="mb-2">
          <h3 className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1 leading-tight">
            <Link
              href={`/cars/${vehicle.slug}`}
              className="after:absolute after:inset-0 focus:outline-none"
            >
              {vehicle.title}
            </Link>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {vehicle.year} &bull; {vehicle.registrationState}
          </p>
        </div>

        {/* Specs row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${fuelStyle.bg} ${fuelStyle.text}`}>
            {vehicle.fuelType}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {vehicle.transmission}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
            <Gauge className="w-3.5 h-3.5" />
            {vehicle.mileage.toLocaleString()} km
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-light my-3" />

        {/* Price + action buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {vehicle.marketPrice > vehicle.price && (
              <span className="text-xs text-text-muted line-through block leading-tight">
                {formatPrice(vehicle.marketPrice, { short: true })}
              </span>
            )}
            <span className="text-xl font-black text-text-primary tracking-tight leading-none block">
              {formatPrice(vehicle.price)}
            </span>
          </div>

          {/* Buttons — 40px+ touch targets */}
          <div className="relative z-[1] flex items-center gap-2 shrink-0">
            {!isSold && (
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999"}?text=${encodeURIComponent(
                  `Hi, I'm interested in the ${vehicle.title} (${vehicle.year}) priced at ${formatPrice(vehicle.price)}. Please share more details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-lg hover:bg-[#25D366] hover:text-white transition-all duration-200"
                title="Chat on WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </a>
            )}
            <Link
              href={`/cars/${vehicle.slug}`}
              className="relative z-[1] flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-primary-hover transition-colors"
            >
              View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
