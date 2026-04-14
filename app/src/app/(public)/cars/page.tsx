import { Suspense } from "react";
import type { Metadata } from "next";
import FilterBar from "@/components/molecules/FilterBar";
import VehicleCard from "@/components/molecules/VehicleCard";
import { IVehicle } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Cars",
  description: "Browse our quality collection of pre-owned vehicles. Filter by brand, fuel type, price range, and more.",
};

interface StockPageProps {
  searchParams: Promise<{
    brand?: string;
    fuelType?: string;
    transmission?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
    sort?: string;
  }>;
}

import { getVehiclesData } from "@/lib/api/vehicles";

async function getVehicles(params: Record<string, string | undefined>) {
  const query = { ...params };
  if (!query.status) query.status = "Available";
  if (!query.limit) query.limit = "12";
  if (!query.sort) query.sort = "-createdAt";
  
  return await getVehiclesData(query);
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams;
  const result = await getVehicles(params);
  const vehicles: IVehicle[] = result.data || [];
  const pagination = result.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 };

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams();
    if (params.brand) p.set("brand", params.brand);
    if (params.fuelType) p.set("fuelType", params.fuelType);
    if (params.transmission) p.set("transmission", params.transmission);
    if (params.minPrice) p.set("minPrice", params.minPrice);
    if (params.maxPrice) p.set("maxPrice", params.maxPrice);
    if (params.search) p.set("search", params.search);
    if (params.sort) p.set("sort", params.sort);
    p.set("page", page.toString());
    return `/cars?${p.toString()}`;
  };

  const hasActiveFilters = params.brand || params.fuelType || params.transmission ||
    params.minPrice || params.maxPrice || params.search;

  return (
    <>
      {/* Page Header */}
      <section className="bg-[#1a2d5c] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Pre-Owned Cars
            {pagination.total > 0 && (
              <span className="ml-2 text-base font-normal text-blue-200">
                ({pagination.total} cars available)
              </span>
            )}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-2">
            150-Point Inspected <span className="mx-1.5 opacity-50">&bull;</span> Verified History <span className="mx-1.5 opacity-50">&bull;</span> Transparent Pricing
          </p>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-6 bg-surface-light min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <Suspense fallback={null}>
            <FilterBar
              initialBrand={params.brand}
              initialFuelType={params.fuelType}
              initialMinPrice={params.minPrice}
              initialMaxPrice={params.maxPrice}
              initialTransmission={params.transmission}
              initialSearch={params.search}
            />
          </Suspense>

          {/* Results meta row */}
          <div className="flex flex-wrap items-center justify-between mt-5 mb-5 gap-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-text-secondary">
                <span className="font-bold text-text-primary">{pagination.total}</span> cars found
                {hasActiveFilters && (
                  <span className="text-brand-primary ml-1">(filtered)</span>
                )}
              </p>
            </div>
            <Link
              href="/cars"
              className={`text-xs text-text-muted hover:text-brand-primary transition-colors ${!hasActiveFilters ? "invisible" : ""}`}
            >
              Clear all filters
            </Link>
          </div>

          {/* Vehicle Grid */}
          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-border-light">
              <p className="text-text-secondary text-base mb-1">No vehicles found</p>
              <p className="text-text-muted text-sm">Try adjusting your filters or search terms.</p>
              <Link href="/cars" className="inline-block mt-4 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors">
                View All Cars
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-8">
              {pagination.page > 1 && (
                <Link
                  href={buildPageUrl(pagination.page - 1)}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 border border-border-light bg-white rounded-lg text-xs sm:text-sm text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Link>
              )}

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - pagination.page) <= 2
                )
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-text-muted">...</span>
                    )}
                    <Link
                      href={buildPageUrl(p)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        p === pagination.page
                          ? "bg-brand-primary text-white"
                          : "border border-border-light bg-white text-text-secondary hover:border-brand-primary hover:text-brand-primary"
                      }`}
                    >
                      {p}
                    </Link>
                  </span>
                ))}

              {pagination.page < pagination.totalPages && (
                <Link
                  href={buildPageUrl(pagination.page + 1)}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 border border-border-light bg-white rounded-lg text-xs sm:text-sm text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
