import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Feature from '@/models/Feature';

export async function GET() {
  try {
    await dbConnect();
    const features = await Feature.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: features });
  } catch (error) {
    console.error('GET /api/features error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const name = (body.name || '').trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Feature name is required' },
        { status: 400 }
      );
    }

    // Check for duplicates (case-insensitive)
    const existing = await Feature.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Feature "${existing.name}" already exists` },
        { status: 409 }
      );
    }

    const feature = await Feature.create({ name });
    return NextResponse.json(
      { success: true, data: feature, message: 'Feature created successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/features error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create feature' },
      { status: 500 }
    );
  }
}
