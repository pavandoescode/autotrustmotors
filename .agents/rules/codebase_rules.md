---
trigger: always_on
---

# Luxury Motors — Codebase Rules & Guidelines

> **Purpose**: This document is the single source of truth for ALL AI-assisted development on this project.
> Every code generation, edit, refactoring, or feature addition MUST conform to these rules.
> These rules are derived from the existing, production codebase and must be followed WITHOUT EXCEPTION.

---

## 0. CRITICAL DIRECTIVES (Read First)

1. **DO NOT deviate** from the established patterns below. If a pattern exists in the codebase, replicate it exactly.
2. **DO NOT introduce new dependencies** without explicit user approval. The tech stack is locked.
3. **DO NOT use raw CSS**. Always use Tailwind CSS utility classes via the defined design tokens.
4. **DO NOT use Shadcn UI** — the project uses custom components only (Atomic Design).
5. **DO NOT use bright greens, blues, or reds** anywhere in the UI. The palette is Black/White/Gray + Gold only.
6. **Always verify** against `AGENTS.md` — Next.js 16 has breaking changes from training data. Check `node_modules/next/dist/docs/` for current API conventions.

---

## 1. Tech Stack (Locked)

| Layer              | Technology                                        | Version |
|--------------------|---------------------------------------------------|---------|
| Framework          | Next.js (App Router)                              | 16.2.2  |
| Language           | TypeScript (strict mode)                          | ^5      |
| UI Library         | React                                             | 19.2.4  |
| Styling            | Tailwind CSS v4 (via `@tailwindcss/postcss`)      | ^4      |
| Database           | MongoDB + Mongoose ODM                            | ^9.4.1  |
| Authentication     | NextAuth.js (Credentials provider, JWT sessions)  | ^4.24   |
| Image Storage      | Cloudinary (server-side upload, client-side delivery) | ^2.9.0 |
| Icons              | `lucide-react` (ONLY this — no other icon library)| ^1.7.0  |
| Charts             | Recharts                                          | ^3.8.1  |
| State Management   | React Hooks + Zustand (if needed)                 | ^5.0.12 |
| Password Hashing   | bcryptjs                                          | ^3.0.3  |
| Fonts              | Playfair Display (Serif) + Montserrat (Sans-Serif)| Google  |

### DO NOT Install
- Shadcn UI, Radix UI, HeadlessUI, Material UI, Chakra UI, Ant Design
- Font Awesome, Heroicons, React Icons (use `lucide-react` exclusively)
- Styled-components, Emotion, CSS Modules
- Axios (use native `fetch`)
- Any CSS framework other than Tailwind CSS v4

---

## 2. Project Structure

The project lives inside the `app/` subdirectory. The monorepo root (`VEHICLE LISTING WEBSITE + ADMIN PANEL/`) contains `app/` as the actual Next.js project.

