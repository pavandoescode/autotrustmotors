import Link from "next/link";
import { ArrowRight, BadgePercent, Truck, FileText, RotateCcw } from "lucide-react";
import HeroSection from "@/components/organisms/HeroSection";
import VehicleCard from "@/components/molecules/VehicleCard";
import WhyChooseUs from "@/components/organisms/WhyChooseUs";
import StatsCounter from "@/components/organisms/StatsCounter";
import Testimonials from "@/components/organisms/Testimonials";
import BrandCarousel from "@/components/molecules/BrandCarousel";
import { IVehicle } from "@/types";

import { getVehiclesData } from "@/lib/api/vehicles";

async function getLatestVehicles(): Promise<IVehicle[]> {
  const result = await getVehiclesData({ limit: 6, status: "Available" });
  return result.data || [];
}

const promoBenefits = [
  { icon: BadgePercent, text: "Finance from 8.5% p.a." },
  { icon: FileText,    text: "Same-Day RC Transfer" },
  { icon: Truck,       text: "Free Home Delivery" },
  { icon: RotateCcw,   text: "7-Day Return Policy" },
];

export default async function HomePage() {
  const vehicles = await getLatestVehicles();

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Benefits strip */}
      <div className="bg-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
            {promoBenefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                <span className="text-white text-xs sm:text-sm font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Cars */}
      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                Latest Cars in Stock
              </h2>
              <p className="text-text-secondary text-xs sm:text-sm mt-1">
                Fresh Arrivals <span className="text-text-muted mx-1.5">&bull;</span> 150-Point Inspected <span className="text-text-muted mx-1.5">&bull;</span> Ready For Test Drive
              </p>
            </div>
            <Link
              href="/cars"
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors shrink-0"
            >
              View All Cars <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-light rounded-xl border border-border-light">
              <p className="text-text-secondary text-base mb-1">No vehicles available yet</p>
              <p className="text-text-muted text-sm">Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us — blue bg section */}
      <WhyChooseUs />

      {/* Stats — dark navy strip */}
      <StatsCounter />

      {/* Testimonials */}
      <Testimonials />

      {/* Brand Carousel */}
      <BrandCarousel />

      {/* CTA — simple, clean */}
      <section className="py-10 sm:py-12 bg-surface-light border-t border-border-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
            Ready to Find Your Car?
          </h2>
          <p className="text-text-secondary text-sm max-w-xl mx-auto mb-6">
            Browse 500+ quality pre-owned vehicles. Transparent pricing. Easy financing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/cars"
              className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-hover transition-colors text-sm"
            >
              Browse Our Collection
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-border-light bg-white text-text-primary font-semibold rounded-lg hover:border-brand-primary/40 transition-colors text-sm"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
