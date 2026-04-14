import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/Brand';

// GET /api/brands — List all brands (sorted alphabetically)
export async function GET() {
  try {
    await dbConnect();
    const brands = await Brand.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error('GET /api/brands error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// POST /api/brands — Create a new brand
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Title-case: capitalize first letter of each word
    const name = (body.name || '')
      .trim()
      .split(/\s+/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate (case-insensitive)
    const existing = await Brand.findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This brand already exists' },
        { status: 409 }
      );
    }

    const brand = await Brand.create({ name });

    return NextResponse.json(
      { success: true, data: brand, message: 'Brand created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/brands error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create brand';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