```
app/                          ← Next.js project root
├── src/
│   ├── app/                  ← App Router (pages + API routes)
│   │   ├── (public)/         ← Public-facing route group
│   │   │   ├── layout.tsx    ← Public layout (Header + Footer + WhatsAppFAB)
│   │   │   ├── page.tsx      ← Home page
│   │   │   ├── cars/         ← Vehicle listing & detail pages
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── about/
│   │   │   ├── categories/
│   │   │   ├── contact/
│   │   │   ├── gallery/
│   │   │   ├── privacy/
│   │   │   └── terms/
│   │   ├── admin/            ← Admin route group
│   │   │   ├── login/
│   │   │   └── dashboard/    ← Protected admin pages
│   │   │       ├── layout.tsx  ← Admin sidebar + topbar
│   │   │       ├── page.tsx    ← Dashboard stats
│   │   │       ├── vehicles/
│   │   │       ├── categories/
│   │   │       └── leads/
│   │   ├── api/              ← API Route Handlers
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── vehicles/
│   │   │   │   ├── route.ts  ← GET (list), POST (create)
│   │   │   │   └── [id]/route.ts ← GET, PUT, DELETE
│   │   │   ├── categories/
│   │   │   ├── leads/
│   │   │   └── upload/       ← Cloudinary multi-image upload
│   │   ├── login/            ← Admin login page (outside route group)
│   │   ├── globals.css       ← Design tokens & utility classes
│   │   ├── layout.tsx        ← Root layout (fonts, metadata)
│   │   └── not-found.tsx     ← Custom 404 page
│   ├── components/           ← Atomic Design System
│   │   ├── atoms/            ← Smallest reusable units
│   │   ├── molecules/        ← Composed from atoms
│   │   └── organisms/        ← Complex, self-contained sections
│   ├── lib/                  ← Shared utilities & configs
│   │   ├── mongodb.ts        ← Cached DB connection
│   │   ├── auth.ts           ← NextAuth configuration
│   │   ├── cloudinary.ts     ← Server-only upload logic
│   │   ├── cloudinary-shared.ts ← URL building (client-safe)
│   │   └── utils.ts          ← Formatting helpers (formatPrice)
│   ├── models/               ← Mongoose schemas & models
│   │   ├── Vehicle.ts
│   │   ├── Category.ts
│   │   ├── Lead.ts
│   │   └── Admin.ts
│   ├── types/                ← Shared TypeScript interfaces
│   │   └── index.ts
│   ├── middleware.ts          ← NextAuth route protection
│   └── scripts/              ← One-off migration/seed scripts
├── scripts/                   ← Top-level utility scripts
├── public/                    ← Static assets (hero-bg.png, etc.)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

### Naming Rules
- **Files**: PascalCase for components (`VehicleCard.tsx`), camelCase for utilities (`mongodb.ts`)
- **Directories**: lowercase (`atoms/`, `molecules/`, `organisms/`, `lib/`, `models/`, `types/`)
- **Route segments**: lowercase with hyphens if multi-word, or brackets for dynamic (`[id]`)
- **CSS**: `globals.css` is the ONLY CSS file. All styles via Tailwind classes.

---

## 3. Component Architecture (Atomic Design)

### 3.1 Classification Rules

| Level       | Directory                     | Purpose                                   | Examples                                |
|-------------|-------------------------------|-------------------------------------------|-----------------------------------------|
| **Atoms**   | `src/components/atoms/`       | Single-purpose, zero-logic display units  | `CloudinaryImage`, `WhatsAppFAB`        |
| **Molecules** | `src/components/molecules/` | Composed from atoms, may contain logic    | `VehicleCard`, `FilterBar`, `ShareButton`, `PriceConfidence`, `BrandCarousel` |
| **Organisms** | `src/components/organisms/` | Complex, self-contained page sections     | `Header`, `Footer`, `HeroSection`, `LeadForm`, `EMICalculator`, `ImageGallery`, `StatsCounter`, `Testimonials`, `WhyChooseUs` |

### 3.2 Component Rules

1. **Default to React Server Components (RSC)**. Only add `"use client"` when interactivity is required.
2. **Current `"use client"` components**: `Header`, `HeroSection`, `FilterBar`, `LeadForm`, `EMICalculator`, `ImageGallery`, `ShareButton`, `CloudinaryImage`, `WhatsAppFAB`. All others are server components.
3. **Always define `interface` for props**:
   ```tsx
   interface VehicleCardProps {
     vehicle: IVehicle;
   }
   export default function VehicleCard({ vehicle }: VehicleCardProps) { ... }
   ```
4. **One component per file**. Export as `default`.
5. **Import types** from `@/types` (shared interfaces like `IVehicle`, `ICategory`, `ILead`).
6. **Import utils** from `@/lib/utils` for formatting (e.g., `formatPrice`).
7. **Image component**: ALWAYS use `@/components/atoms/CloudinaryImage` instead of `next/image` for any image that comes from Cloudinary. Use `next/image` directly ONLY for local static assets (like `hero-bg.png`).

### 3.3 Server Component Data Fetching Pattern

Pages fetch data directly using `async` functions. NEVER use `getServerSideProps` or `getStaticProps`:
```tsx
async function getLatestVehicles(): Promise<IVehicle[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/vehicles?limit=6&status=Available`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const vehicles = await getLatestVehicles();
  // ...render
}
```

---

## 4. Path Aliases & Imports

The project uses a single path alias defined in `tsconfig.json`:

```json
"paths": { "@/*": ["./src/*"] }
```

### Import Conventions (in order):
```tsx
// 1. External packages
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NextRequest, NextResponse } from "next/server";

// 2. Lucide icons
import { Fuel, Gauge, User, MapPin, MessageCircle } from "lucide-react";

// 3. Internal components (via @ alias)
import CloudinaryImage from "@/components/atoms/CloudinaryImage";
import VehicleCard from "@/components/molecules/VehicleCard";

// 4. Internal utilities & config
import { formatPrice } from "@/lib/utils";
import dbConnect from "@/lib/mongodb";

// 5. Types
import { IVehicle, ICategory } from "@/types";

// 6. Models (API routes only)
import Vehicle from "@/models/Vehicle";
```

**STRICT**: Never use relative imports (`../../`) when `@/` alias is available.

---

## 5. TypeScript Conventions

### 5.1 Shared Interfaces (`src/types/index.ts`)

All domain model interfaces are centralized here. They use the `I` prefix:

| Interface          | Purpose                        |
|--------------------|--------------------------------|
| `IVehicle`         | Vehicle data for client-side   |
| `ICategory`        | Category data for client-side  |
| `ILead`            | Lead/inquiry data              |
| `IAdmin`           | Admin user data                |
| `ApiResponse<T>`   | Standard API envelope          |
| `PaginatedResponse<T>` | Paginated list response   |
| `VehicleFilters`   | Query parameter shape          |

### 5.2 Mongoose Document Interfaces (`src/models/*.ts`)

Each model file defines its own `I*Document` interface with `mongoose.Types.ObjectId`:
```tsx
export interface IVehicleDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  // ...
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3 Rules
- **Strict TypeScript** is enabled (`"strict": true`).
- Use `interface` (not `type`) for object shapes.
- Always type function parameters and return types for utilities.
- Use union literal types for enum-like fields: `'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG'`
- For API route filter objects, use `Record<string, unknown>`.

---

## 6. Database & Models

### 6.1 MongoDB Connection Pattern (`src/lib/mongodb.ts`)
- Uses global caching to survive HMR in development.
- Call `await dbConnect()` at the top of every API route handler.
- Connection options: `{ bufferCommands: false }`.

### 6.2 Mongoose Model Pattern
Every model file follows this exact structure:
```tsx
import mongoose, { Schema, Model } from 'mongoose';

export interface I<Name>Document {
  _id: mongoose.Types.ObjectId;
  // fields...
  createdAt: Date;
  updatedAt: Date;
}

const <Name>Schema = new Schema(
  {
    // field definitions with validation messages
    fieldName: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    // enum fields
    status: {
      type: String,
      enum: ['Value1', 'Value2'],
      default: 'Value1',
      index: true,
    },
    // references
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
<Name>Schema.index({ field1: 1, field2: 1 });

const <Name>: Model<I<Name>Document> =
  mongoose.models.<Name> || mongoose.model<I<Name>Document>('<Name>', <Name>Schema);

export default <Name>;
```

### 6.3 Model Registration Guard
ALWAYS use the `mongoose.models.X || mongoose.model(...)` pattern to prevent model re-registration during HMR:
```tsx
const Vehicle: Model<IVehicleDocument> =
  mongoose.models.Vehicle || mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);
```

### 6.4 Existing Models & Their Key Fields

| Model     | Key Fields                                                               | Enums                                                           |
|-----------|--------------------------------------------------------------------------|-----------------------------------------------------------------|
| Vehicle   | title, brand, model, year, price, marketPrice, fuelType, transmission, owner, mileage, registrationState, images[], features[], status, categoryId | fuelType: Petrol/Diesel/Electric/Hybrid/CNG · transmission: Automatic/Manual · owner: 1st-4th+ · status: Available/Sold |
| Category  | name, slug                                                               | —                                                               |
| Lead      | name, email, phone, message, vehicleId?, status                          | status: New/Contacted/Resolved                                  |
| Admin     | email, password (hashed, select:false)                                   | — (has `comparePassword` instance method)                       |

---

## 7. API Route Conventions

### 7.1 File Structure
```
src/app/api/<resource>/route.ts        → GET (list), POST (create)
src/app/api/<resource>/[id]/route.ts   → GET (detail), PUT (update), DELETE (delete)
```

### 7.2 Handler Pattern
Every API handler follows this exact pattern:
```tsx
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    // ... business logic ...
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/vehicles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}
```

### 7.3 Response Envelope
ALL API responses use a consistent envelope:
```json
// Success (single)
{ "success": true, "data": { ... } }

// Success (list with pagination)
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 60,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}

