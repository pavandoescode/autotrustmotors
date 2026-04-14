import { NextRequest, NextResponse } from 'next/server';
import { getVehiclesData } from '@/lib/api/vehicles';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';

// GET /api/vehicles — List vehicles with filters & pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const result = await getVehiclesData(params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch vehicles' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
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
