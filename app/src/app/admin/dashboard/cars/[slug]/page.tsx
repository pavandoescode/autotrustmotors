"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import VehicleForm from "../_components/VehicleForm";

interface EditVehiclePageProps {
  params: Promise<{ slug: string }>;
}

export default function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { slug } = use(params);

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/vehicles?slug=${encodeURIComponent(slug)}&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        const vehicle = data.data?.[0];
        if (vehicle?._id) {
          setVehicleId(vehicle._id);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-6xl font-bold text-border-light mb-4">404</p>
        <p className="text-xl font-semibold text-text-primary mb-2">Vehicle not found</p>
        <p className="text-sm text-text-muted">
          No vehicle with slug <span className="font-mono bg-surface-light px-2 py-0.5 rounded">{slug}</span> exists.
        </p>
      </div>
    );
  }

  return <VehicleForm editId={vehicleId} />;
}
