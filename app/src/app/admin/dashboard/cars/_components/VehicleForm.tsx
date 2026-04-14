"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, X, Upload, ArrowLeft, ImageIcon, ChevronDown,
  Check, Tag, Gauge, Fuel, User, MapPin, AlertCircle, Plus, Search,
} from "lucide-react";
import Link from "next/link";
import CloudinaryImage from "@/components/atoms/CloudinaryImage";
import { ICategory } from "@/types";
import ImageCropModal from "./ImageCropModal";

// ── Validation constants ──────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const TARGET_ASPECT = 16 / 9;
const ASPECT_TOLERANCE = 0.08; // ±8%

async function getImageAspect(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img.naturalWidth / img.naturalHeight); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(TARGET_ASPECT); };
    img.src = url;
  });
}

// ── Image Compression Helper ──────────────────────────────────────────
async function compressImage(file: File, maxSizeMB = 5, maxDimension = 1920): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { naturalWidth: width, naturalHeight: height } = img;
      
      // Step 1: Resize if larger than max dimension
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve(file);
        return;
      }
      
      // Fill white background (useful if converting transparent PNG to JPEG)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      const targetMime = "image/jpeg";
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      // Step 2: Quality reduction loop
      const attemptCompression = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            if (blob.size <= maxSizeBytes || quality <= 0.6) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: targetMime,
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              attemptCompression(quality - 0.1);
            }
          },
          targetMime,
          quality
        );
      };
      
      attemptCompression(0.9);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    
    img.src = url;
  });
}

