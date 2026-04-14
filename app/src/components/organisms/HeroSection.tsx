"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Phone } from "lucide-react";

const brands = [
  "All Brands", "Maruti Suzuki", "Hyundai", "Toyota", "Honda",
  "Kia", "Tata", "Mahindra", "MG", "Skoda", "Volkswagen",
];

const fuelTypes = ["All Fuel Types", "Petrol", "Diesel", "Electric", "Hybrid", "CNG"];

const priceRanges = [
  { label: "Any Budget", value: "" },
  { label: "Under ₹5 Lakh", value: "0-500000" },
  { label: "₹5L – ₹10L", value: "500000-1000000" },
  { label: "₹10L – ₹20L", value: "1000000-2000000" },
  { label: "₹20L – ₹35L", value: "2000000-3500000" },
  { label: "Above ₹35L", value: "3500000-" },
];

const quickFilters: { label: string; params: Record<string, string> }[] = [
  { label: "SUV", params: { search: "SUV" } },
  { label: "Sedan", params: { search: "Sedan" } },
  { label: "Hatchback", params: { search: "Hatchback" } },
  { label: "Under ₹5L", params: { maxPrice: "500000" } },
  { label: "Diesel", params: { fuelType: "Diesel" } },
  { label: "Automatic", params: { transmission: "Automatic" } },
];

export default function HeroSection() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand && brand !== "All Brands") params.set("brand", brand);
    if (fuelType && fuelType !== "All Fuel Types") params.set("fuelType", fuelType);
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    router.push(`/cars?${params.toString()}`);
  };

  const handleQuickFilter = (params: Record<string, string>) => {
    const p = new URLSearchParams(params);
    router.push(`/cars?${p.toString()}`);
  };

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1a2d5c 0%, #1e3a6e 100%)" }}>
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.25) 0%, transparent 70%)" }} />
      {/* Hero body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Headline */}
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 tracking-tight">
            500+ Quality Pre-Owned Cars
          </h1>
          <p className="text-[#93b4dc] text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            150-Point Inspected <span className="text-white/30 mx-2">&bull;</span> Verified History <span className="text-white/30 mx-2">&bull;</span> Transparent Pricing
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-xl p-4 sm:p-5 max-w-3xl mx-auto shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {/* Brand */}
            <div className="relative col-span-1">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>

            {/* Fuel */}
            <div className="relative col-span-1">
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
              >
                {fuelTypes.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>

            {/* Budget */}
            <div className="relative col-span-2 sm:col-span-1">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
              >
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-hover transition-all text-sm"
          >
            <Search className="w-5 h-5" />
            Search Available Cars
          </button>
        </div>

        {/* Spacer (quick filters removed) */}
        <div className="mt-5 h-8" />

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-8 pt-8 border-t border-white/10">
          {[
            { value: "500+", label: "Cars in Stock" },
            { value: "150-pt", label: "Inspection" },
            { value: "Same Day", label: "RC Transfer" },
            { value: "8+ Yrs", label: "Experience" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-[#93b4dc] uppercase mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Phone CTA */}
        <div className="text-center mt-6">
          <a
            href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 99999 99999"}`}
            className="inline-flex items-center gap-2 text-[#93b4dc] hover:text-white text-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Questions? Call us:{" "}
            <span className="font-semibold text-white">
              {process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 99999 99999"}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
