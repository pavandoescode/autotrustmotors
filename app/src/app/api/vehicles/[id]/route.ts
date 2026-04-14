import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import '@/models/Category'; // Required for .populate('categoryId')

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vehicles/[id] — Get single vehicle by _id or slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    // Try by _id first (admin edit), fall back to slug (public detail page)
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const vehicle = isObjectId
      ? await Vehicle.findById(id).populate('categoryId', 'name slug').lean()
      : await Vehicle.findOne({ slug: id }).populate('categoryId', 'name slug').lean();

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('GET /api/vehicles/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[id] — Update vehicle
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Use findById + save instead of findByIdAndUpdate so that
    // Mongoose pre('validate') middleware fires — this ensures
    // the slug is regenerated when title or year changes.
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    Object.assign(vehicle, body);
    await vehicle.save();

    return NextResponse.json({ success: true, data: vehicle.toObject() });
  } catch (error) {
    console.error('PUT /api/vehicles/[id] error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update vehicle';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

// DELETE /api/vehicles/[id] — Delete vehicle
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/vehicles/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
