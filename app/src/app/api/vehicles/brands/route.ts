import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';

// GET /api/vehicles/brands — List distinct brands that have vehicles
export async function GET() {
  try {
    await dbConnect();

    const brands: string[] = await Vehicle.distinct('brand');
    brands.sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error('GET /api/vehicles/brands error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