// ── Constants ─────────────────────────────────────────────────────────
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid", "CNG", "LPG", "Hydrogen"];
const transmissions = ["Automatic", "Manual", "CVT", "DCT", "AMT", "iMT", "Tiptronic"];
const owners = ["1st Owner", "2nd Owner", "3rd Owner", "4th Owner+"];
const registrationStates = [
  "Andhra Pradesh - AP", "Arunachal Pradesh - AR", "Assam - AS",
  "Bihar - BR",
  "Chhattisgarh - CG", "Chandigarh - CH",
  "Dadra & Nagar Haveli and Daman & Diu - DD", "Delhi - DL",
  "Goa - GA", "Gujarat - GJ",
  "Haryana - HR", "Himachal Pradesh - HP",
  "Jammu & Kashmir - JK", "Jharkhand - JH",
  "Karnataka - KA", "Kerala - KL",
  "Ladakh - LA", "Lakshadweep - LD",
  "Madhya Pradesh - MP", "Maharashtra - MH", "Manipur - MN",
  "Meghalaya - ML", "Mizoram - MZ",
  "Nagaland - NL",
  "Odisha - OD",
  "Puducherry - PY", "Punjab - PB",
  "Rajasthan - RJ",
  "Sikkim - SK",
  "Tamil Nadu - TN", "Telangana - TS", "Tripura - TR",
  "Uttar Pradesh - UP", "Uttarakhand - UK",
  "West Bengal - WB",
];
const DEFAULT_BRANDS = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi",
  "Bentley", "BMW", "Bugatti", "BYD",
  "Cadillac", "Chevrolet", "Citroën",
  "Datsun", "Dodge",
  "Ferrari", "Fiat", "Ford", "Force Motors",
  "Genesis",
  "Honda", "Hyundai",
  "Infiniti", "Isuzu",
  "Jaguar", "Jeep",
  "Kia", "Koenigsegg",
  "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Lotus",
  "Mahindra", "Maruti Suzuki", "Maserati", "Maybach", "Mazda",
  "McLaren", "Mercedes-Benz", "MG", "Mini", "Mitsubishi",
  "Nissan",
  "Pagani", "Peugeot", "Porsche",
  "Renault", "Rolls-Royce",
  "Skoda", "Subaru", "Suzuki",
  "Tata", "Tesla", "Toyota",
  "Volkswagen", "Volvo",
];
const featureGroups = [
  {
    label: "Comfort & Convenience",
    icon: <User className="w-3.5 h-3.5" />,
    features: [
      "Sunroof", "Panoramic Sunroof", "Moonroof",
      "Leather Seats", "Leatherette Seats", "Ventilated Seats", "Heated Seats",
      "Power Seats", "Memory Seats", "Massage Seats", "Reclining Rear Seats",
      "Automatic Climate Control", "Dual-Zone Climate Control", "Tri-Zone Climate Control", "Rear AC Vents",
      "Keyless Entry", "Push Start", "Remote Start",
      "Cruise Control", "Adaptive Cruise Control",
      "Power Steering", "Tilt & Telescopic Steering", "Electrically Adjustable ORVM",
      "Auto-Dimming IRVM", "Rain Sensing Wipers", "Power Windows",
      "Cooled Glove Box", "Wireless Charging", "USB Charging Ports",
      "Boot Opener", "Powered Tailgate", "Hands-Free Tailgate",
      "Ambient Lighting", "Puddle Lamps",
    ],
  },
  {
    label: "Technology",
    icon: <Tag className="w-3.5 h-3.5" />,
    features: [
      "Touchscreen Infotainment", "7-inch Touchscreen", "10-inch Touchscreen", "12-inch Touchscreen",
      "Apple CarPlay", "Android Auto", "Wireless Apple CarPlay", "Wireless Android Auto",
      "360° Camera", "Reverse Camera", "Front Camera",
      "Digital Instrument Cluster", "Head-Up Display",
      "Connected Car Tech", "OTA Updates", "Voice Commands",
      "Navigation System", "Wireless Smartphone Mirroring",
      "Steering Mounted Controls", "Paddle Shifters",
      "Drive Modes", "Terrain Response System",
    ],
  },
  {
    label: "Safety",
    icon: <Check className="w-3.5 h-3.5" />,
    features: [
      "ABS", "EBD", "BA (Brake Assist)", "ESP (Electronic Stability)",
      "Airbags (2)", "Airbags (4)", "Airbags (6)", "Airbags (6+)", "Curtain Airbags", "Knee Airbag",
      "Parking Sensors (Front)", "Parking Sensors (Rear)", "Parking Sensors (Front & Rear)",
      "Hill Assist", "Hill Descent Control",
      "Lane Departure Warning", "Lane Keep Assist",
      "Blind Spot Monitor", "Rear Cross Traffic Alert",
      "Forward Collision Warning", "Autonomous Emergency Braking",
      "TPMS (Tyre Pressure Monitor)", "ISOFIX Child Seat Mounts",
      "360° Safety Cage", "Roll-Over Protection",
      "Traction Control", "Electronic Differential Lock",
      "Speed Alert System", "Driver Attention Monitor",
      "Adaptive Headlamps", "Auto High Beam",
    ],
  },
  {
    label: "Exterior",
    icon: <Gauge className="w-3.5 h-3.5" />,
    features: [
      "Alloy Wheels", "16-inch Alloys", "17-inch Alloys", "18-inch Alloys", "19-inch Alloys", "20-inch+ Alloys",
      "Diamond Cut Alloys", "Dual-Tone Alloys",
      "Chrome Grille", "Gloss Black Grille", "Body Coloured Bumpers",
      "Roof Rails", "Spoiler", "Active Spoiler",
      "Shark Fin Antenna", "Integrated Turn Signals on ORVM",
      "Dual Exhaust", "Quad Exhaust",
      "Flush Door Handles", "Soft-Close Doors",
      "Running Boards", "Side Skirts",
    ],
  },
  {
    label: "Entertainment & Sound",
    icon: <Tag className="w-3.5 h-3.5" />,
    features: [
      "4-Speaker System", "6-Speaker System", "8-Speaker System", "10+ Speaker System",
      "Subwoofer", "Amplifier",
      "Harman Kardon", "Bose Audio", "Bang & Olufsen", "Burmester",
      "JBL Audio", "Sony Audio", "Mark Levinson", "Meridian Sound",
      "Rear Seat Entertainment", "Headrest Screens",
      "FM/AM Radio", "DAB Radio", "CD Player",
    ],
  },
  {
    label: "Lighting",
    icon: <Tag className="w-3.5 h-3.5" />,
    features: [
      "LED Headlamps", "Bi-LED Headlamps", "Matrix LED Headlamps",
      "LED DRLs", "LED Fog Lamps",
      "LED Tail Lamps", "Sequential Turn Indicators",
      "Auto Headlamps", "Follow-Me-Home Headlamps",
      "Cornering Lamps", "Welcome Lamps",
      "Interior Mood Lighting", "Footwell Lighting",
    ],
  },
  {
    label: "Performance & Drivetrain",
    icon: <Gauge className="w-3.5 h-3.5" />,
    features: [
      "Turbo Engine", "Twin-Turbo", "Supercharged",
      "AWD (All-Wheel Drive)", "4WD (Four-Wheel Drive)", "FWD (Front-Wheel Drive)", "RWD (Rear-Wheel Drive)",
      "Sport Suspension", "Air Suspension", "Adaptive Suspension",
      "Limited Slip Differential", "Locking Differential",
      "Launch Control", "Sport Exhaust",
      "Regenerative Braking", "Energy Recovery",
      "Multi-Link Rear Suspension", "Independent Suspension",
      "Ventilated Disc Brakes (Front)", "Ventilated Disc Brakes (All)",
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────
const INPUT =
  "w-full px-4 py-3 bg-surface-light border border-border-light rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-primary placeholder:text-text-muted transition-colors";
const SELECT = INPUT;

function fmtPrice(n: number): string {
  if (!n) return "";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString()}`;
}

/** Format a number with Indian-style comma grouping: 42000000 → 4,20,00,000 */
function indianComma(n: number | string): string {
  const s = String(n).replace(/[^0-9]/g, "");
  if (!s) return "";
  // Indian grouping: last 3 digits, then groups of 2
  const len = s.length;
  if (len <= 3) return s;
  let result = s.slice(len - 3);
  let remaining = s.slice(0, len - 3);
  while (remaining.length > 2) {
    result = remaining.slice(remaining.length - 2) + "," + result;
    remaining = remaining.slice(0, remaining.length - 2);
  }
  if (remaining.length > 0) result = remaining + "," + result;
  return result;
}

/** Pronounce a number in Indian currency words: 42000000 → "4 Crore 20 Lakh" */
function pronounceINR(n: number): string {
  if (!n || n <= 0) return "";
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thousand = Math.floor((n % 100_000) / 1_000);
  const remainder = n % 1_000;
  const parts: string[] = [];
  if (crore > 0) parts.push(`${crore} Crore`);
  if (lakh > 0) parts.push(`${lakh} Lakh`);
  if (thousand > 0) parts.push(`${thousand} Thousand`);
  if (remainder > 0) parts.push(`${remainder}`);
  return parts.length > 0 ? `₹ ${parts.join(" ")}` : "";
}

function SectionHeading({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border-light mb-5">
      <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{label}</h2>
    </div>
  );
}

// ── Searchable Select (reusable for fixed-option dropdowns) ──────────
interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}

function SearchableSelect({ value, onChange, options, placeholder = "Select…" }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) handleSelect(filtered[0]);
    }
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`${INPUT} flex items-center gap-2 cursor-pointer`}
      >
        {open ? (
          <>
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search…`}
              className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
            />
          </>
        ) : (
          <>
            <span className={value ? "flex-1 text-sm" : "flex-1 text-sm text-text-muted"}>
              {value || placeholder}
            </span>
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          </>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-surface-white border border-border-light rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-xs text-text-muted text-center">
                No match found
              </p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  opt === value
                    ? "bg-brand-primary/10 text-brand-primary font-medium"
                    : "text-text-primary hover:bg-surface-light"
                }`}
              >
                {opt}
                {opt === value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Brand Combobox ────────────────────────────────────────────────────
interface BrandComboboxProps {
  value: string;
  onChange: (brand: string) => void;
  brands: string[];
  onRequestCreate: (initialName: string) => void;
}

function BrandCombobox({ value, onChange, brands, onRequestCreate }: BrandComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? brands
        .map((b) => {
          const q = query.toLowerCase();
          const t = b.toLowerCase();
          // Exact substring match → highest score
          if (t.includes(q)) return { brand: b, score: 100 };
          // Fuzzy subsequence: count how many query chars match in order
          let matched = 0;
          let ti = 0;
          for (let qi = 0; qi < q.length; qi++) {
            while (ti < t.length) {
              if (t[ti] === q[qi]) { matched++; ti++; break; }
              ti++;
            }
          }
          const ratio = q.length > 0 ? matched / q.length : 0;
          return { brand: b, score: ratio >= 0.6 ? Math.round(ratio * 50) : 0 };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.brand)
    : brands;

  // Show "Create" when query doesn't exactly match any existing brand
  const exactMatch = brands.some((b) => b.toLowerCase() === query.trim().toLowerCase());
  const showCreate = query.trim().length > 0 && !exactMatch;

  const handleSelect = (brand: string) => {
    onChange(brand);
    setOpen(false);
    setQuery("");
  };

  const handleRequestCreate = () => {
    onRequestCreate(query.trim());
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) {
        handleSelect(filtered[0]);
      } else if (showCreate && filtered.length === 0) {
        handleRequestCreate();
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`${INPUT} flex items-center gap-2 cursor-pointer`}
      >
        {open ? (
          <>
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search brands…"
              className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
            />
          </>
        ) : (
          <>
            <span className={value ? "flex-1 text-sm" : "flex-1 text-sm text-text-muted"}>
              {value || "Select Brand"}
            </span>
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          </>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-surface-white border border-border-light rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 && !showCreate && (
              <p className="px-4 py-3 text-xs text-text-muted text-center">
                No brands match &ldquo;{query}&rdquo;
              </p>
            )}
            {filtered.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => handleSelect(brand)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  brand === value
                    ? "bg-brand-primary/10 text-brand-primary font-medium"
                    : "text-text-primary hover:bg-surface-light"
                }`}
              >
                {brand}
                {brand === value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
          {showCreate && (
            <>
              <div className="h-px bg-border-light" />
              <button
                type="button"
                onClick={handleRequestCreate}
                className="w-full text-left px-4 py-3 text-sm text-brand-primary hover:bg-brand-primary/5 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create &ldquo;{query.trim()}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Create Brand Modal ────────────────────────────────────────────────
function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Capitalize only the first letter of the entire string */
function sentenceCase(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

interface CreateBrandModalProps {
  initialName: string;
  onClose: () => void;
  onCreate: (name: string) => void;
}

function CreateBrandModal({ initialName, onClose, onCreate }: CreateBrandModalProps) {
  const [name, setName] = useState(titleCase(initialName));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const formatted = titleCase(name);
    if (!formatted) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formatted }),
      });
      const data = await res.json();
      if (data.success) {
        onCreate(data.data.name);
      } else {
        setError(data.error || "Failed to create brand");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm">
      <div className="bg-surface-white rounded-2xl border border-border-light shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-text-primary font-sans">Add New Brand</h3>
          <p className="text-xs text-text-muted mt-1">
            This brand will be saved and available across all listings.
          </p>
        </div>

        {/* Input */}
        <div className="px-6 pb-4">
          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
            Brand Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="e.g. Rivian"
            autoFocus
            className={INPUT}
          />
          {name.trim() && (
            <p className="mt-1.5 text-xs text-text-muted">
              Will be saved as:{" "}
              <span className="font-semibold text-text-primary">{titleCase(name)}</span>
            </p>
          )}
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-medium text-text-muted hover:text-text-primary rounded-xl border border-border-light hover:bg-surface-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 text-xs font-semibold bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 btn-primary"
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating…</>
            ) : (
              <><Plus className="w-3.5 h-3.5" />Create Brand</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Combobox ─────────────────────────────────────────────────
interface CategoryComboboxProps {
  value: string;
  onChange: (categoryId: string) => void;
  categories: ICategory[];
  onRequestCreate: (initialName: string) => void;
}

function CategoryCombobox({ value, onChange, categories, onRequestCreate }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? categories
        .map((c) => {
          const q = query.toLowerCase();
          const t = c.name.toLowerCase();
          // Exact substring match → highest score
          if (t.includes(q)) return { cat: c, score: 100 };
          // Fuzzy subsequence
          let matched = 0;
          let ti = 0;
          for (let qi = 0; qi < q.length; qi++) {
            while (ti < t.length) {
              if (t[ti] === q[qi]) { matched++; ti++; break; }
              ti++;
            }
          }
          const ratio = q.length > 0 ? matched / q.length : 0;
          return { cat: c, score: ratio >= 0.6 ? Math.round(ratio * 50) : 0 };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.cat)
    : categories;

  // Show "Create" when query doesn't exactly match any existing category
  const exactMatch = categories.some((c) => c.name.toLowerCase() === query.trim().toLowerCase());
  const showCreate = query.trim().length > 0 && !exactMatch;

  const selectedCategory = categories.find((c) => c._id === value);

  const handleSelect = (catId: string) => {
    onChange(catId);
    setOpen(false);
    setQuery("");
  };

  const handleRequestCreate = () => {
    onRequestCreate(query.trim());
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) {
        handleSelect(filtered[0]._id);
      } else if (showCreate && filtered.length === 0) {
        handleRequestCreate();
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`${INPUT} flex items-center gap-2 cursor-pointer`}
      >
        {open ? (
          <>
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search categories…"
              className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
            />
          </>
        ) : (
          <>
            <span className={selectedCategory ? "flex-1 text-sm" : "flex-1 text-sm text-text-muted"}>
              {selectedCategory ? selectedCategory.name : "Select Category"}
            </span>
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          </>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-surface-white border border-border-light rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 && !showCreate && (
              <p className="px-4 py-3 text-xs text-text-muted text-center">
                No categories match &ldquo;{query}&rdquo;
              </p>
            )}
            {filtered.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleSelect(cat._id)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  cat._id === value
                    ? "bg-brand-primary/10 text-brand-primary font-medium"
                    : "text-text-primary hover:bg-surface-light"
                }`}
              >
                {cat.name}
                {cat._id === value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
          {showCreate && (
            <>
              <div className="h-px bg-border-light" />
              <button
                type="button"
                onClick={handleRequestCreate}
                className="w-full text-left px-4 py-3 text-sm text-brand-primary hover:bg-brand-primary/5 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create &ldquo;{query.trim()}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Create Category Modal ─────────────────────────────────────────────
interface CreateCategoryModalProps {
  initialName: string;
  onClose: () => void;
  onCreate: (category: ICategory) => void;
}

function CreateCategoryModal({ initialName, onClose, onCreate }: CreateCategoryModalProps) {
  const [name, setName] = useState(titleCase(initialName));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const formatted = titleCase(name);
    if (!formatted) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formatted }),
      });
      const data = await res.json();
      if (data.success) {
        onCreate(data.data);
      } else {
        setError(data.error || "Failed to create category");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm">
      <div className="bg-surface-white rounded-2xl border border-border-light shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-text-primary font-sans">Add New Category</h3>
          <p className="text-xs text-text-muted mt-1">
            This category will be saved and available across all listings.
          </p>
        </div>

        {/* Input */}
        <div className="px-6 pb-4">
          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="e.g. Pickup Truck"
            autoFocus
            className={INPUT}
          />
          {name.trim() && (
            <p className="mt-1.5 text-xs text-text-muted">
              Will be saved as:{" "}
              <span className="font-semibold text-text-primary">{titleCase(name)}</span>
            </p>
          )}
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-medium text-text-muted hover:text-text-primary rounded-xl border border-border-light hover:bg-surface-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 text-xs font-semibold bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 btn-primary"
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating…</>
            ) : (
              <><Plus className="w-3.5 h-3.5" />Create Category</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Feature Modal ──────────────────────────────────────────────
interface CreateFeatureModalProps {
  initialName: string;
  onClose: () => void;
  onCreate: (name: string) => void;
}

function CreateFeatureModal({ initialName, onClose, onCreate }: CreateFeatureModalProps) {
  const [name, setName] = useState(titleCase(initialName));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const formatted = titleCase(name);
    if (!formatted) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formatted }),
      });
      const data = await res.json();
      if (data.success) {
        onCreate(data.data.name);
      } else {
        setError(data.error || "Failed to create feature");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm">
      <div className="bg-surface-white border border-border-light rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Create Feature</h3>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="px-6 py-3">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Captain seats"
            autoFocus
            className={INPUT}
          />
          {name.trim() && (
            <p className="mt-1.5 text-xs text-text-muted">
              Will be saved as:{" "}
              <span className="font-semibold text-text-primary">{titleCase(name)}</span>
            </p>
          )}
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-medium text-text-muted hover:text-text-primary rounded-xl border border-border-light hover:bg-surface-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 text-xs font-semibold bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 btn-primary"
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating…</>
            ) : (
              <><Plus className="w-3.5 h-3.5" />Create Feature</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────
interface VehicleFormProps {
  editId: string | null;
}

// ── Component ─────────────────────────────────────────────────────────
export default function VehicleForm({ editId }: VehicleFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // Crop queue pipeline
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [currentCrop, setCurrentCrop] = useState<{ file: File; url: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandModalInitialName, setBrandModalInitialName] = useState("");
  const [featureSearch, setFeatureSearch] = useState("");
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureModalInitialName, setFeatureModalInitialName] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalInitialName, setCategoryModalInitialName] = useState("");

  const addCustomFeature = useCallback((newFeature: string) => {
    setCustomFeatures((prev) => {
      if (prev.some((f) => f.toLowerCase() === newFeature.toLowerCase())) return prev;
      return [...prev, newFeature].sort((a, b) => a.localeCompare(b));
    });
  }, []);

  const addBrandToList = useCallback((newBrand: string) => {
    setAllBrands((prev) => {
      if (prev.some((b) => b.toLowerCase() === newBrand.toLowerCase())) return prev;
      return [...prev, newBrand].sort((a, b) => a.localeCompare(b));
    });
  }, []);

  const addCategoryToList = useCallback((newCategory: ICategory) => {
    setCategories((prev) => {
      if (prev.some((c) => c._id === newCategory._id)) return prev;
      return [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  const [form, setForm] = useState({
    title: "", brand: "", model: "", year: new Date().getFullYear(),
    price: 0, marketPrice: 0, fuelType: "Petrol", transmission: "Automatic",
    owner: "1st Owner", mileage: 0, registrationState: "",
    features: [] as string[], status: "Available", categoryId: "",
  });
  const [initialForm, setInitialForm] = useState(form);
  const [initialExistingImages, setInitialExistingImages] = useState<string[]>([]);

  const isDirty = useMemo(() => {
    if (!editId) return true; // Add mode is always dirty
    if (imageFiles.length > 0) return true;
    if (JSON.stringify(form) !== JSON.stringify(initialForm)) return true;
    if (JSON.stringify(existingImages) !== JSON.stringify(initialExistingImages)) return true;
    return false;
  }, [editId, imageFiles, form, initialForm, existingImages, initialExistingImages]);

  // ── Derived ──────────────────────────────────────────────────────────
  const savings = form.marketPrice > form.price ? form.marketPrice - form.price : 0;
  const savingsPct = form.marketPrice > 0 ? Math.round((savings / form.marketPrice) * 100) : 0;

  // Flatten all images into a unified list for the slot picker
  const allSlots = [
    ...existingImages.map((src) => ({ type: "existing" as const, src })),
    ...imagePreviews.map((src) => ({ type: "new" as const, src })),
  ];
  const featuredSlots = allSlots.slice(0, 3);
  const extraSlots = allSlots.slice(3);

  // ── Fetch on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => {
      if (d.success) setCategories(d.data);
    });

    // Fetch custom brands from DB and merge with defaults
    fetch("/api/brands").then((r) => r.json()).then((d) => {
      if (d.success && Array.isArray(d.data)) {
        const dbBrands = d.data.map((b: { name: string }) => b.name);
        setAllBrands((prev) => {
          const merged = new Set([...prev, ...dbBrands]);
          return Array.from(merged).sort((a, b) => a.localeCompare(b));
        });
      }
    });

    // Fetch custom features from DB
    fetch("/api/features").then((r) => r.json()).then((d) => {
      if (d.success && Array.isArray(d.data)) {
        const dbFeatures = d.data.map((f: { name: string }) => f.name);
        setCustomFeatures(dbFeatures);
      }
    });

    if (editId) {
      setLoading(true);
      fetch(`/api/vehicles/${editId}`).then((r) => r.json()).then((d) => {
        if (d.success) {
          const v = d.data;
          const loadedForm = {
            title: v.title, brand: v.brand, model: v.model, year: v.year,
            price: v.price, marketPrice: v.marketPrice, fuelType: v.fuelType,
            transmission: v.transmission, owner: v.owner, mileage: v.mileage,
            registrationState: v.registrationState, features: v.features || [],
            status: v.status, categoryId: v.categoryId?._id || v.categoryId || "",
          };
          setForm(loadedForm);
          setInitialForm(loadedForm);
          setExistingImages(v.images || []);
          setInitialExistingImages(v.images || []);
          // Ensure the loaded brand exists in the combobox
          if (v.brand) addBrandToList(v.brand);
        }
        setLoading(false);
      });
    }
  }, [editId]);

  // ── Generate blob previews when files change ─────────────────────────
  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [imageFiles]);

  // ── Crop queue processor ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentCrop && cropQueue.length > 0) {
      const [next, ...rest] = cropQueue;
      setCropQueue(rest);
      setCurrentCrop({ file: next, url: URL.createObjectURL(next) });
    }
  }, [currentCrop, cropQueue]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const toggleFeature = (feature: string) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));

  // ── File processing pipeline ─────────────────────────────────────────
  const processFiles = useCallback(async (files: File[]) => {
    const errors: string[] = [];
    const directAdd: File[] = [];
    const needsCrop: File[] = [];

    for (let file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" — unsupported format. Use JPG, PNG, or WEBP.`);
        continue;
      }

      // Automatically compress the image to ensure it's under 5MB and ~1080p width
      file = await compressImage(file);

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" — too large even after compression (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
        continue;
      }
      const aspect = await getImageAspect(file);
      if (Math.abs(aspect - TARGET_ASPECT) <= ASPECT_TOLERANCE) {
        directAdd.push(file);
      } else {
        needsCrop.push(file);
      }
    }

    if (errors.length) setValidationErrors(errors);
    if (directAdd.length) setImageFiles((prev) => [...prev, ...directAdd]);
    if (needsCrop.length) setCropQueue((prev) => [...prev, ...needsCrop]);
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) processFiles(picked);
    e.target.value = "";
  };

  const handleCropConfirm = (croppedFile: File) => {
    if (currentCrop) URL.revokeObjectURL(currentCrop.url);
    setImageFiles((prev) => [...prev, croppedFile]);
    setCurrentCrop(null);
  };

  const handleCropSkip = () => {
    if (currentCrop) URL.revokeObjectURL(currentCrop.url);
    setCurrentCrop(null);
  };

  const handleCropCancelAll = () => {
    if (currentCrop) URL.revokeObjectURL(currentCrop.url);
    setCurrentCrop(null);
    setCropQueue([]);
  };

  const removeSlot = (slotIdx: number) => {
    const slot = allSlots[slotIdx];
    if (!slot) return;
    if (slot.type === "existing") {
      // Existing images are at the start of allSlots, so their slotIdx matches their index in existingImages
      setExistingImages((prev) => prev.filter((_, i) => i !== slotIdx));
    } else {
      // New images appear after existing images, so their index is offset
      const previewIdx = slotIdx - existingImages.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== previewIdx));
    }
  };

  const handleImageUpload = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    setUploading(true);
    try {
      const formData = new FormData();
      imageFiles.forEach((f) => formData.append("images", f));
      formData.append("folder", "assets");
      formData.append("subfolder", "vehicles");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.success ? data.data : [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let images = [...existingImages];
      if (imageFiles.length > 0) {
        const uploaded = await handleImageUpload();
        images = [...images, ...uploaded];
      }
      const url = editId ? `/api/vehicles/${editId}` : "/api/vehicles";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/dashboard/cars");
      } else {
        alert(data.error || "Failed to save vehicle");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-sm text-text-muted">Loading vehicle data…</p>
        </div>
      </div>
    );
  }

  // ── Image slot sub-component ─────────────────────────────────────────
  const ImageSlot = ({ slotIdx }: { slotIdx: number }) => {
    const slot = featuredSlots[slotIdx];
    const label = slotIdx === 0 ? "Cover Photo" : `Photo ${slotIdx + 1}`;

    if (slot) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-border-light group">
          {slot.type === "existing" ? (
            <CloudinaryImage
              src={slot.src} alt={label} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 33vw, 220px"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slot.src} alt={label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          {/* Hover dark overlay */}
          <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/30 transition-all duration-200" />
          {/* Cover badge */}
          {slotIdx === 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-dark/70 text-brand-primary text-[10px] font-bold tracking-widest rounded-md backdrop-blur-sm">
              COVER
            </span>
          )}
          {/* NEW badge */}
          {slot.type === "new" && (
            <span className="absolute top-2 right-8 bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              NEW
            </span>
          )}
          {/* Remove */}
          <button
            type="button"
            onClick={() => removeSlot(slotIdx)}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-brand-dark/70 hover:bg-brand-dark text-white rounded-full items-center justify-center hidden group-hover:flex transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Bottom label */}
          <div className="absolute bottom-0 inset-x-0 px-2.5 py-1.5 bg-gradient-to-t from-brand-dark/60 to-transparent">
            <span className="text-[10px] text-white/80 font-medium">{label}</span>
          </div>
        </div>
      );
    }

    // Empty slot
    return (
      <label
        className={`aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 ${
          slotIdx === 0
            ? "border-brand-primary/50 hover:border-brand-primary bg-brand-primary/[0.02] hover:bg-brand-primary/[0.05]"
            : "border-border-light hover:border-brand-primary hover:bg-brand-primary/[0.03]"
        }`}
      >
        <div
          className={`flex items-center justify-center transition-colors ${
            slotIdx === 0
              ? "w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/20"
              : "w-9 h-9 rounded-full bg-surface-light text-text-muted group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
          }`}
        >
          <Upload className={slotIdx === 0 ? "w-5 h-5" : "w-4 h-4"} />
        </div>
        <div className="text-center">
          <span
            className={`font-medium transition-colors ${
              slotIdx === 0 ? "text-xs text-brand-primary" : "text-[11px] text-text-muted group-hover:text-brand-primary"
            }`}
          >
            {label}
          </span>
          {slotIdx === 0 && (
            <p className="text-[9px] font-bold tracking-widest uppercase text-brand-primary/60 mt-1">Primary Image</p>
          )}
        </div>
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFilePick} />
      </label>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard/cars"
          className="p-2 hover:bg-surface-white border border-transparent hover:border-border-light rounded-xl transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {editId ? "Edit Vehicle" : "Add New Vehicle"}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {editId ? "Update the vehicle information below" : "Fill in the details to add a new listing"}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ════════════════════════════════════════════════
              LEFT: Main form sections
          ════════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* ── Basic Information card (photos at top) ─── */}
            <div className="bg-surface-white border border-border-light rounded-2xl shadow-card">

              {/* ── Photo Picker strip ─────────────────────── */}
              <div className="p-6 pb-5 border-b border-border-light bg-brand-dark/[0.02] rounded-t-2xl">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                      Vehicle Photos
                    </span>
                    {allSlots.length > 0 && (
                      <span className="text-[11px] text-text-muted">
                        — {allSlots.length} photo{allSlots.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 border border-border-light text-xs font-medium text-text-secondary hover:border-brand-primary hover:text-brand-primary rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Add Photos
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFilePick} />
                  </label>
                </div>

                {/* 3 featured slots */}
                <div className="grid grid-cols-3 gap-3">
                  <ImageSlot slotIdx={0} />
                  <ImageSlot slotIdx={1} />
                  <ImageSlot slotIdx={2} />
                </div>

                {/* Extra photos (4th+) as a compact scrollable strip */}
                {extraSlots.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                    {extraSlots.map((slot, i) => (
                      <div
                        key={i}
                        className="relative w-14 h-10 rounded-lg overflow-hidden border border-border-light shrink-0 group"
                      >
                        {slot.type === "existing" ? (
                          <CloudinaryImage src={slot.src} alt="" fill className="object-cover" sizes="56px" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={slot.src} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeSlot(i + 3)}
                          className="absolute inset-0 bg-brand-dark/50 hidden group-hover:flex items-center justify-center text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-14 h-10 rounded-lg border-2 border-dashed border-border-light hover:border-brand-primary flex items-center justify-center shrink-0 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-text-muted" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFilePick} />
                    </label>
                  </div>
                )}

                {/* Upload constraints — always visible */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[10px] uppercase font-bold tracking-widest text-text-muted">
                  <span className="px-2 py-1 bg-surface-light rounded-md">JPG / PNG / WEBP</span>
                  <span className="px-2 py-1 bg-surface-light rounded-md">Max 5 MB</span>
                  <span className="px-2 py-1 bg-brand-primary/[0.15] text-brand-primary rounded-md">16:9 Preferred</span>
                </div>
                <p className="mt-2 text-[10px] text-text-muted text-center font-medium">
                  The first photo acts as the cover. Non-16:9 photos will open the cropper.
                </p>

                {/* Validation errors */}
                {validationErrors.length > 0 && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-1">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setValidationErrors([])}
                      className="mt-1 text-[11px] text-red-400 hover:text-red-600 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* ── Text fields below photo strip ────────── */}
              <div className="p-6 space-y-4">
                <SectionHeading n={1} label="Basic Information" />

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Vehicle Title</label>
                  <input
                    type="text" required
                    placeholder="e.g., BMW 5 Series 530d M Sport"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={INPUT}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Category</label>
                  <CategoryCombobox
                    value={form.categoryId}
                    onChange={(categoryId) => setForm({ ...form, categoryId })}
                    categories={categories}
                    onRequestCreate={(name) => {
                      setCategoryModalInitialName(name);
                      setCategoryModalOpen(true);
                    }}
                  />
                </div>

                {/* Brand / Model / Year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Brand</label>
                    <BrandCombobox
                      value={form.brand}
                      onChange={(brand) => setForm({ ...form, brand })}
                      brands={allBrands}
                      onRequestCreate={(name) => {
                        setBrandModalInitialName(name);
                        setBrandModalOpen(true);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Model</label>
                    <input type="text" required placeholder="Camry Hybrid" value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Year</label>
                    <input type="number" required placeholder="2024" value={form.year}
                      onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                      onWheel={(e) => e.currentTarget.blur()}
                      className={INPUT} />
                  </div>
                </div>

                {/* Fuel / Transmission / Owner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1"><Fuel className="w-3 h-3" />Fuel Type</span>
                    </label>
                    <SearchableSelect
                      value={form.fuelType}
                      onChange={(val) => setForm({ ...form, fuelType: val })}
                      options={fuelTypes}
                      placeholder="Select Fuel Type"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Transmission</label>
                    <SearchableSelect
                      value={form.transmission}
                      onChange={(val) => setForm({ ...form, transmission: val })}
                      options={transmissions}
                      placeholder="Select Transmission"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1"><User className="w-3 h-3" />Ownership</span>
                    </label>
                    <SearchableSelect
                      value={form.owner}
                      onChange={(val) => setForm({ ...form, owner: val })}
                      options={owners}
                      placeholder="Select Ownership"
                    />
                  </div>
                </div>

                {/* Mileage / Reg State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1"><Gauge className="w-3 h-3" />KMs Driven</span>
                    </label>
                    <input type="number" required placeholder="e.g. 15000" value={form.mileage || ""}
                      onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })}
                      onWheel={(e) => e.currentTarget.blur()}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />Registration State</span>
                    </label>
                    <SearchableSelect
                      value={form.registrationState}
                      onChange={(val) => setForm({ ...form, registrationState: val })}
                      options={registrationStates}
                      placeholder="Select State"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Pricing ──────────────────────────────────── */}
            <div className="bg-surface-white border border-border-light rounded-2xl p-6 shadow-card">
              <SectionHeading n={2} label="Pricing" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Our Price (₹)</label>
                  <input type="text" inputMode="numeric" required
                    value={form.price ? indianComma(form.price) : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setForm({ ...form, price: raw ? Number(raw) : 0 });
                    }}
                    className={INPUT} placeholder="e.g. 52,00,000" />
                  {form.price > 0 && (
                    <p className="mt-1.5 text-xs text-brand-primary font-medium">{pronounceINR(form.price)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Market Price (₹)</label>
                  <input type="text" inputMode="numeric" required
                    value={form.marketPrice ? indianComma(form.marketPrice) : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setForm({ ...form, marketPrice: raw ? Number(raw) : 0 });
                    }}
                    className={INPUT} placeholder="e.g. 60,00,000" />
                  {form.marketPrice > 0 && (
                    <p className="mt-1.5 text-xs text-brand-primary font-medium">{pronounceINR(form.marketPrice)}</p>
                  )}
                </div>
              </div>

              {savings > 0 && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-brand-primary/[0.07] border border-brand-primary/20 rounded-xl">
                  <span className="text-brand-primary text-lg font-bold">↓</span>
                  <div>
                    <p className="text-sm font-semibold text-brand-primary">Buyer saves {fmtPrice(savings)}</p>
                    <p className="text-xs text-text-muted mt-0.5">{savingsPct}% off market price — a strong selling point</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── 3. Features ─────────────────────────────────── */}
            <div className="bg-surface-white border border-border-light rounded-2xl p-6 shadow-card">
              <SectionHeading n={3} label="Features & Highlights" />

              {/* Search bar */}
              <div className="mb-5">
                <div className={`${INPUT} flex items-center gap-2`}>
                  <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    placeholder="Search features…"
                    className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
                  />
                  {featureSearch && (
                    <button type="button" onClick={() => setFeatureSearch("")} className="text-text-muted hover:text-text-primary">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {(() => {
                  const q = featureSearch.trim().toLowerCase();

                  // Fuzzy match helper (same logic as BrandCombobox)
                  const fuzzyMatch = (feature: string): number => {
                    const t = feature.toLowerCase();
                    if (!q) return 100;
                    if (t.includes(q)) return 100;
                    let matched = 0, ti = 0;
                    for (let qi = 0; qi < q.length; qi++) {
                      while (ti < t.length) {
                        if (t[ti] === q[qi]) { matched++; ti++; break; }
                        ti++;
                      }
                    }
                    const ratio = q.length > 0 ? matched / q.length : 0;
                    return ratio >= 0.6 ? Math.round(ratio * 50) : 0;
                  };

                  // Filter groups: only show groups that have matching features
                  const filteredGroups = featureGroups
                    .map((group) => ({
                      ...group,
                      filteredFeatures: q
                        ? group.features
                            .map((f) => ({ name: f, score: fuzzyMatch(f) }))
                            .filter((f) => f.score > 0)
                            .sort((a, b) => b.score - a.score)
                            .map((f) => f.name)
                        : group.features,
                    }))
                    .filter((g) => g.filteredFeatures.length > 0);

                  // Build "Other" group from custom DB features (exclude ones already in built-in groups)
                  const builtInFeatures = new Set(featureGroups.flatMap((g) => g.features));
                  const otherFeatures = customFeatures.filter((f) => !builtInFeatures.has(f));
                  if (otherFeatures.length > 0) {
                    const otherFiltered = q
                      ? otherFeatures
                          .map((f) => ({ name: f, score: fuzzyMatch(f) }))
                          .filter((f) => f.score > 0)
                          .sort((a, b) => b.score - a.score)
                          .map((f) => f.name)
                      : otherFeatures;
                    if (otherFiltered.length > 0) {
                      filteredGroups.push({
                        label: "Other",
                        icon: <Tag className="w-3.5 h-3.5" />,
                        features: otherFeatures,
                        filteredFeatures: otherFiltered,
                      });
                    }
                  }

                  // Check if query exactly matches any existing feature (built-in + custom)
                  const allFeatures = [...builtInFeatures, ...customFeatures];
                  const exactMatch = allFeatures.some((f) => f.toLowerCase() === q);
                  const alreadySelected = form.features.some((f) => f.toLowerCase() === q);
                  const showCreate = q.length > 0 && !exactMatch && !alreadySelected;

                  // Inject "Selected Features" at the very top when not searching
                  if (!q && form.features.length > 0) {
                    filteredGroups.unshift({
                      label: "Selected Features",
                      icon: <Check className="w-3.5 h-3.5" />,
                      features: form.features,
                      filteredFeatures: form.features,
                    });
                  }

                  return (
                    <>
                      {filteredGroups.length === 0 && !showCreate && q && (
                        <p className="text-sm text-text-muted text-center py-4">
                          No features match &ldquo;{featureSearch.trim()}&rdquo;
                        </p>
                      )}
                      {filteredGroups.map((group) => {
                        const isSelectedGroup = group.label === "Selected Features";
                        return (
                          <div key={group.label} className={isSelectedGroup ? "pb-4 mb-2 border-b border-border-light" : ""}>
                            <p className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest mb-2.5 ${
                              isSelectedGroup ? "text-brand-primary" : "text-text-muted"
                            }`}>
                              {group.icon}{group.label}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {group.filteredFeatures.map((feature) => {
                                const active = form.features.includes(feature);
                                return (
                                  <button key={feature} type="button" onClick={() => toggleFeature(feature)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                                      active
                                        ? "bg-brand-primary border-brand-primary text-white"
                                        : "bg-surface-light border-border-light text-text-secondary hover:border-brand-primary"
                                    }`}>
                                    {active && <Check className="w-3 h-3" />}
                                    {feature}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {showCreate && (
                        <div className="border-t border-border-light pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setFeatureModalInitialName(featureSearch.trim());
                              setFeatureModalOpen(true);
                              setFeatureSearch("");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-brand-primary hover:bg-brand-primary/5 transition-colors rounded-xl font-medium border border-brand-primary/20"
                          >
                            <Plus className="w-4 h-4" />
                            Create &ldquo;{titleCase(featureSearch)}&rdquo;
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {form.features.length > 0 && (
                <p className="mt-4 text-xs text-text-muted border-t border-border-light pt-3">
                  <span className="font-semibold text-brand-primary">{form.features.length}</span>{" "}
                  feature{form.features.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              RIGHT: Sticky sidebar (Publish + Pricing)
          ════════════════════════════════════════════════ */}
          <div className="space-y-4 xl:sticky xl:top-24">

            {/* ── Publish Panel ────────────────────────────── */}
            <div className="bg-surface-white border border-border-light rounded-2xl p-5 shadow-card">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Publish</h3>

              {/* Status toggle */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Listing Status</label>
                <div className="flex rounded-xl overflow-hidden border border-border-light">
                  {["Available", "Sold"].map((s) => (
                    <button key={s} type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                        form.status === s
                          ? "bg-brand-dark text-surface-white"
                          : "bg-surface-white text-text-muted hover:bg-surface-light"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>



              {/* Save */}
              <button type="submit" disabled={saving || uploading || !isDirty}
                className={`flex w-full items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-colors btn-primary ${
                  !isDirty
                    ? "bg-brand-dark text-surface-white opacity-50 cursor-not-allowed"
                    : "bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-60"
                }`}>
                {saving || uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{uploading ? "Uploading…" : "Saving…"}</>
                  : <><Save className="w-4 h-4" />{editId ? "Update Vehicle" : "Add Vehicle"}</>
                }
              </button>

              <Link href="/admin/dashboard/cars"
                className="flex items-center justify-center mt-2.5 py-2.5 text-xs font-medium text-text-muted hover:text-text-primary rounded-xl hover:bg-surface-light transition-colors">
                Discard changes
              </Link>
            </div>

            {/* ── Pricing Summary ──────────────────────────── */}
            {(form.price > 0 || form.marketPrice > 0) && (
              <div className="bg-surface-light border border-border-light rounded-2xl p-5 mt-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Pricing Summary</h3>
                <div className="space-y-2">
                  {form.price > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">Our Price</span>
                      <span className="text-sm font-bold text-text-primary">{fmtPrice(form.price)}</span>
                    </div>
                  )}
                  {form.marketPrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">Market Price</span>
                      <span className="text-xs text-text-muted line-through">{fmtPrice(form.marketPrice)}</span>
                    </div>
                  )}
                  {savings > 0 && (
                    <>
                      <div className="h-px bg-border-light my-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">Buyer Saves</span>
                        <span className="text-xs font-semibold text-action-green">
                          {fmtPrice(savings)} ({savingsPct}%)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </form>

      {/* ── Image crop modal (portal-style overlay) ──────────────────── */}
      {currentCrop && (
        <ImageCropModal
          file={currentCrop.file}
          objectUrl={currentCrop.url}
          queueRemaining={cropQueue.length + 1}
          onConfirm={handleCropConfirm}
          onSkip={handleCropSkip}
          onCancel={handleCropCancelAll}
        />
      )}

      {/* ── Create Brand modal ───────────────────────────────────────── */}
      {brandModalOpen && (
        <CreateBrandModal
          initialName={brandModalInitialName}
          onClose={() => setBrandModalOpen(false)}
          onCreate={(name) => {
            addBrandToList(name);
            setForm((f) => ({ ...f, brand: name }));
            setBrandModalOpen(false);
          }}
        />
      )}

      {/* ── Create Feature modal ──────────────────────────────────────── */}
      {featureModalOpen && (
        <CreateFeatureModal
          initialName={featureModalInitialName}
          onClose={() => setFeatureModalOpen(false)}
          onCreate={(name) => {
            addCustomFeature(name);
            toggleFeature(name);
            setFeatureModalOpen(false);
          }}
        />
      )}

      {/* ── Create Category modal ─────────────────────────────────────── */}
      {categoryModalOpen && (
        <CreateCategoryModal
          initialName={categoryModalInitialName}
          onClose={() => setCategoryModalOpen(false)}
          onCreate={(category) => {
            addCategoryToList(category);
            setForm((f) => ({ ...f, categoryId: category._id }));
            setCategoryModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