// Error
{ "success": false, "error": "Error message" }

// Success with message
{ "success": true, "data": { ... }, "message": "Created successfully!" }
```

### 7.4 Dynamic Route Params (Next.js 16)
In Next.js 16, `params` is a Promise. Always `await` it:
```tsx
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  // ...
}
```

### 7.5 Search Params in Pages (Next.js 16)
`searchParams` is also a Promise in page components:
```tsx
interface StockPageProps {
  searchParams: Promise<{ brand?: string; page?: string; }>;
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams;
  // ...
}
```

### 7.6 Query Filtering Pattern
Build MongoDB filter objects dynamically from search params:
```tsx
const filter: Record<string, unknown> = {};
if (brand) filter.brand = { $regex: brand, $options: 'i' };
if (fuelType) filter.fuelType = fuelType;
if (minPrice || maxPrice) {
  filter.price = {};
  if (minPrice) (filter.price as Record<string, number>).$gte = parseInt(minPrice);
  if (maxPrice) (filter.price as Record<string, number>).$lte = parseInt(maxPrice);
}
if (search) {
  filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { brand: { $regex: search, $options: 'i' } },
    { model: { $regex: search, $options: 'i' } },
  ];
}
```

---

## 8. Authentication & Middleware

### 8.1 NextAuth Configuration (`src/lib/auth.ts`)
- Provider: `CredentialsProvider` only (email + password)
- Session strategy: `jwt` (24-hour max age)
- Login page: `/login`
- Model: queries `Admin` with `+password` select for comparison

### 8.2 Middleware (`src/middleware.ts`)
- Uses `withAuth` from `next-auth/middleware`
- Protects: `/admin/dashboard/:path*`
- Redirects unauthenticated users to `/login`

### 8.3 Rules
- NEVER expose the admin API routes without auth checks in production.
- The login page is at `app/src/app/login/page.tsx` (outside route groups).
- Uses `signIn("credentials", { redirect: false })` pattern for client-side login.

---

## 9. Cloudinary Integration

### 9.1 Architecture
The Cloudinary integration is split into two files for Next.js RSC compatibility:

| File                      | Scope         | Exports                                          |
|---------------------------|---------------|---------------------------------------------------|
| `lib/cloudinary.ts`       | Server-only   | `uploadImage()`, `deleteImage()`, `cloudinary` instance |
| `lib/cloudinary-shared.ts`| Client-safe   | `buildCloudinaryDeliveryUrl()`, `isCloudinaryUrl()`, `extractCloudinaryPublicId()`, `buildCloudinaryFolderPath()` |

### 9.2 Image Display Pattern
Always use the `CloudinaryImage` atom component:
```tsx
import Image from "@/components/atoms/CloudinaryImage";

