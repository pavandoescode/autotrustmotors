"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

const brands = [
  "All Brands", "Maruti Suzuki", "Hyundai", "Toyota", "Honda",
  "Kia", "Tata", "Mahindra", "MG", "Skoda", "Volkswagen",
  "Renault", "Nissan", "Ford", "Jeep", "Citroen",
];

const fuelTypes = ["All Fuel Types", "Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid", "CNG", "LPG"];
const transmissions = ["All", "Automatic", "Manual", "CVT", "DCT", "AMT", "iMT"];

interface FilterBarProps {
  initialBrand?: string;
  initialFuelType?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialTransmission?: string;
  initialSearch?: string;
}

export default function FilterBar({
  initialBrand = "",
  initialFuelType = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialTransmission = "",
  initialSearch = "",
}: FilterBarProps) {
  const router = useRouter();
  const [brand, setBrand] = useState(initialBrand);
  const [fuelType, setFuelType] = useState(initialFuelType);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [transmission, setTransmission] = useState(initialTransmission);
  const [search, setSearch] = useState(initialSearch);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (brand && brand !== "All Brands") params.set("brand", brand);
    if (fuelType && fuelType !== "All Fuel Types") params.set("fuelType", fuelType);
    if (transmission && transmission !== "All") params.set("transmission", transmission);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (search) params.set("search", search);
    router.push(`/cars?${params.toString()}`);
  };

  const clearFilters = () => {
    setBrand("");
    setFuelType("");
    setMinPrice("");
    setMaxPrice("");
    setTransmission("");
    setSearch("");
    router.push("/cars");
  };

  const hasActiveFilters = brand || fuelType || minPrice || maxPrice || transmission || search;

  return (
    <div className="bg-white border border-border-light rounded-xl p-4">
      {/* Row 1: Search + Key Filters + Search Button */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-end">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search brand, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-10 pr-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-colors"
          />
        </div>

        {/* Brand */}
        <div className="relative">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="appearance-none pl-4 pr-9 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors cursor-pointer min-w-[130px]"
          >
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>

        {/* Fuel Type */}
        <div className="relative">
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="appearance-none pl-4 pr-9 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors cursor-pointer min-w-[130px]"
          >
            {fuelTypes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>

        {/* More Filters toggle */}
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={`flex items-center gap-1.5 px-4 py-3 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            showMoreFilters
              ? "bg-brand-primary text-white border-brand-primary"
              : "bg-surface-light border-border-light text-text-secondary hover:border-brand-primary"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          More
        </button>

        {/* Search Button */}
        <button
          onClick={applyFilters}
          className="px-5 py-3 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Row 2: Extra Filters (transmission + price range) */}
      {showMoreFilters && (
        <div className="mt-4 pt-4 border-t border-border-light animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Transmission */}
            <div className="relative">
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full appearance-none pl-4 pr-9 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
              >
                {transmissions.map((t) => (
                  <option key={t} value={t}>{t === "All" ? "All Transmissions" : t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>

            {/* Min Price */}
            <input
              type="number"
              placeholder="Min Price (₹)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Max Price (₹)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
            />

            {/* Clear button */}
            <div className="flex items-center">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-primary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
