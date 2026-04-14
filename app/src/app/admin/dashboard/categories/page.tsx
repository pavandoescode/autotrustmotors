"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Loader2, Tag, Search, Pencil, X, Check,
  Layers, BarChart3, Info, AlertCircle, Car,
} from "lucide-react";

// ── Extended interface (includes vehicleCount from API) ─────────────
interface ICategoryWithCount {
  _id: string;
  name: string;
  slug: string;
  vehicleCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const INPUT =
  "w-full px-4 py-3 bg-surface-light border border-border-light rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-primary placeholder:text-text-muted transition-colors";

// ── Delete Confirmation Modal ────────────────────────────────────────
interface DeleteModalProps {
  category: ICategoryWithCount;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

function DeleteConfirmModal({ category, onClose, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm">
      <div className="bg-surface-white rounded-2xl border border-border-light shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-text-primary font-sans">Delete Category</h3>
          <p className="text-sm text-text-muted mt-1">
            This action cannot be undone.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 p-3 bg-surface-light rounded-xl border border-border-light">
            <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{category.name}</p>
              <p className="text-xs text-text-muted">/{category.slug}</p>
            </div>
          </div>
          {category.vehicleCount > 0 && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl border border-brand-primary/20 bg-brand-primary/[0.04]">
              <AlertCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary">
                This category has <span className="font-semibold text-brand-primary">{category.vehicleCount}</span> vehicle{category.vehicleCount !== 1 ? "s" : ""} assigned.
                Reassign them before deleting.
              </p>
            </div>
          )}
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
            disabled={deleting || category.vehicleCount > 0}
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

// ── Inline Editable Name ─────────────────────────────────────────────
interface InlineEditProps {
  category: ICategoryWithCount;
  onSave: (id: string, newName: string) => Promise<boolean>;
}

function InlineEditName({ category, onSave }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Sync if parent's category name changes
  useEffect(() => {
    if (!editing) setValue(category.name);
  }, [category.name, editing]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === category.name) {
      setEditing(false);
      setValue(category.name);
      return;
    }
    setSaving(true);
    const success = await onSave(category._id, trimmed);
    setSaving(false);
    if (success) {
      setEditing(false);
    } else {
      setValue(category.name);
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setValue(category.name);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={saving}
          className="px-2 py-1 bg-surface-light border border-brand-primary rounded-lg text-sm text-text-primary focus:outline-none w-full max-w-[200px]"
        />
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary shrink-0" />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group/name">
      <p className="text-sm font-medium text-text-primary">{category.name}</p>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="p-1 text-text-muted hover:text-brand-primary opacity-0 group-hover/name:opacity-100 transition-all duration-200 rounded-md hover:bg-brand-primary/5"
        title="Rename"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ICategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
        setName("");
      } else {
        setError(data.error || "Failed to add category");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (id: string, newName: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev
            .map((c) => (c._id === id ? { ...c, ...data.data } : c))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        return true;
      } else {
        setError(data.error || "Failed to rename");
        return false;
      }
    } catch {
      setError("Failed to rename category");
      return false;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        setError(data.error || "Failed to delete");
        setDeleteTarget(null);
      }
    } catch {
      setError("Failed to delete");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────
  const filtered = search
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const totalVehicles = categories.reduce((sum, c) => sum + c.vehicleCount, 0);
  const mostPopular = categories.length > 0
    ? categories.reduce((best, c) => (c.vehicleCount > best.vehicleCount ? c : best), categories[0])
    : null;
  const emptyCategories = categories.filter((c) => c.vehicleCount === 0).length;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Organize your inventory with vehicle body-type categories
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
            LEFT: Category Management
        ════════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* ── Add Category card ──────────────────────── */}
          <div className="bg-surface-white border border-border-light rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border-light mb-5">
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Add New Category</h2>
            </div>

            <form onSubmit={handleAdd} className="flex gap-3">
              <div className="flex-1">
                <input
                  id="category-name-input"
                  type="text"
                  placeholder="Enter category name, e.g. Sedan, SUV..."
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className={INPUT}
                />
                {name.trim() && (
                  <p className="mt-1.5 text-xs text-text-muted">
                    Will be saved as:{" "}
                    <span className="font-semibold text-text-primary">{titleCase(name)}</span>
                  </p>
                )}
              </div>
              <button
                id="add-category-btn"
                type="submit"
                disabled={saving || !name.trim()}
                className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-60 btn-primary self-start"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </form>
          </div>

          {/* ── Category List card ─────────────────────── */}
          <div className="bg-surface-white border border-border-light rounded-2xl shadow-card overflow-hidden">
            {/* Search / Count header */}
            <div className="px-5 py-4 border-b border-border-light flex items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  All Categories
                </h2>
                {!loading && (
                  <span className="text-xs text-text-muted">
                    ({filtered.length}{search ? ` of ${categories.length}` : ""})
                  </span>
                )}
              </div>
              {categories.length > 5 && (
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    id="category-search-input"
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-light border border-border-light rounded-lg text-xs text-text-primary focus:outline-none focus:border-brand-primary placeholder:text-text-muted transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* List body */}
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                <p className="text-sm text-text-muted">Loading categories…</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-6 h-6 text-brand-primary" />
                </div>
                <p className="text-sm font-medium text-text-primary">No categories yet</p>
                <p className="text-xs text-text-muted mt-1">Add your first category above to start organizing.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-text-muted">
                  No categories match &ldquo;{search}&rdquo;
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-border-light">
                {filtered.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-primary/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-brand-primary" />
                      </div>
                      <div className="min-w-0">
                        <InlineEditName category={cat} onSave={handleRename} />
                        <p className="text-xs text-text-muted">/{cat.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Vehicle count badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          cat.vehicleCount > 0
                            ? "bg-brand-primary/10 text-brand-primary"
                            : "bg-surface-light text-text-muted"
                        }`}
                      >
                        <Car className="w-3 h-3" />
                        {cat.vehicleCount}
                      </span>

                      {/* Delete button */}
                      <button
                        id={`delete-category-${cat._id}`}
                        onClick={() => setDeleteTarget(cat)}
                        className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-brand-dark/5 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            RIGHT: Sticky sidebar
        ════════════════════════════════════════════════ */}
        <div className="space-y-4 xl:sticky xl:top-24">

          {/* ── Summary Panel (dark) ───────────────────── */}
          <div className="bg-brand-dark rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
              Category Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-sm text-white/70">Total Categories</span>
                </div>
                <span className="text-lg font-bold text-surface-white">{categories.length}</span>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Car className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-sm text-white/70">Total Vehicles</span>
                </div>
                <span className="text-lg font-bold text-surface-white">{totalVehicles}</span>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-sm text-white/70">Most Popular</span>
                </div>
                <span className="text-sm font-semibold text-surface-white truncate max-w-[120px]">
                  {mostPopular && mostPopular.vehicleCount > 0 ? mostPopular.name : "—"}
                </span>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-sm text-white/70">Unused</span>
                </div>
                <span className="text-lg font-bold text-surface-white">{emptyCategories}</span>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
