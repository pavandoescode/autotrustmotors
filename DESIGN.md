# Design System: AutoTrust Motors — Mid-Tier Dealership

## 1. Overview

**Creative North Star: "Commercial Dealership, Built to Convert"**

This design system targets the mid-tier used car dealership segment — approachable, trustworthy, and value-focused. Think Maruti True Value, Mahindra First Choice, or Spinny. The aesthetic is functional, commercial, and practical. Dense information beats whitespace. Urgency beats elegance.

---

## 2. Colors

### Core Palette
- **Primary:** `#2563EB` — Blue. Trustworthy, commercial, industry-standard.
- **Primary Hover:** `#1D4ED8`
- **Primary Light:** `#EFF6FF`
- **Accent (Promotional):** `#EA580C` — Orange. Used for promo strips, deal badges, urgency elements.
- **Accent Hover:** `#C2410C`
- **Accent Light:** `#FFF7ED`
- **Success:** `#16A34A` — Green. Savings, availability badges.
- **Hero Background:** `#1a2d5c` (commercial navy) — used for hero section and stats strip.

### Surface Hierarchy
- `#FFFFFF` — Cards, forms, main content areas
- `#F8FAFC` — Page background, input backgrounds, muted sections
- `#1E293B` — Admin sidebar, dark UI surfaces

### Text
- `#0F172A` — Primary text (headings, labels)
- `#475569` — Secondary text (descriptions, meta)
- `#94A3B8` — Muted text (timestamps, helper text)

### Rules
- Use orange (`brand-accent`) exclusively for promotional/urgency elements: promo strips, "Limited Offer" banners, deal callouts.
- Never use orange for navigation or structural UI.
- Borders: always `1px solid #E2E8F0` (`border-light`). No borderless cards.

---

## 3. Typography

**Font:** Inter (Google Fonts), weights 400–800. No serif fonts.

### Scale
- **Page Titles:** `text-xl sm:text-2xl font-bold` — clear, not oversized
- **Section Titles:** `text-xl sm:text-2xl font-bold`
- **Card Titles:** `text-[14px] sm:text-[15px] font-bold`
- **Body:** `text-sm` (14px) — comfortable reading density
- **Labels/Meta:** `text-xs` (12px) or `text-[11px]`
- **Price Display:** `font-black` (900 weight) — prices must stand out

### Rules
- No editorial decorative elements (large background numbers, oversized numerals).
- No all-caps except badge labels (`uppercase tracking-wider` on `text-[10px]` max).
- No serif headings.

---

## 4. Spacing

**Principle: commercial density over luxury whitespace.**

- Section vertical padding: `py-10 sm:py-12` (never py-16 or above on public pages)
- Card internal padding: `p-4` to `p-5`
- Grid gaps: `gap-5` to `gap-6`
- Hero vertical padding: `py-10 sm:py-14`

---

## 5. Components

### Hero Section
- Dark navy gradient background (`#1a2d5c → #1e3a6e`)
- Promotional orange strip at very top for current offers
- Centered headline: large, bold, stock count visible
- White search form card (brand + fuel + budget dropdowns)
- Quick-filter pill row (SUV, Sedan, Under ₹5L, Diesel, Automatic)
- Stats strip at bottom (white text on navy)
- Phone number always visible

### Vehicle Cards
- White background, `border border-border-light`, `rounded-lg`
- Full-bleed image (`aspect-[16/10]`)
- Savings badge: green, top-left of image
- Sold overlay: white wash + "SOLD" label
- Info section: `p-4`
- Price: `font-black`, prominent
- EMI estimate: always shown below price (`₹X,XXX/mo`)
- Actions: WhatsApp icon + "View" button

### Filter Bar
- Always-visible row: Search input + Brand dropdown + Fuel dropdown + "More" toggle + Search button
- "More" toggle reveals: Transmission + Min/Max price
- Active filter pills shown inline when filters applied

### Section Headers
- Left-aligned on listing/utility sections (not centered)
- Centered only on full-width feature sections
- No decorative pill badges on simple utility sections
- No editorial "hero voice" copy

### Testimonials
- Mid-tier cars only (Maruti, Hyundai, Tata, Honda, Kia, Toyota)
- Rating summary (4.9 / 500+ reviews) shown in header
- Compact cards: `p-5`, `rounded-lg`

### Stats Counter
- Navy background strip (`#1a2d5c`)
- White numbers, blue-200 labels
- `py-10 sm:py-12`

### Why Choose Us
- Icon badges (filled blue square with white icon)
- Horizontal card layout: icon left, content right
- Orange accent for feature highlight label
- `py-10 sm:py-12`

### Promotions Strip (Below Hero)
- Blue-tinted light background
- 4 key benefits inline: Financing rate, RC Transfer, Home Delivery, Return Policy
- `text-brand-primary` text with small icons

---

## 6. Do's and Don'ts

### Do
- Show EMI estimates on every vehicle card
- Display stock count prominently ("500 cars available")
- Use orange for promotional/urgency callouts
- Keep section padding tight (py-10/py-12)
- Show active filter pills inline
- Use practical, outcome-focused copy ("Find your car" not "Discover perfection")
- Feature mid-tier Indian car brands in testimonials (Maruti, Hyundai, Tata, etc.)
- Keep borders visible — cards need clear definition

### Don't
- Use excessive vertical padding (py-16+ on public sections)
- Use decorative large background numbers (editorial luxury signal)
- Use serif fonts anywhere
- Use opacity-faded logos (they look unfinished)
- Center all section headers (left-align for practical sections)
- Use luxury copy ("curated collection", "bespoke", "prestige")
- Use gold, dark navy (#080e1a), or glassmorphism
- Feature luxury European car brands in testimonials (BMW, Mercedes, Audi)
