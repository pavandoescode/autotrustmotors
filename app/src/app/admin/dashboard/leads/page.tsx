"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, Mail, Phone, Search, X, Trash2,
  Users, UserCheck, CheckCircle, AlertCircle,
  Info, Check, ChevronDown, ChevronUp,
  MessageSquare, Car, Clock, Inbox,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────
interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "New" | "Contacted" | "Resolved";
  vehicleId?: { title: string; brand: string; model: string; images?: string[] } | null;
  createdAt: string;
}

type StatusFilter = "" | "New" | "Contacted" | "Resolved";
type LeadStatus = "New" | "Contacted" | "Resolved";

const STATUSES: LeadStatus[] = ["New", "Contacted", "Resolved"];

const statusColors: Record<string, string> = {
  New: "status-new",
  Contacted: "status-contacted",
  Resolved: "status-resolved",
};

// ── Delete Confirmation Modal ────────────────────────────────────────
interface DeleteModalProps {
  lead: Lead;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

function DeleteConfirmModal({ lead, onClose, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm">
      <div className="bg-surface-white rounded-2xl border border-border-light shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-text-primary font-sans">Delete Lead</h3>
          <p className="text-sm text-text-muted mt-1">
            This action cannot be undone.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 p-3 bg-surface-light rounded-xl border border-border-light">
            <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{lead.name}</p>
              <p className="text-xs text-text-muted">{lead.phone}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary rounded-xl border border-border-light hover:bg-surface-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold bg-brand-dark text-surface-white rounded-xl hover:bg-brand-dark/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 btn-primary"
          >
            {deleting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Deleting…</>
            ) : (
              <><Trash2 className="w-3.5 h-3.5" />Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Dropdown ──────────────────────────────────────────────────
interface StatusDropdownProps {
  current: LeadStatus;
  onUpdate: (status: LeadStatus) => void;
  updating: boolean;
}

function StatusDropdown({ current, onUpdate, updating }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={updating}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[current]} transition-colors`}
      >
        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        {current}
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-50 bg-surface-white border border-border-light rounded-xl shadow-lg overflow-hidden min-w-[140px]">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (s !== current) onUpdate(s);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${
                  s === current
                    ? "bg-brand-primary/10 text-brand-primary font-medium"
                    : "text-text-primary hover:bg-surface-light"
                }`}
              >
                {s}
                {s === current && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({ New: 0, Contacted: 0, Resolved: 0 });

  // ── Debounce search ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch leads ─────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter) params.set("status", filter);
      if (searchDebounced) params.set("search", searchDebounced);
      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        if (data.statusCounts) setStatusCounts(data.statusCounts);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, searchDebounced]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Update status ───────────────────────────────────────────────
  const updateStatus = async (id: string, status: LeadStatus) => {
    setUpdating(id);
    setError("");
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l._id === id ? { ...l, status } : l))
        );
        // Update counts locally
        const oldLead = leads.find((l) => l._id === id);
        if (oldLead) {
          setStatusCounts((prev) => ({
            ...prev,
            [oldLead.status]: Math.max(0, (prev[oldLead.status] || 0) - 1),
            [status]: (prev[status] || 0) + 1,
          }));
        }
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  // ── Delete lead ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        const removedStatus = deleteTarget.status;
        setLeads((prev) => prev.filter((l) => l._id !== deleteTarget._id));
        setStatusCounts((prev) => ({
          ...prev,
          [removedStatus]: Math.max(0, (prev[removedStatus] || 0) - 1),
        }));
        setDeleteTarget(null);
        if (expandedId === deleteTarget._id) setExpandedId(null);
      } else {
        setError(data.error || "Failed to delete lead");
        setDeleteTarget(null);
      }
    } catch {
      setError("Failed to delete lead");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────
  const totalLeads = (statusCounts.New || 0) + (statusCounts.Contacted || 0) + (statusCounts.Resolved || 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Leads & Inquiries</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Track and manage customer inquiries from your website
        </p>
      </div>

      {/* ── Error Toast ────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-surface-white border border-brand-primary/30 rounded-xl shadow-card animate-slide-down">
          <AlertCircle className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="text-sm text-text-secondary flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Two-column layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ════════════════════════════════════════════════
            LEFT: Lead Management
        ════════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* ── Toolbar: Search + Filters ──────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="lead-search-input"
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-surface-white border border-border-light rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-primary placeholder:text-text-muted transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 -mb-1">
              {(["", "New", "Contacted", "Resolved"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  id={`filter-${s || "all"}`}
                  onClick={() => setFilter(s)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl font-medium transition-colors whitespace-nowrap ${
                    filter === s
                      ? "bg-brand-primary text-white"
                      : "bg-surface-white border border-border-light text-text-secondary hover:border-brand-primary"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Lead List card ─────────────────────────── */}
          <div className="bg-surface-white border border-border-light rounded-2xl shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                <p className="text-sm text-text-muted">Loading leads…</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-6 h-6 text-brand-primary" />
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {search || filter ? "No leads match your filters" : "No leads yet"}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {search || filter
                    ? "Try adjusting your search or clearing filters"
                    : "Inquiries from your website will appear here"}
                </p>
                {(search || filter) && (
                  <button
                    onClick={() => { setSearch(""); setFilter(""); }}
                    className="mt-3 text-xs text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {leads.map((lead) => {
                  const isExpanded = expandedId === lead._id;
                  return (
                    <div
                      key={lead._id}
                      className={`transition-colors ${isExpanded ? "bg-brand-primary/[0.03]" : "hover:bg-brand-primary/[0.02]"}`}
                    >
                      {/* ── Row header (always visible) ─── */}
                      <div
                        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : lead._id)}
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-brand-primary">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Name + contact */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-text-primary truncate">{lead.name}</h3>
                            {lead.vehicleId && typeof lead.vehicleId === "object" && (
                              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full truncate max-w-[180px]">
                                <Car className="w-3 h-3 shrink-0" />
                                {lead.vehicleId.title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted">
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 shrink-0" /> {lead.phone}
                            </span>
                            {lead.email && (
                              <span className="hidden sm:flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 shrink-0" /> {lead.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: status + time + expand */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-text-muted hidden md:block">{timeAgo(lead.createdAt)}</span>
                          <StatusDropdown
                            current={lead.status}
                            onUpdate={(status) => updateStatus(lead._id, status)}
                            updating={updating === lead._id}
                          />
                          <button
                            className="p-1 text-text-muted hover:text-text-primary transition-colors"
                            onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : lead._id); }}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* ── Expanded detail ─────────────── */}
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-0 ml-[52px] animate-slide-down">
                          {/* Message */}
                          {lead.message && (
                            <div className="mb-3">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <MessageSquare className="w-3 h-3 text-text-muted" />
                                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Message</span>
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed bg-surface-light rounded-xl p-3 border border-border-light">
                                {lead.message}
                              </p>
                            </div>
                          )}

                          {/* Vehicle if mobile */}
                          {lead.vehicleId && typeof lead.vehicleId === "object" && (
                            <div className="sm:hidden mb-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full">
                                <Car className="w-3 h-3" />
                                {lead.vehicleId.title}
                              </span>
                            </div>
                          )}

                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 text-xs text-text-muted">
                              <Clock className="w-3 h-3" />
                              {formatDate(lead.createdAt)}
                            </span>
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="w-3 h-3" />
                                Send Email
                              </a>
                            )}
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-3 h-3" />
                              Call
                            </a>
                            <div className="flex-1" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(lead); }}
                              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-brand-dark/5"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            RIGHT: Sticky Sidebar
        ════════════════════════════════════════════════ */}
        <div className="space-y-4 xl:sticky xl:top-24">

          {/* ── Leads Overview (dark) ──────────────────── */}
          <div className="bg-brand-dark rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
              Leads Overview
            </h3>
            <div className="space-y-3">
              {/* Total */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-sm text-white/70">Total Leads</span>
                </div>
                <span className="text-lg font-bold text-surface-white">{totalLeads}</span>
              </div>

              <div className="h-px bg-white/5" />

              {/* New */}
              <button
                onClick={() => setFilter(filter === "New" ? "" : "New")}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                    <Inbox className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className={`text-sm transition-colors ${filter === "New" ? "text-brand-primary font-medium" : "text-white/70 group-hover:text-white/80"}`}>
                    New
                  </span>
                </div>
                <span className={`text-sm font-bold transition-colors ${filter === "New" ? "text-brand-primary" : "text-surface-white"}`}>
                  {statusCounts.New || 0}
                </span>
              </button>

              <div className="h-px bg-white/5" />

              {/* Contacted */}
              <button
                onClick={() => setFilter(filter === "Contacted" ? "" : "Contacted")}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                    <UserCheck className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className={`text-sm transition-colors ${filter === "Contacted" ? "text-brand-primary font-medium" : "text-white/70 group-hover:text-white/80"}`}>
                    Contacted
                  </span>
                </div>
                <span className={`text-sm font-bold transition-colors ${filter === "Contacted" ? "text-brand-primary" : "text-surface-white"}`}>
                  {statusCounts.Contacted || 0}
                </span>
              </button>

              <div className="h-px bg-white/5" />

              {/* Resolved */}
              <button
                onClick={() => setFilter(filter === "Resolved" ? "" : "Resolved")}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                    <CheckCircle className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className={`text-sm transition-colors ${filter === "Resolved" ? "text-brand-primary font-medium" : "text-white/70 group-hover:text-white/80"}`}>
                    Resolved
                  </span>
                </div>
                <span className={`text-sm font-bold transition-colors ${filter === "Resolved" ? "text-brand-primary" : "text-surface-white"}`}>
                  {statusCounts.Resolved || 0}
                </span>
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          lead={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
