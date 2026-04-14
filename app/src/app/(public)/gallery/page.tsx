import type { Metadata } from "next";
import { IVehicle } from "@/types";
import { Camera } from "lucide-react";
import Image from "@/components/atoms/CloudinaryImage";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse our stunning gallery of quality pre-owned vehicles. See the finest cars from top brands in our showroom.",
};

async function getAllVehicleImages(): Promise<{ url: string; title: string }[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/vehicles?limit=50`, { cache: "no-store" });
    const data = await res.json();
    if (!data.success) return [];
    const images: { url: string; title: string }[] = [];
    data.data.forEach((v: IVehicle) => {
      v.images.forEach((img) => {
        images.push({ url: img, title: `${v.year} ${v.title}` });
      });
    });
    return images;
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const images = await getAllVehicleImages();

  return (
    <>
      <section className="bg-surface-light border-b border-border-light py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Vehicle Gallery
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto text-sm">
            Photos of cars currently in our showroom.
          </p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {images.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-6 space-y-3 sm:space-y-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="break-inside-avoid group relative rounded-xl overflow-hidden bg-surface-light border border-border-light"
                >
                  <div className="relative aspect-[4/3] bg-surface-light">
                    <Image
                      src={img.url}
                      alt={img.title}
                      fill
                      loading={idx < 6 ? "eager" : "lazy"}
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-white text-base font-medium">{img.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface-light rounded-lg border border-border-light">
              <Camera className="w-12 h-12 text-brand-primary mx-auto mb-4 opacity-50" />
              <p className="text-text-primary font-bold text-lg mb-2">Gallery is being updated</p>
              <p className="text-text-secondary text-base">
                Check back soon for photos of our collection!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