<Image
  src={vehicle.images[0]}
  alt={vehicle.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 9.3 Upload Pattern
Uploads go through `/api/upload` which uses `FormData` with `images` field:
```tsx
const formData = new FormData();
files.forEach(file => formData.append('images', file));
const res = await fetch('/api/upload', { method: 'POST', body: formData });
```

### 9.4 Folder Structure
All uploads go to: `luxury-motors/assets/vehicles/` (configurable via env).

---

## 10. Styling & Design Tokens

### 10.1 Tailwind CSS v4 Configuration
Tailwind v4 uses CSS-native `@theme inline` blocks in `globals.css` instead of `tailwind.config.js`:

```css
@import "tailwindcss";

@theme inline {
  --color-brand-dark: #0B111D;
  --color-brand-gold: #C8A253;
  --color-brand-gold-hover: #B38D46;
  --color-brand-gold-light: #F5ECD7;
  --color-surface-light: #F8F9FA;
  --color-surface-white: #FFFFFF;
  --color-surface-dark: #0B111D;
  --color-surface-muted: #6B7280;
  --color-text-primary: #0B111D;
  --color-text-secondary: #4B5563;
  --color-text-muted: #9CA3AF;
  --color-text-inverse: #FFFFFF;
  --color-text-gold: #C8A253;
  --color-border-light: #E5E7EB;
  --color-border-dark: #1F2937;
  --font-sans: var(--font-montserrat), 'Montserrat', sans-serif;
  --font-serif: var(--font-playfair), 'Playfair Display', serif;
}
```

### 10.2 Token Usage In Classes
| Purpose              | Tailwind Class                 | NOT This                    |
|----------------------|--------------------------------|-----------------------------|
| Brand dark bg        | `bg-brand-dark`                | `bg-[#0B111D]`              |
| Gold text            | `text-brand-gold`              | `text-[#C8A253]`            |
| Light surface        | `bg-surface-light`             | `bg-gray-50`, `bg-[#F8F9FA]`|
| Primary text         | `text-text-primary`            | `text-gray-900`             |
| Secondary text       | `text-text-secondary`          | `text-gray-600`             |
| Muted text           | `text-text-muted`              | `text-gray-400`             |
| Card border          | `border-border-light`          | `border-gray-200`           |
| Serif headings       | `font-serif`                   | manual font-family          |
| Sans body            | `font-sans`                    | manual font-family          |

### 10.3 STRICT: NO Arbitrary Values
```tsx
// ✅ Correct
className="text-brand-gold bg-brand-dark"

// ❌ Incorrect — arbitrary values
className="text-[#C8A253] bg-[#0B111D]"
```

### 10.4 Custom CSS Utility Classes (in `globals.css`)
These are defined once and reused across components:

| Class              | Purpose                                         |
|--------------------|--------------------------------------------------|
| `.gold-gradient`   | Gold gradient background                         |
| `.dark-gradient`   | Dark gradient background                         |
| `.hero-overlay`    | Hero section gradient overlay                    |
| `.text-gold-gradient` | Gold gradient text (uses `-webkit-background-clip`) |
| `.shimmer`         | Shimmer loading animation                        |
| `.card-hover`      | Card hover transition (`translateY(-2px)`, border gold) |
| `.btn-primary`     | Button hover/active transitions                  |
| `.animate-marquee` | Infinite marquee scroll for brand carousel       |

---

## 11. UI Design Rules (Aesthetic Guidelines)

### Design Philosophy — The "Why" Behind The Rules

**Target Audience**: Urban professionals aged 28–55, upper-middle to high income, looking for luxury cars at better-than-new prices. They research online, compare prices, and value trust, transparency, and exclusivity. **60%+ browse on mobile phones** — mobile-first design is not optional.

Before touching specific styles, understand the overarching philosophy:

- **Confidence through Minimalism**: Cheap brands shout (huge red text, blinking badges, cluttered boxes). Luxury brands whisper. They are confident enough to use empty space. Think Porsche, Vogue, Rolex.
- **Frictionless Experience**: The user shouldn't have to search for information. The layout should guide their eyes effortlessly from the product (the car) → the value (the price) → the action (enquire).
- **Consistency is Key**: A luxury experience is broken the moment one button is bright green while the rest of the site is dark and moody. Every element must belong to the same visual family.
- **Typography conveys heritage**: Serif fonts (Playfair Display) convey elegance and exclusivity. Paired with geometric Sans-Serif (Montserrat) for numbers and specs, it stays modern yet classic.
- **Whitespace = luxury**: Discount stores pack information into tight bordered boxes. Luxury design breathes. Empty space is the ultimate digital luxury signal.
- **Restrained palette = premium**: A strictly controlled Black/White/Gold palette reads as deliberately curated. Introducing random greens and blues immediately makes it look like a standard corporate template.
- **Slow transitions = polish**: Jerky, fast, or dramatic animations feel cheap. Premium products use slow, smooth, subtle transitions (300–500ms). Everything should feel effortlessly smooth.

### 11.1 Color Palette — STRICT
- **90% of UI**: Black (`brand-dark`), White (`surface-white`), Grays
- **Single accent**: Gold (`brand-gold` / `#C8A253`)
- **NEVER use**: Standard bright green, blue, red for buttons, badges, or status indicators
- **WhatsApp buttons**: Use `brand-dark` bg with `brand-gold` text (NOT green)
- **Sold badge**: Uses `brand-dark` bg with `surface-white` text + `brand-gold` border
- **Success states**: Use `brand-gold` tints or subtle gold backgrounds
- **Error text**: The ONLY exception — `text-red-500` is acceptable for form validation errors ONLY

### 11.2 Typography
- **Headings** (h1–h6, car titles, section titles): `font-serif` (Playfair Display)
- **Body text** (paragraphs, specs, prices, badges, buttons, nav): `font-sans` (Montserrat)
- Auto-applied via `globals.css`: all heading tags get `font-serif` automatically

### 11.3 Spacing & Layout
- **Section padding**: `py-24 sm:py-32` for major sections (generous vertical breathing room)
- **Content max-width**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Card grids**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- **No box-in-a-box**: Don't nest colored containers. Let content sit on clean backgrounds.
- **Dividers**: Use `h-px bg-border-light` or `border-t border-border-light` — NOT thick borders.

### 11.4 Price Hierarchy (MANDATORY)
```tsx
{/* Market price — small, gray, struck-through */}
<span className="text-xs text-text-muted line-through font-medium font-sans tracking-wide">
  Market Value: {formatPrice(vehicle.marketPrice)}
</span>

{/* Selling price — large, bold, gold */}
<span className="text-2xl font-bold text-brand-gold tracking-tight font-sans">
  {formatPrice(vehicle.price)}
</span>
```

### 11.5 Buttons — Established Patterns

| Button Type          | Classes                                                                                |
|----------------------|----------------------------------------------------------------------------------------|
| **Primary (Gold)**   | `bg-brand-gold text-brand-dark font-semibold rounded-xl hover:bg-brand-gold-hover transition-all duration-300 btn-primary font-sans` |
| **Primary (Dark)**   | `bg-brand-dark text-surface-white font-semibold rounded-lg hover:bg-brand-dark/90 transition-all duration-300 font-sans` |
| **Outline (Gold)**   | `border border-brand-gold/30 text-brand-dark font-semibold rounded-lg hover:bg-brand-gold hover:text-brand-dark hover:border-brand-gold transition-all duration-300 font-sans` |
| **Outline (Dark)**   | `border border-brand-dark/20 text-brand-dark font-semibold rounded-xl hover:bg-brand-dark hover:text-surface-white transition-all duration-300 font-sans` |
| **Ghost/Text**       | `text-text-muted hover:text-brand-gold transition-colors duration-300`                  |

### 11.6 Form Input Pattern
All inputs follow this consistent style:
```tsx
<input
  className="w-full px-4 py-3 bg-surface-light border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
/>
```
On dark backgrounds:
```tsx
<input
  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-surface-white placeholder:text-gray-500 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
/>
```

### 11.7 Animations & Interactions
- **Card hover**: `hover:-translate-y-1` or `hover:-translate-y-2` with `transition-all duration-500`
- **Image zoom on hover**: `group-hover:scale-[1.04] transition-transform duration-700 ease-out`
- **All transitions**: Minimum `duration-300`, prefer `duration-500` for cards
- **NO bouncy or aggressive animations**
- **Defined keyframes**: `fade-in`, `slide-up`, `slide-down`, `shimmer`, `float`, `marquee`

### 11.8 Badge Pattern
```tsx
<div className="px-3 py-1.5 bg-brand-dark/90 backdrop-blur-sm border border-brand-gold/30 text-brand-gold text-xs font-medium rounded-lg font-sans">
  Badge Text
</div>
```

### 11.9 Section Header Pattern
```tsx
<span className="inline-block px-5 py-2 bg-brand-gold/[0.06] border border-brand-gold/[0.12] rounded-full text-brand-gold text-sm font-medium tracking-wide font-sans mb-5">
  Section Label
</span>
<h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-text-primary leading-tight">
  Section <span className="text-gold-gradient">Title</span>
</h2>
<p className="text-text-secondary mt-3 max-w-lg font-sans text-base leading-relaxed">
  Description text
</p>
```

### 11.10 Card Container Pattern
```tsx
<div className="group bg-surface-white rounded-2xl overflow-hidden border border-border-light shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:border-brand-gold/60 hover:ring-1 hover:ring-brand-gold/60 transition-all duration-500 hover:-translate-y-1">
```

### 11.11 Spec Grid Pattern (Icons + Text, No Boxes)
```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="flex items-center gap-2 text-xs text-text-secondary font-sans">
    <Fuel className="w-3.5 h-3.5 text-brand-gold shrink-0" />
    {vehicle.fuelType}
  </div>
</div>
```

---

## 12. Layout Patterns

### 12.1 Root Layout (`src/app/layout.tsx`)
- Loads both `Montserrat` and `Playfair_Display` via `next/font/google`
- Sets CSS variables: `--font-montserrat` and `--font-playfair`
- Global metadata with template: `"%s | Luxury Motors"`
- Body: `min-h-full flex flex-col font-sans`

### 12.2 Public Layout (`src/app/(public)/layout.tsx`)
- Wraps pages with: `<Header />` + `<main className="flex-1">` + `<Footer />` + `<WhatsAppFAB />`
- All public pages automatically get this chrome

### 12.3 Admin Layout (`src/app/admin/dashboard/layout.tsx`)
- Sidebar with navigation (Dashboard, Vehicles, Categories, Leads)
- Topbar with breadcrumbs and "View Website →" link
- Mobile-responsive with overlay sidebar
- Active link detection via `usePathname()`

### 12.4 Page Header Pattern (Listing Pages)
Dark header with ambient glow:
```tsx
<section className="bg-brand-dark py-20 sm:py-24 relative overflow-hidden">
  <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-gold/[0.03] rounded-full blur-[120px]" />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    <div className="text-center">
      <span className="... text-brand-gold ...">Section Badge</span>
      <h1 className="... text-surface-white ...">Page Title</h1>
      <p className="text-gray-500 ...">Description</p>
    </div>
  </div>
</section>
```

---

## 13. Environment Variables

### Required Variables
```env
MONGODB_URI=                         # MongoDB connection string
NEXTAUTH_URL=http://localhost:3000   # Base URL for NextAuth
NEXTAUTH_SECRET=                     # JWT signing secret

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # Cloudinary cloud name (client-accessible)
CLOUDINARY_CLOUD_NAME=               # Cloudinary cloud name (server-side)
CLOUDINARY_API_KEY=                   # Cloudinary API key
CLOUDINARY_API_SECRET=                # Cloudinary API secret
CLOUDINARY_FOLDER_PREFIX=luxury-motors  # Upload folder prefix

NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999  # WhatsApp business number
NEXT_PUBLIC_BUSINESS_PHONE=+91 99999 99999  # Display phone number
```

### Access Rules
- `NEXT_PUBLIC_*` variables are safe for client components/browser
- All others are server-only — never import in client components
- Cloudinary upload logic (`cloudinary.ts`) imports `'server-only'` to enforce this

---

## 14. SEO & Metadata

### Page-Level Metadata Pattern
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Cars",  // Becomes "Our Cars | Luxury Motors" via template
  description: "Browse our premium collection of luxury pre-owned vehicles.",
};
```

### Rules
- Every public page MUST export a `metadata` object with `title` and `description`
- Root layout uses template: `"%s | Luxury Motors"`
- Use semantic HTML: single `<h1>` per page, proper heading hierarchy
- Use `<section>` tags for major content blocks

---

## 15. Error Handling Patterns

### API Routes
```tsx
try {
  await dbConnect();
  // ... logic
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error('METHOD /api/resource error:', error);
  const message = error instanceof Error ? error.message : 'Fallback message';
  return NextResponse.json(
    { success: false, error: message },
    { status: 400 | 500 }
  );
}
```

### Client-Side Data Fetching
```tsx
try {
  const res = await fetch("/api/endpoint");
  const data = await res.json();
  if (data.success) { /* handle success */ }
  else { /* handle API error */ }
} catch {
  /* handle network error */
}
```

### Form Submission State Machine
Use a 4-state machine: `"idle" | "loading" | "success" | "error"`
```tsx
const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
```

---

## 16. Utility Functions

### `formatPrice(price: number, options?: { short?: boolean }): string`
- Converts numbers to Indian currency format: `₹46 Lakh`, `₹1.2 Cr`
- `{ short: true }` uses `L` instead of `Lakh`
- Always use this for displaying prices — NEVER format manually

---

## 17. Navigation Links (Canonical)

Public navigation uses these exact routes and labels:
```tsx
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Our Cars", href: "/cars" },
  { label: "Categories", href: "/categories" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];
