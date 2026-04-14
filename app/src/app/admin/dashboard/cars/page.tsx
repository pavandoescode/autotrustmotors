"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, Loader2, X,
  MoreVertical, Fuel, Gauge, User, Zap,
  ChevronDown, Check, AlertTriangle, SlidersHorizontal,
} from "lucide-react";
import Image from "@/components/atoms/CloudinaryImage";
import { IVehicle } from "@/types";
import { formatPrice } from "@/lib/utils";

/* ── Inline Status Dropdown ────────────────────────────────────────── */
const STATUS_OPTIONS = ["Available", "Sold"] as const;

interface StatusDropdownProps {
  value: string;
  vehicleId: string;
  vehicleTitle: string;
  isUpdating: boolean;
  onRequestChange: (id: string, newStatus: string, title: string) => void;
  compact?: boolean;
}

function StatusDropdown({
  value,
  vehicleId,
  vehicleTitle,
  isUpdating,
  onRequestChange,
  compact = false,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSold = value === "Sold";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isUpdating) {
    return <Loader2 className={`${compact ? "w-4 h-4" : "w-5 h-5"} animate-spin text-brand-primary`} />;
  }

  return (
    <div ref={containerRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
          compact
            ? "px-2.5 py-1 rounded-lg text-[11px] font-medium"
            : "px-3 py-1.5 rounded-xl text-xs font-medium"
        } bg-surface-light border border-border-light hover:border-brand-primary focus:outline-none focus:border-brand-primary`}
      >
        {/* Status dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isSold ? "bg-text-muted" : "bg-brand-primary"
          }`}
        />
        <span className={isSold ? "text-text-muted" : "text-text-primary"}>
          {value}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-text-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1.5 w-36 bg-surface-white border border-border-light rounded-xl shadow-luxury overflow-hidden animate-slide-down">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setOpen(false);
                if (opt !== value) {
                  onRequestChange(vehicleId, opt, vehicleTitle);
                }
              }}
              className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between ${
                opt === value
                  ? "bg-brand-primary/10 text-brand-primary font-medium"
                  : "text-text-primary hover:bg-surface-light"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    opt === "Sold" ? "bg-text-muted" : "bg-brand-primary"
                  }`}
                />
                {opt}
              </span>
              {opt === value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 10;

const FUEL_OPTIONS = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"] as const;
const TRANSMISSION_OPTIONS = ["Automatic", "Manual", "CVT", "DCT", "AMT"] as const;
const OWNER_OPTIONS = ["1st Owner", "2nd Owner", "3rd Owner", "4th Owner+"] as const;
const SORT_OPTIONS = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Price: Low → High", value: "price" },
  { label: "Price: High → Low", value: "-price" },
  { label: "Mileage: Low → High", value: "mileage" },
  { label: "Year: Newest", value: "-year" },
] as const;

interface QueryState {
  search: string;
  page: number;
  status: string;
  fuelType: string;
  transmission: string;
  owner: string;
  sort: string;
}

/** Swap icon based on fuel type */
function SpecFuelIcon({ type }: { type: string }) {
  if (type === "Electric" || type === "Hybrid") return <Zap className="w-3 h-3" />;
  return <Fuel className="w-3 h-3" />;
}

export default function VehiclesPage() {
  const router = useRouter();

  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState<QueryState>({
    search: "", page: 1, status: "Available", fuelType: "", transmission: "", owner: "", sort: "-createdAt",
  });
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ id: string; newStatus: string; title: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; image?: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Close three-dot menu on outside click — uses data attribute to find any menu container
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-container]")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce search → reset page (preserve filters)
  useEffect(() => {
    const t = setTimeout(() => setQuery((prev) => ({ ...prev, search: inputValue, page: 1 })), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  const fetchVehicles = useCallback(async (q: QueryState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        page: q.page.toString(),
        sort: q.sort,
      });
      if (q.search.trim()) params.set("search", q.search.trim());
      if (q.status) params.set("status", q.status);
      if (q.fuelType) params.set("fuelType", q.fuelType);
      if (q.transmission) params.set("transmission", q.transmission);
      if (q.owner) params.set("owner", q.owner);
      const res = await fetch(`/api/vehicles?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const activeFilterCount = [query.status, query.fuelType, query.transmission, query.owner].filter(Boolean).length;

  const setFilter = (key: keyof QueryState, value: string) =>
    setQuery((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value, page: 1 }));

  const clearAllFilters = () =>
    setQuery((prev) => ({ ...prev, status: "", fuelType: "", transmission: "", owner: "", sort: "-createdAt", page: 1 }));

  useEffect(() => { fetchVehicles(query); }, [query, fetchVehicles]);

  const goToPage = (p: number) =>
    setQuery((q) => ({ ...q, page: Math.max(1, Math.min(p, totalPages)) }));

  const requestDelete = (e: React.MouseEvent, id: string, title: string, image?: string) => {
    e.stopPropagation();
    setOpenMenu(null);
    setDeleteConfirm({ id, title, image });
  };

  const confirmDeleteVehicle = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setDeleting(id);
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchVehicles(query);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setStatusUpdate(null);
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setVehicles((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: newStatus as IVehicle['status'] } : v))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - query.page) <= 1
  );

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vehicles</h1>
          <p className="text-sm text-text-muted mt-1">
            {total > 0 ? `${total} vehicle${total !== 1 ? "s" : ""} in inventory` : "Manage your vehicle inventory"}
          </p>
        </div>
        <Link
          href="/admin/dashboard/cars/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Link>
      </div>

      {/* ── Search & Filters Card ─────────────────────────── */}
      <div className="bg-surface-white border border-border-light rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 space-y-4">
          {/* ── Search Input ── */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center pointer-events-none">
              <Search className="w-4 h-4 text-brand-primary" />
            </div>
            <input
              type="text"
              placeholder="Type to search by title, brand, or model..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pl-14 pr-11 py-3.5 bg-surface-light/60 border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-surface-white transition-all duration-300"
            />
            {loading && inputValue && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary animate-spin" />
            )}
            {!loading && inputValue && (
              <button
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-brand-dark/5 hover:bg-brand-dark/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-all duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ── Filter Bar ── */}
          <div className="pt-3 border-t border-border-light">

            {/* ── Mobile: compact row with toggle ── */}
            <div className="flex sm:hidden items-center gap-2">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 shrink-0 ${
                  showFilters || activeFilterCount > 0
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-surface-light border-border-light text-text-secondary"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`} />
              </button>

              {/* Status pills — always visible on mobile */}
              <div className="flex items-center gap-1.5">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = query.status === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setFilter("status", opt)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-brand-primary text-white shadow-[0_2px_8px_rgba(200,162,83,0.3)]"
                          : "bg-surface-light border border-border-light text-text-secondary"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-brand-dark" : opt === "Sold" ? "bg-text-muted" : "bg-brand-primary"
                      }`} />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Mobile: expanded filter grid ── */}
            {showFilters && (
              <div className="sm:hidden mt-3 pt-3 border-t border-border-light/60 animate-slide-down">
                <div className="grid grid-cols-2 gap-2">
                  {/* Fuel Type */}
                  <select
                    value={query.fuelType}
                    onChange={(e) => setQuery((prev) => ({ ...prev, fuelType: e.target.value, page: 1 }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 bg-surface-light appearance-none cursor-pointer pr-8 focus:outline-none ${
                      query.fuelType
                        ? "border-brand-primary text-brand-primary bg-brand-primary/[0.06]"
                        : "border-border-light text-text-secondary"
                    }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                  >
                    <option value="">Fuel Type</option>
                    {FUEL_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  {/* Transmission */}
                  <select
                    value={query.transmission}
                    onChange={(e) => setQuery((prev) => ({ ...prev, transmission: e.target.value, page: 1 }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 bg-surface-light appearance-none cursor-pointer pr-8 focus:outline-none ${
                      query.transmission
                        ? "border-brand-primary text-brand-primary bg-brand-primary/[0.06]"
                        : "border-border-light text-text-secondary"
                    }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                  >
                    <option value="">Transmission</option>
                    {TRANSMISSION_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {/* Owner */}
                  <select
                    value={query.owner}
                    onChange={(e) => setQuery((prev) => ({ ...prev, owner: e.target.value, page: 1 }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 bg-surface-light appearance-none cursor-pointer pr-8 focus:outline-none ${
                      query.owner
                        ? "border-brand-primary text-brand-primary bg-brand-primary/[0.06]"
                        : "border-border-light text-text-secondary"
                    }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                  >
                    <option value="">Owner</option>
                    {OWNER_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>

                  {/* Sort */}
                  <select
                    value={query.sort}
                    onChange={(e) => setQuery((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold border border-border-light text-text-secondary bg-surface-light appearance-none cursor-pointer pr-8 focus:outline-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>

                  {/* Clear All */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="col-span-2 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-muted border border-dashed border-border-light hover:border-brand-primary hover:text-brand-primary transition-all duration-300"
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Desktop: inline row (sm+) ── */}
            <div className="hidden sm:flex flex-wrap items-center gap-2.5">
              {/* Filter Label */}
              <div className="flex items-center gap-2 mr-1">
                <div className="w-7 h-7 rounded-lg bg-brand-dark/[0.06] flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary" />
                </div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filters</span>

              </div>

              <span className="w-px h-6 bg-border-light" />

              {/* Status pills */}
              <div className="flex items-center gap-1.5">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = query.status === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setFilter("status", opt)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-brand-primary text-white shadow-[0_2px_8px_rgba(200,162,83,0.3)]"
                          : "bg-surface-light border border-border-light text-text-secondary hover:border-brand-primary/50 hover:bg-brand-primary/[0.04] hover:text-text-primary"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? "bg-brand-dark"
                          : opt === "Sold" ? "bg-text-muted" : "bg-brand-primary"
                      }`} />
                      {opt}
                    </button>
                  );
                })}
              </div>

              <span className="w-px h-6 bg-border-light" />

              {/* Fuel Type */}
              <select
                value={query.fuelType}
                onChange={(e) => setQuery((prev) => ({ ...prev, fuelType: e.target.value, page: 1 }))}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 bg-surface-light appearance-none cursor-pointer pr-8 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 ${
                  query.fuelType
                    ? "border-brand-primary text-brand-primary bg-brand-primary/[0.06]"
                    : "border-border-light text-text-secondary hover:border-brand-primary/50"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="">Fuel Type</option>
                {FUEL_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              {/* Transmission */}
              <select
                value={query.transmission}
                onChange={(e) => setQuery((prev) => ({ ...prev, transmission: e.target.value, page: 1 }))}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 bg-surface-light appearance-none cursor-pointer pr-8 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 ${
                  query.transmission
                    ? "border-brand-primary text-brand-primary bg-brand-primary/[0.06]"
                    : "border-border-light text-text-secondary hover:border-brand-primary/50"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="">Transmission</option>
                {TRANSMISSION_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Owner */}
              <select
                value={query.owner}
                onChange={(e) => setQuery((prev) => ({ ...prev, owner: e.target.value, page: 1 }))}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 bg-surface-light appearance-none cursor-pointer pr-8 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 ${
                  query.owner
                    ? "border-brand-primary text-brand-primary bg-brand-primary/[0.06]"
                    : "border-border-light text-text-secondary hover:border-brand-primary/50"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="">Owner</option>
                {OWNER_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <span className="w-px h-6 bg-border-light" />

              {/* Sort By */}
              <select
                value={query.sort}
                onChange={(e) => setQuery((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-light text-text-secondary transition-all duration-300 bg-surface-light appearance-none cursor-pointer pr-8 hover:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {/* Clear All */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-text-muted border border-dashed border-border-light hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/[0.04] transition-all duration-300"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Vehicles Card ────────────────────────────────────── */}
      <div className="bg-surface-white border border-border-light rounded-2xl shadow-card overflow-hidden">

        {/* Loading (initial) */}
        {loading && vehicles.length === 0 ? (
          <div className="p-20 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <span className="text-sm text-text-muted">Loading vehicles...</span>
          </div>

        ) : vehicles.length === 0 ? (
          <div className="p-20 text-center">
            <p className="font-semibold text-text-secondary mb-1">
              {query.search ? `No results for "${query.search}"` : "No vehicles yet"}
            </p>
            <p className="text-sm text-text-muted">
              {query.search ? "Try a different search term." : "Add your first vehicle to get started."}
            </p>
          </div>

        ) : (
          <>
            {/* List with loading overlay */}
            <div className={`transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : ""}`}>

              {/* Column header row */}
              <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_160px_110px_160px] items-center px-4 sm:px-6 py-3 bg-brand-dark/[0.06] border-b-2 border-border-light">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Vehicle</span>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider hidden lg:block">Price</span>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider hidden lg:block text-center">Status</span>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider text-right hidden lg:block">Actions</span>
              </div>

              {/* Vehicle rows */}
              <div className="divide-y divide-border-light">
                {vehicles.map((v) => {
                  const savings = v.marketPrice > v.price ? v.marketPrice - v.price : 0;
                  const isSold = v.status === "Sold";

                  return (
                    <div
                      key={v._id}
                      onClick={() => {
                        if (openMenu === v._id) return;
                        router.push(`/admin/dashboard/cars/${v.slug}`);
                      }}
                      className={`group grid grid-cols-1 lg:grid-cols-[1fr_160px_110px_160px] items-center px-4 sm:px-6 py-4 hover:bg-brand-primary/[0.04] transition-all duration-200 cursor-pointer border-l-[3px] border-transparent hover:border-brand-primary ${openMenu === v._id ? "relative z-40" : ""}`}
                    >
                      {/* ── Col 1: Image + Info ── */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">

                        {/* Thumbnail */}
                        <div className="relative w-16 h-12 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-surface-light shrink-0 border border-border-light">
                          {v.images?.[0] ? (
                            <Image
                              src={v.images[0]}
                              alt={v.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                              No image
                            </div>
                          )}
                          {/* Sold overlay */}
                          {isSold && (
                            <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-brand-primary tracking-widest">SOLD</span>
                            </div>
                          )}
                        </div>

                        {/* Text block */}
                        <div className="min-w-0 flex-1">
                          {/* Title */}
                          <p className="font-semibold text-sm sm:text-[15px] text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1 leading-snug">
                            {v.title}
                          </p>
                          {/* Brand · Year */}
                          <p className="text-xs text-text-muted mt-0.5">{v.brand} · {v.year}</p>

                          {/* Spec chips — hidden on mobile, shown sm+ */}
                          <div className="hidden sm:flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-dark/[0.05] rounded-md text-[11px] font-medium text-text-secondary">
                              <SpecFuelIcon type={v.fuelType} />
                              {v.fuelType}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-dark/[0.05] rounded-md text-[11px] font-medium text-text-secondary">
                              <Gauge className="w-3 h-3" />
                              {v.mileage.toLocaleString()} km
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-dark/[0.05] rounded-md text-[11px] font-medium text-text-secondary">
                              <User className="w-3 h-3" />
                              {v.owner}
                            </span>
                          </div>

                          {/* Mobile/tablet: price on left, status + menu pushed right */}
                          <div className="flex items-center mt-2 lg:hidden">
                            <span className="font-bold text-brand-primary text-sm">
                              {formatPrice(v.price, { short: true })}
                            </span>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <StatusDropdown
                                value={v.status}
                                vehicleId={v._id}
                                vehicleTitle={v.title}
                                isUpdating={updatingId === v._id}
                                onRequestChange={(id, newStatus, title) =>
                                  setStatusUpdate({ id, newStatus, title })
                                }
                                compact
                              />
                              {/* Mobile 3-dot menu */}
                              <div
                                className="relative"
                                data-menu-container
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenu((prev) => (prev === v._id ? null : v._id));
                                  }}
                                  className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-brand-dark/5 rounded-lg transition-colors"
                                  aria-label="More actions"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {/* Mobile Dropdown */}
                                {openMenu === v._id && (
                                  <div
                                    className="absolute right-0 top-full mt-1.5 w-48 bg-surface-white border border-border-light rounded-xl shadow-luxury z-50 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Link
                                      href={`/cars/${v.slug}`}
                                      target="_blank"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenu(null);
                                      }}
                                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-brand-primary/[0.05] hover:text-text-primary transition-colors"
                                    >
                                      <Eye className="w-4 h-4 text-brand-primary" />
                                      View on Site
                                    </Link>
                                    <div className="h-px bg-border-light mx-3" />
                                    <button
                                      onClick={(e) => requestDelete(e, v._id, v.title, v.images?.[0])}
                                      disabled={deleting === v._id}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-brand-dark/[0.04] hover:text-text-primary transition-colors disabled:opacity-40"
                                    >
                                      {deleting === v._id
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Trash2 className="w-4 h-4" />
                                      }
                                      Delete Vehicle
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Col 2: Price (desktop) ── */}
                      <div className="hidden lg:flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
                        <p className="text-lg font-bold text-brand-primary leading-tight">
                          {formatPrice(v.price, { short: true })}
                        </p>
                        {savings > 0 && (
                          <>
                            <p className="text-xs text-text-muted line-through mt-0.5">
                              {formatPrice(v.marketPrice, { short: true })}
                            </p>
                            <span className="inline-block mt-1 text-[11px] font-semibold text-brand-primary/80">
                              ↓ Save {formatPrice(savings, { short: true })}
                            </span>
                          </>
                        )}
                      </div>

                      {/* ── Col 3: Status (desktop) ── */}
                      <div className="hidden lg:flex items-center justify-center">
                        <StatusDropdown
                          value={v.status}
                          vehicleId={v._id}
                          vehicleTitle={v.title}
                          isUpdating={updatingId === v._id}
                          onRequestChange={(id, newStatus, title) =>
                            setStatusUpdate({ id, newStatus, title })
                          }
                        />
                      </div>

                      {/* ── Col 4: Actions (desktop only) ── */}
                      <div
                        className="hidden lg:flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Primary CTA: Edit button */}
                        <Link
                          href={`/admin/dashboard/cars/${v.slug}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-dark text-surface-white text-xs font-semibold rounded-lg hover:bg-brand-dark/80 transition-colors whitespace-nowrap"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Link>

                        {/* Secondary: three-dot menu */}
                        <div
                          className="relative"
                          data-menu-container
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu((prev) => (prev === v._id ? null : v._id));
                            }}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-brand-dark/5 rounded-lg transition-colors"
                            aria-label="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown */}
                          {openMenu === v._id && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface-white border border-border-light rounded-xl shadow-luxury z-50 overflow-hidden">
                              {/* View on site */}
                              <Link
                                href={`/cars/${v.slug}`}
                                target="_blank"
                                onClick={() => setOpenMenu(null)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-brand-primary/[0.05] hover:text-text-primary transition-colors"
                              >
                                <Eye className="w-4 h-4 text-brand-primary" />
                                View on Site
                              </Link>

                              {/* Divider */}
                              <div className="h-px bg-border-light mx-3" />

                              {/* Delete */}
                              <button
                                onClick={(e) => requestDelete(e, v._id, v.title, v.images?.[0])}
                                disabled={deleting === v._id}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-brand-dark/[0.04] hover:text-text-primary transition-colors disabled:opacity-40"
                              >
                                {deleting === v._id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Trash2 className="w-4 h-4" />
                                }
                                Delete Vehicle
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Pagination ─────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-text-muted">
                  Showing{" "}
                  <span className="font-medium text-text-primary">
                    {(query.page - 1) * PAGE_SIZE + 1}–{Math.min(query.page * PAGE_SIZE, total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-text-primary">{total}</span>{" "}
                  vehicles
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => goToPage(query.page - 1)}
                    disabled={query.page <= 1}
                    className="flex items-center gap-1 px-3 py-2 border border-border-light rounded-xl text-sm text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  {pageNumbers.map((p, idx) => (
                    <span key={p} className="flex items-center gap-1.5">
                      {idx > 0 && pageNumbers[idx - 1] !== p - 1 && (
                        <span className="text-text-muted text-sm px-1">…</span>
                      )}
                      <button
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                          p === query.page
                            ? "bg-brand-primary text-white"
                            : "border border-border-light text-text-secondary hover:border-brand-primary hover:text-brand-primary"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                  <button
                    onClick={() => goToPage(query.page + 1)}
                    disabled={query.page >= totalPages}
                    className="flex items-center gap-1 px-3 py-2 border border-border-light rounded-xl text-sm text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Status Confirmation Modal ───────────────────────── */}
      {statusUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="bg-surface-white rounded-2xl w-full max-w-md shadow-luxury overflow-hidden animate-slide-up">
            <div className="p-6">
              <h3 className="text-xl font-sans text-text-primary mb-2">Change Status</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Are you sure you want to mark <span className="font-semibold text-text-primary">{statusUpdate.title}</span> as <span className={`font-semibold ${statusUpdate.newStatus === "Sold" ? "text-text-muted" : "text-brand-primary"}`}>{statusUpdate.newStatus}</span>?
              </p>
            </div>
            <div className="px-6 py-4 bg-surface-light/50 border-t border-border-light flex justify-end gap-3">
              <button
                onClick={() => setStatusUpdate(null)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:bg-brand-dark/[0.04] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(statusUpdate.id, statusUpdate.newStatus)}
                className="px-5 py-2 bg-brand-dark text-surface-white text-sm font-semibold rounded-xl hover:bg-brand-dark/80 transition-colors btn-primary"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="bg-surface-white rounded-2xl w-full max-w-sm shadow-luxury overflow-hidden animate-slide-up">
            {/* Warning header */}
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-brand-dark/[0.06] flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="text-lg font-sans text-text-primary mb-1">Delete Vehicle</h3>
              <p className="text-xs text-text-muted">This action cannot be undone</p>
            </div>

            {/* Vehicle preview card */}
            <div className="mx-6 mb-5 flex items-center gap-3 p-3 bg-surface-light rounded-xl border border-border-light">
              {deleteConfirm.image ? (
                <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border border-border-light">
                  <Image
                    src={deleteConfirm.image}
                    alt={deleteConfirm.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div className="w-14 h-10 rounded-lg bg-brand-dark/[0.04] flex items-center justify-center shrink-0 border border-border-light">
                  <Trash2 className="w-4 h-4 text-text-muted" />
                </div>
              )}
              <p className="text-sm font-semibold text-text-primary line-clamp-1">{deleteConfirm.title}</p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-surface-light/50 border-t border-border-light flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors border border-border-light hover:border-brand-primary rounded-xl bg-surface-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteVehicle}
                className="flex-1 px-4 py-2.5 bg-brand-dark text-surface-white text-sm font-semibold rounded-xl hover:bg-brand-dark/80 transition-colors btn-primary flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
