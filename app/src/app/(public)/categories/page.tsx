import type { Metadata } from "next";
import Link from "next/link";
import { Car, ArrowRight } from "lucide-react";
import { ICategory } from "@/types";
import { getCategoriesData } from "@/lib/api/categories";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse our vehicle categories — from sedans and SUVs to hatchbacks and sports cars.",
};

interface CategoryWithCount extends ICategory {
  vehicleCount: number;
}

async function getCategories() {
  const result = await getCategoriesData();
  // Only return categories that have at least one vehicle
  return (result.data || []).filter((c: any) => c.vehicleCount > 0);
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <section className="bg-surface-light border-b border-border-light py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Browse by Category
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto text-sm">
            Find the vehicle type that suits your needs.
          </p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/cars?categoryId=${cat._id}`}
                className="group p-6 bg-surface-light rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/20 block border border-transparent"
              >
                <div className="w-12 h-12 bg-brand-primary/[0.07] rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/[0.06] transition-colors duration-300" />
                  <Car className="w-6 h-6 text-brand-primary relative z-10" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 transition-colors duration-200">
                  {cat.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  Explore our {cat.name} collection.{" "}
                  <span className="text-text-muted">({cat.vehicleCount} {cat.vehicleCount === 1 ? "vehicle" : "vehicles"})</span>
                </p>
                <span className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
