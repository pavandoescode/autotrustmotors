import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fuel, Gauge, User, MapPin, Calendar, Cog, Tag, Shield,
  ChevronRight, MessageCircle, ArrowLeft
} from "lucide-react";
import ImageGallery from "@/components/organisms/ImageGallery";
import EMICalculator from "@/components/organisms/EMICalculator";
import LeadForm from "@/components/organisms/LeadForm";
import VehicleCard from "@/components/molecules/VehicleCard";

import { IVehicle } from "@/types";
import { formatPrice } from "@/lib/utils";
import VehiclePageTracker from "@/components/atoms/VehiclePageTracker";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}



async function getVehicle(id: string): Promise<IVehicle | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/vehicles/${id}`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function getRelatedVehicles(
  categoryId: string,
  brand: string,
  excludeId: string,
  price: number
): Promise<IVehicle[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const minTarget = 3;
    const existingIds = new Set([excludeId]);

    // First: fetch same category
    const catRes = await fetch(
      `${baseUrl}/api/vehicles?categoryId=${encodeURIComponent(categoryId)}&limit=4&status=Available`,
      { cache: "no-store" }
    );
    const catData = await catRes.json();
    const catVehicles: IVehicle[] = catData.success
      ? catData.data.filter((v: IVehicle) => !existingIds.has(v._id))
      : [];

    if (catVehicles.length >= minTarget) {
      return catVehicles.slice(0, minTarget);
    }

    catVehicles.forEach((v) => existingIds.add(v._id));

    // Second: fill with same brand
    const remaining1 = minTarget - catVehicles.length;
    const brandRes = await fetch(
      `${baseUrl}/api/vehicles?brand=${encodeURIComponent(brand)}&limit=${remaining1 + 3}&status=Available`,
      { cache: "no-store" }
    );
    const brandData = await brandRes.json();
    const brandVehicles: IVehicle[] = brandData.success
      ? brandData.data.filter((v: IVehicle) => !existingIds.has(v._id)).slice(0, remaining1)
      : [];

    const combined = [...catVehicles, ...brandVehicles];
    if (combined.length >= minTarget) {
      return combined.slice(0, minTarget);
    }

    brandVehicles.forEach((v) => existingIds.add(v._id));

    // Third: fill with similar-priced vehicles (±30% of price)
    const minPrice = Math.round(price * 0.7);
    const maxPrice = Math.round(price * 1.3);
    const remaining2 = minTarget - combined.length;

    const priceRes = await fetch(
      `${baseUrl}/api/vehicles?minPrice=${minPrice}&maxPrice=${maxPrice}&limit=${remaining2 + 3}&status=Available`,
      { cache: "no-store" }
    );
    const priceData = await priceRes.json();
    const priceVehicles: IVehicle[] = priceData.success
      ? priceData.data.filter((v: IVehicle) => !existingIds.has(v._id)).slice(0, remaining2)
      : [];

    return [...combined, ...priceVehicles];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) return { title: "Vehicle Not Found" };
  return {
    title: `${vehicle.title} - ${vehicle.year}`,
    description: `Buy ${vehicle.title} (${vehicle.year}) at ${formatPrice(vehicle.price)}. ${vehicle.fuelType}, ${vehicle.transmission}, ${vehicle.owner}. Quality pre-owned car.`,
  };
}

export default async function VehicleDetailsPage({ params }: VehiclePageProps) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) notFound();

  const vehicleCategoryId =
    typeof vehicle.categoryId === "object" && vehicle.categoryId !== null
      ? (vehicle.categoryId as { _id: string })._id
      : (vehicle.categoryId as string);

  const relatedVehicles = await getRelatedVehicles(vehicleCategoryId, vehicle.brand, vehicle._id, vehicle.price);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in the ${vehicle.title} (${vehicle.year}) priced at ${formatPrice(vehicle.price)}. Could you share more details?`
  );

  const specs = [
    { icon: Calendar, label: "Year", value: vehicle.year.toString() },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
    { icon: Cog, label: "Transmission", value: vehicle.transmission },
    { icon: User, label: "Ownership", value: vehicle.owner },
    { icon: Gauge, label: "KMs Driven", value: `${vehicle.mileage.toLocaleString()} km` },
    { icon: MapPin, label: "Reg. State", value: vehicle.registrationState },
  ];

  return (
    <>
      <VehiclePageTracker title={vehicle.title} year={vehicle.year} price={formatPrice(vehicle.price)} />
      {/* Breadcrumb */}
      <section className="bg-surface-light border-b border-border-light py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-text-muted hover:text-brand-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
            <Link href="/cars" className="text-text-muted hover:text-brand-primary transition-colors">Our Cars</Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-brand-primary font-medium truncate max-w-[150px] sm:max-w-[250px]">{vehicle.title}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 bg-surface-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
            {/* Gallery — always first */}
            <div className="md:col-span-3 order-1">
              <ImageGallery images={vehicle.images} title={vehicle.title} />
            </div>

            {/* Pricing Card — on mobile: order-2 (right after gallery), on desktop: right sidebar */}
            <div className="md:col-span-2 md:row-span-2 order-2">
              <div className="md:sticky md:top-28 space-y-6">
              {/* Pricing Card */}
              <div className="rounded-lg p-5 sm:p-6 bg-white border border-border-light">
                <div className="mb-5">
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight mb-1.5">{vehicle.model}</h1>
                  <p className="text-xs text-text-muted">
                    {vehicle.brand}  •  {vehicle.year} • {vehicle.transmission}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-5 pb-5 border-b border-border-light">
                  <div className="flex flex-col gap-0.5 mb-1.5">
                    {vehicle.marketPrice > vehicle.price && (
                      <span className="text-xs text-text-muted line-through">
                        Market: {formatPrice(vehicle.marketPrice)}
                      </span>
                    )}
                    <span className="text-3xl sm:text-[2.5rem] font-black text-brand-primary tracking-tight leading-none">
                      {formatPrice(vehicle.price)}
                    </span>
                  </div>
                  {vehicle.marketPrice > vehicle.price && (
                    <p className="text-xs text-action-green font-medium mt-2">
                      You save {formatPrice(vehicle.marketPrice - vehicle.price)}
                    </p>
                  )}
                </div>

                {/* Quick Specs */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {specs.slice(0, 4).map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div key={spec.label} className="flex items-center gap-2 py-1.5 text-xs text-text-secondary">
                        <Icon className="w-3.5 h-3.5 text-text-muted" />
                        <span>{spec.value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Status */}
                <div className={`flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold mb-5 tracking-wide uppercase transition-all duration-300 ${
                  vehicle.status === "Available"
                    ? "bg-action-green border border-action-green-hover text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]"
                    : "bg-surface-dark border border-border-dark text-surface-white"
                }`}>
                  {vehicle.status === "Available" && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                  )}
                  {vehicle.status === "Available" ? "Available Now" : "Sold Out"}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-all duration-200 text-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat via WhatsApp
                  </a>
                </div>


              </div>

              {/* Lead Form — hidden on mobile here, shown separately below specs */}
              <div className="hidden md:block">
                <LeadForm vehicleId={vehicle._id} vehicleTitle={vehicle.title} />
              </div>
              </div>
            </div>

            {/* Specs + Features + EMI — on mobile: order-3 (between pricing and lead form) */}
            <div className="md:col-span-3 order-3 space-y-8 px-2 md:px-0">
              {/* Specifications Table */}
              <div className="pt-6 md:pt-10">
                <h3 className="text-lg md:text-xl font-bold text-text-primary mb-6 border-b border-border-light pb-4">Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {specs.map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div key={spec.label} className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-4 rounded-xl bg-white border border-border-light hover:border-brand-gold transition-colors duration-300">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-light border border-border-light shrink-0">
                          <Icon className="w-4 h-4 text-text-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-text-muted font-medium mb-0.5 uppercase tracking-wider">{spec.label}</p>
                          <p className="text-sm font-bold text-text-primary truncate">{spec.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="pt-6 border-t border-border-light">
                  <h3 className="text-lg font-bold text-text-primary mb-5">Features & Highlights</h3>
                  <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2.5">
                    {vehicle.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-text-secondary py-1">
                        <Shield className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="font-sans">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMI Calculator */}
              <EMICalculator vehiclePrice={vehicle.price} />
            </div>

            {/* Lead Form — mobile only: order-4 (after specs, just where user decides) */}
            <div className="md:hidden order-4">
              <LeadForm vehicleId={vehicle._id} vehicleTitle={vehicle.title} />
            </div>
          </div>

          {/* Related Vehicles */}
          {relatedVehicles.length > 0 && (
            <div className="mt-20 pt-16 border-t border-border-light">
              <h2 className="text-xl font-bold text-text-primary mb-8">
                Similar <span className="text-brand-primary">Vehicles</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
                {relatedVehicles.map((v) => (
                  <VehicleCard key={v._id} vehicle={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
