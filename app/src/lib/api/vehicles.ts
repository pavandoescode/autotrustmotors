import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import '@/models/Category'; // Required for .populate('categoryId')

export interface GetVehiclesParams {
  page?: number | string;
  limit?: number | string;
  brand?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  status?: string | null;
  categoryId?: string;
  sort?: string;
  search?: string;
  slug?: string;
}

export async function getVehiclesData(params: GetVehiclesParams) {
  try {
    await dbConnect();

    const page = typeof params.page === 'string' ? parseInt(params.page) : (params.page || 1);
    const limit = typeof params.limit === 'string' ? parseInt(params.limit) : (params.limit || 12);
    const sort = params.sort || '-createdAt';
    
    // Build filter object
    const filter: Record<string, any> = {};

    if (params.brand && !params.search) {
      filter.brand = { $regex: params.brand, $options: 'i' };
    }
    if (params.model) {
      filter.model = { $regex: params.model, $options: 'i' };
    }
    if (params.fuelType) {
      filter.fuelType = params.fuelType;
    }
    if (params.transmission) {
      filter.transmission = params.transmission;
    }
    if (params.status) {
      filter.status = params.status;
    }
    if (params.categoryId) {
      filter.categoryId = params.categoryId;
    }
    if (params.slug) {
      filter.slug = params.slug;
    }

    if (params.minPrice || params.maxPrice) {
      filter.price = {};
      if (params.minPrice) {
        filter.price.$gte = typeof params.minPrice === 'string' ? parseInt(params.minPrice) : params.minPrice;
      }
      if (params.maxPrice) {
        filter.price.$lte = typeof params.maxPrice === 'string' ? parseInt(params.maxPrice) : params.maxPrice;
      }
    }

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { brand: { $regex: params.search, $options: 'i' } },
        { model: { $regex: params.search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Vehicle.countDocuments(filter);

    const vehicles = await Vehicle.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Map _id to string for component compatibility
    const serializedVehicles = JSON.parse(JSON.stringify(vehicles));

    return {
      success: true,
      data: serializedVehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('getVehiclesData error:', error);
    return {
      success: false,
      data: [],
      pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getVehicleBySlugOrId(identifier: string) {
  try {
    await dbConnect();
    
    // Check if identifier is an ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };

    const vehicle = await Vehicle.findOne(query)
      .populate('categoryId', 'name slug')
      .lean();

    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(vehicle)) 
    };
  } catch (error) {
    console.error('getVehicleBySlugOrId error:', error);
    return { success: false, error: 'Failed to fetch vehicle' };
  }
}
