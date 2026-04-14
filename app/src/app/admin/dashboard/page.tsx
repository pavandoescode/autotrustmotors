import {
  Car, Users, Inbox, TrendingUp, Tag, ArrowRight,
  Phone, Mail, Clock, CheckCircle, BarChart3,
} from "lucide-react";
import Link from "next/link";

// ── Data fetching ────────────────────────────────────────────────────
import { getVehiclesData } from "@/lib/api/vehicles";
import { getLeadsData } from "@/lib/api/leads";
import { getCategoriesData } from "@/lib/api/categories";

async function getDashboardStats() {
  const [vehiclesResult, availableResult, soldResult, leadsResult, categoriesResult] = await Promise.all([
    getVehiclesData({ limit: 1 }),
    getVehiclesData({ limit: 1, status: "Available" }),
    getVehiclesData({ limit: 1, status: "Sold" }),
    getLeadsData({ limit: 5 }),
    getCategoriesData(),
  ]);

  const recentLeads = leadsResult.data || [];
  const statusCounts = leadsResult.statusCounts || { New: 0, Contacted: 0, Resolved: 0 };

  return {
    totalVehicles: vehiclesResult.pagination?.total || 0,
    availableVehicles: availableResult.pagination?.total || 0,
    soldVehicles: soldResult.pagination?.total || 0,
    totalLeads: leadsResult.pagination?.total || 0,
    newLeads: statusCounts.New || 0,
    contactedLeads: statusCounts.Contacted || 0,
    resolvedLeads: statusCounts.Resolved || 0,
    recentLeads,
    totalCategories: categoriesResult.success ? categoriesResult.data.length : 0,
  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const formatDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short",
    });
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Welcome back! Here&apos;s an overview of your dealership.
        </p>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="space-y-5">

          {/* ── Stat Cards ─────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Vehicles */}
            <Link
              href="/admin/dashboard/cars"
              className="bg-surface-white border border-border-light rounded-2xl p-5 shadow-card card-hover group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">Total Vehicles</span>
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Car className="w-4 h-4 text-brand-primary" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">{stats.totalVehicles}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-text-secondary">
                  <span className="font-semibold text-brand-primary">{stats.availableVehicles}</span> available
                </span>
                <span className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">{stats.soldVehicles}</span> sold
                </span>
              </div>
            </Link>

            {/* Total Leads */}
            <Link
              href="/admin/dashboard/leads"
              className="bg-surface-white border border-border-light rounded-2xl p-5 shadow-card card-hover group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">Total Leads</span>
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Users className="w-4 h-4 text-brand-primary" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">{stats.totalLeads}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-text-secondary">
                  <span className="font-semibold text-brand-primary">{stats.newLeads}</span> new
                </span>
                <span className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">{stats.contactedLeads}</span> contacted
                </span>
              </div>
            </Link>

            {/* New Leads */}
            <Link
              href="/admin/dashboard/leads?status=New"
              className="bg-surface-white border border-border-light rounded-2xl p-5 shadow-card card-hover group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">New Leads</span>
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Inbox className="w-4 h-4 text-brand-primary" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">{stats.newLeads}</p>
              <p className="text-xs text-text-secondary mt-2">
                {stats.newLeads > 0 ? "Needs attention" : "All caught up"}
              </p>
            </Link>

            {/* Categories */}
            <Link
              href="/admin/dashboard/categories"
              className="bg-surface-white border border-border-light rounded-2xl p-5 shadow-card card-hover group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">Categories</span>
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Tag className="w-4 h-4 text-brand-primary" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">{stats.totalCategories}</p>
              <p className="text-xs text-text-secondary mt-2">Vehicle body types</p>
            </Link>
          </div>

          {/* ── Recent Inquiries ────────────────────────── */}
          <div className="bg-surface-white border border-border-light rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
                  <Users className="w-3 h-3" />
                </div>
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  Recent Inquiries
                </h2>
              </div>
              <Link
                href="/admin/dashboard/leads"
                className="text-xs text-brand-primary hover:text-brand-primary-hover font-medium transition-colors flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {stats.recentLeads.length > 0 ? (
              <ul className="divide-y divide-border-light">
                {stats.recentLeads.map((lead: {
                  _id: string;
                  name: string;
                  email: string;
                  phone: string;
                  status: string;
                  message: string;
                  vehicleId?: { title: string } | null;
                  createdAt: string;
                }) => (
                  <li key={lead._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-primary/[0.03] transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-brand-primary">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary truncate">{lead.name}</p>
                        {lead.vehicleId && typeof lead.vehicleId === "object" && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-medium rounded-full truncate max-w-[160px]">
                            <Car className="w-3 h-3 shrink-0" />
                            {lead.vehicleId.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </span>
                        {lead.email && (
                          <span className="hidden md:flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status + Time */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-text-muted hidden md:block">{formatDate(lead.createdAt)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        lead.status === "New" ? "status-new" :
                        lead.status === "Contacted" ? "status-contacted" :
                        "status-resolved"
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-6 h-6 text-brand-primary" />
                </div>
                <p className="text-sm font-medium text-text-primary">No inquiries yet</p>
                <p className="text-xs text-text-muted mt-1">
                  They&apos;ll show up here once customers reach out.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
