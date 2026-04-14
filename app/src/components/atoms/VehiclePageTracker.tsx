"use client";

import { useEffect } from "react";
import { useVehicleContext } from "@/lib/vehicleContext";

interface VehiclePageTrackerProps {
  title: string;
  year: number;
  price: string;
}

export default function VehiclePageTracker({ title, year, price }: VehiclePageTrackerProps) {
  const setCurrentVehicle = useVehicleContext((s) => s.setCurrentVehicle);
  const clearCurrentVehicle = useVehicleContext((s) => s.clearCurrentVehicle);

  useEffect(() => {
    setCurrentVehicle(title, year, price);
    return () => clearCurrentVehicle();
  }, [title, year, price, setCurrentVehicle, clearCurrentVehicle]);

  return null;
}
