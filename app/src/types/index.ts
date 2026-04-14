// ============================================
// Shared TypeScript Interfaces
// Premium Car Dealership Platform
// ============================================

export interface IVehicle {
  _id: string;
  title: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  marketPrice: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Plug-in Hybrid' | 'CNG' | 'LPG' | 'Hydrogen';
  transmission: 'Automatic' | 'Manual' | 'CVT' | 'DCT' | 'AMT' | 'iMT' | 'Tiptronic';
  owner: '1st Owner' | '2nd Owner' | '3rd Owner' | '4th Owner+';
  mileage: number;
  registrationState: string;
  images: string[];
  features: string[];
  status: 'Available' | 'Sold';
  categoryId: string | ICategory;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILead {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  message: string;
  vehicleId?: string | IVehicle;
  status: 'New' | 'Contacted' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}

export interface IAdmin {
  _id: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filter types for vehicle search
export interface VehicleFilters {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  owner?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
