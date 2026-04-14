import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import '@/models/Category'; // Required for .populate('categoryId')

// GET /api/vehicles — List vehicles with filters & pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const sort = searchParams.get('sort') || '-createdAt';
    const search = searchParams.get('search');

    const slug = searchParams.get('slug');

    // Build filter object
    const filter: Record<string, unknown> = {};

    // When the user is actively searching, don't restrict by brand —
    // the search itself already matches across title, brand and model.
    if (brand && !search) filter.brand = { $regex: brand, $options: 'i' };
    if (model) filter.model = { $regex: model, $options: 'i' };
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;
    if (slug) filter.slug = slug;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = parseInt(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = parseInt(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
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

    return NextResponse.json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/vehicles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/vehicles — Create a new vehicle (admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const vehicle = await Vehicle.create(body);

    return NextResponse.json(
      { success: true, data: vehicle },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/vehicles error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create vehicle';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
