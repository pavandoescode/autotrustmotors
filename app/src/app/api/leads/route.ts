import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import '@/models/Vehicle'; // Required for .populate('vehicleId')


// POST /api/leads — Create a new lead (public)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const lead = await Lead.create(body);

    return NextResponse.json(
      { success: true, data: lead, message: 'Inquiry submitted successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/leads error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to submit inquiry';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

// GET /api/leads — List all leads (admin) with statusCounts and search
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
      .populate('vehicleId', 'title brand model images')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate status counts (unfiltered) for sidebar stats
    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = { New: 0, Contacted: 0, Resolved: 0 };
    for (const item of statusCounts) {
      if (item._id) counts[item._id] = item.count;
    }

    return NextResponse.json({
      success: true,
      data: leads,
      statusCounts: counts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
