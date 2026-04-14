import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import '@/models/Vehicle'; // Required for .populate('vehicleId')

export interface GetLeadsParams {
  page?: number | string;
  limit?: number | string;
  status?: string;
  search?: string;
}

export async function getLeadsData(params: GetLeadsParams) {
  try {
    await dbConnect();

    const page = typeof params.page === 'string' ? parseInt(params.page) : (params.page || 1);
    const limit = typeof params.limit === 'string' ? parseInt(params.limit) : (params.limit || 20);
    const status = params.status;
    const search = params.search;

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
    const statusCountsAgg = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts: Record<string, number> = { New: 0, Contacted: 0, Resolved: 0 };
    for (const item of statusCountsAgg) {
      if (item._id) statusCounts[item._id] = item.count;
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(leads)),
      statusCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('getLeadsData error:', error);
    return {
      success: false,
      data: [],
      statusCounts: { New: 0, Contacted: 0, Resolved: 0 },
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
