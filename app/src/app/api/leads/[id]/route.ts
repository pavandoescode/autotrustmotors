import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/leads/[id] — Update lead status (admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const lead = await Lead.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('PUT /api/leads/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 400 }
    );
  }
}

// DELETE /api/leads/[id] — Delete a lead (admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
