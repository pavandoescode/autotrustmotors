import { create } from 'zustand';

interface VehicleContextState {
  /** Title of the vehicle currently being viewed (e.g. "Genesis G80 3.5T Sport") */
  currentVehicleTitle: string | null;
  /** Year of the vehicle currently being viewed */
  currentVehicleYear: number | null;
  /** Formatted price string */
  currentVehiclePrice: string | null;
  setCurrentVehicle: (title: string, year: number, price: string) => void;
  clearCurrentVehicle: () => void;
}

export const useVehicleContext = create<VehicleContextState>((set) => ({
  currentVehicleTitle: null,
  currentVehicleYear: null,
  currentVehiclePrice: null,
  setCurrentVehicle: (title, year, price) =>
    set({ currentVehicleTitle: title, currentVehicleYear: year, currentVehiclePrice: price }),
  clearCurrentVehicle: () =>
    set({ currentVehicleTitle: null, currentVehicleYear: null, currentVehiclePrice: null }),
}));
