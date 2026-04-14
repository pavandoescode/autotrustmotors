"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import Image from "@/components/atoms/CloudinaryImage";
import { IVehicle } from "@/types";
import { formatPrice } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Our Cars", href: "/cars" },
  { label: "Categories", href: "/categories" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<IVehicle[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/vehicles?search=${encodeURIComponent(searchQuery)}&limit=4`);
        const data = await res.json();
        if (data.success) setSuggestions(data.data);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const submitSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch();
  };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? "shadow-soft" : "border-b border-border-light"}`}>
      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">AT</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                AutoTrust Motors
              </span>
              <span className="text-[10px] tracking-wide text-text-muted -mt-0.5">
                Quality Pre-Owned Cars
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0 xl:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 xl:px-4 py-2 text-[13px] xl:text-sm font-medium text-text-secondary hover:text-brand-primary rounded-lg hover:bg-surface-light transition-all duration-200 font-sans whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA & Search */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <div className={`relative flex items-center transition-all duration-500 overflow-hidden ${isSearchOpen ? "w-64" : "w-10"}`}>
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-surface-light border border-border-light rounded-lg py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all duration-300 ${isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                  autoFocus={isSearchOpen}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isSearchOpen && searchQuery) submitSearch();
                    else setIsSearchOpen(!isSearchOpen);
                  }}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-text-muted hover:text-brand-primary transition-colors ${isSearchOpen ? "text-brand-primary" : ""}`}
                >
                  <Search className="w-5 h-5" />
                </button>
                {isSearchOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Suggestions Dropdown */}
              {isSearchOpen && suggestions.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-[350px] bg-white border border-border-light rounded-xl shadow-lg overflow-hidden z-[60]">
                  <div className="p-2 border-b border-border-light bg-surface-light">
                    <p className="text-[11px] font-semibold text-text-secondary px-3 py-1">Quick Results</p>
                  </div>
                  <div className="divide-y divide-border-light">
                    {suggestions.map((v) => (
                      <Link
                        key={v._id}
                        href={`/cars/${v.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-surface-light transition-colors group"
                      >
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-light">
                          {v.images?.[0] && (
                            <Image src={v.images[0]} alt={v.title} fill className="object-cover" sizes="48px" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary group-hover:text-brand-primary transition-colors truncate font-sans">
                            {v.title}
                          </p>
                          <p className="text-[10px] text-text-muted font-sans">
                            {v.year} • {v.transmission} • {formatPrice(v.price, { short: true })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/cars?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="block text-center py-2.5 bg-surface-light hover:bg-brand-primary-light text-xs text-brand-primary font-semibold transition-colors border-t border-border-light font-sans"
                  >
                    View All Results
                  </Link>
                </div>
              )}
            </div>
            
            <Link
              href="/contact"
              className="px-4 xl:px-5 py-2 bg-brand-primary text-white text-[13px] xl:text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition-all duration-200 btn-primary font-sans whitespace-nowrap"
            >
              Get In Touch
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-text-secondary hover:text-brand-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu — Light overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-t border-border-light animate-slide-down shadow-lg max-h-[calc(100dvh-104px)] overflow-y-auto z-50">

          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-brand-primary hover:bg-surface-light rounded-lg transition-all duration-200 font-sans"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border-light mt-2">
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-3 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