```

Vehicle detail pages: `/cars/[id]`
Vehicle listing with filters: `/cars?brand=BMW&fuelType=Diesel`

Admin routes:
- `/login` — Admin sign in
- `/admin/dashboard` — Dashboard
- `/admin/dashboard/vehicles` — Vehicle management
- `/admin/dashboard/categories` — Category management
- `/admin/dashboard/leads` — Lead management

---

## 18. WhatsApp Integration Pattern

WhatsApp links follow this exact pattern:
```tsx
const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
const message = encodeURIComponent(
  `Hi! I'm interested in the ${vehicle.title} (${vehicle.year}). Could you share more details?`
);

<a href={`https://wa.me/${phoneNumber}?text=${message}`}
   target="_blank" rel="noopener noreferrer">
```

---

## 19. Responsive Breakpoints

Follow Tailwind's default breakpoint system:
- **Mobile-first**: Default styles apply to mobile
- `sm:` — 640px+ (small tablets)
- `md:` — 768px+ (tablets)
- `lg:` — 1024px+ (desktops)
- `xl:` — 1280px+

Common responsive patterns in this project:
```tsx
// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"

// Text sizing
className="text-3xl sm:text-4xl lg:text-[2.75rem]"

// Section padding
className="py-24 sm:py-32"

// Show/hide
className="hidden lg:flex"      // Desktop only
className="lg:hidden"           // Mobile only
className="hidden sm:inline"    // Hide on smallest screens
```

---

## 20. Do's & Don'ts Summary

### ✅ DO
- Use Tailwind CSS design tokens from `globals.css`
- Follow Atomic Design (atoms → molecules → organisms)
- Use `@/` path aliases for all imports
- Define `interface` for all component props
- Use `formatPrice()` for all price displays
- Use `CloudinaryImage` component for Cloudinary-hosted images
- Call `await dbConnect()` in every API route
- Use the `success/data/error` response envelope
- Use `font-serif` for headings, `font-sans` for body text
- Default to RSC; add `"use client"` only when needed
- Use `lucide-react` for all icons
- Await `params` and `searchParams` in Next.js 16

### ❌ DON'T
- Don't use arbitrary Tailwind values (`text-[#hex]`)
- Don't use any icon library other than `lucide-react`
- Don't use `getServerSideProps`/`getStaticProps`
- Don't import server-only modules in client components
- Don't use bright green/blue/red for UI elements (error text excepted)
- Don't nest colored boxes inside colored boxes
- Don't use relative imports when `@/` is available
- Don't create new CSS files or use raw CSS/styled-components
- Don't introduce new npm packages without approval
- Don't use `any` type — use proper TypeScript types
- Don't use fast/bouncy animations (minimum `duration-300`)
- Don't skip the `mongoose.models.X ||` registration guard
- Don't hardcode Cloudinary URLs — use delivery URL builders
