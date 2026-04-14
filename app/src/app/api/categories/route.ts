import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Vehicle from '@/models/Vehicle';

// GET /api/categories — List all categories with vehicle counts
export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find().sort({ name: 1 }).lean();

    // Aggregate vehicle counts per category in a single query
    const counts = await Vehicle.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    for (const item of counts) {
      if (item._id) countMap[item._id.toString()] = item.count;
    }

    const data = categories.map((cat) => ({
      ...cat,
      vehicleCount: countMap[cat._id.toString()] || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories — Create a new category
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
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This category already exists' },
        { status: 409 }
      );
    }

    const category = await Category.create({ name });

    return NextResponse.json(
      { success: true, data: { ...category.toObject(), vehicleCount: 0 }, message: 'Category created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/categories error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create category';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
