import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Vehicle from '@/models/Vehicle';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/categories/[id] — Rename category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Title-case the new name
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

    // Check for duplicate (case-insensitive), excluding self
    const existing = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Generate new slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true, runValidators: true }
    ).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get vehicle count for the updated category
    const vehicleCount = await Vehicle.countDocuments({ categoryId: id });

    return NextResponse.json({
      success: true,
      data: { ...category, vehicleCount },
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update category';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

// DELETE /api/categories/[id] — Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    // Check if any vehicles are linked to this category
    const vehicleCount = await Vehicle.countDocuments({ categoryId: id });

    if (vehicleCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: ${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''} assigned to this category. Reassign them first.`,
        },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
