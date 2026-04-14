import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Vehicle from '@/models/Vehicle';

export async function getCategoriesData() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Aggregate vehicle counts per category
    const counts = await Vehicle.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    for (const item of counts) {
      if (item._id) countMap[item._id.toString()] = item.count;
    }

    const data = categories.map((cat) => ({
      ...JSON.parse(JSON.stringify(cat)),
      vehicleCount: countMap[cat._id.toString()] || 0,
    }));

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('getCategoriesData error:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
