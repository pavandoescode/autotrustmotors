import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const quickLinks = [
  { label: "Browse Cars", href: "/cars" },
  { label: "Categories", href: "/categories" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(160deg, #1a2d5c 0%, #1e3a6e 100%)" }}>
      {/* Top strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shrink-0">
                <span className="text-white font-extrabold text-xs">AT</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">AutoTrust Motors</p>
                <p className="text-[11px] text-blue-200">Quality Pre-Owned Cars</p>
              </div>
            </div>
            <a
              href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 99999 99999"}`}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              {process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 99999 99999"}
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <p className="text-sm text-blue-100 leading-relaxed mb-5">
              Your trusted destination for quality pre-owned vehicles.
              Every car inspected. Every price transparent. Serving customers since 2016.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wide">
              Visit Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <span className="text-sm text-blue-200 leading-relaxed">
                  123 Auto Mall, MG Road,<br />Bangalore, Karnataka 560001
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-300 shrink-0" />
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 99999 99999"}`}
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  {process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 99999 99999"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-300 shrink-0" />
                <a href="mailto:info@autotrustmotors.in" className="text-sm text-blue-200 hover:text-white transition-colors">
                  info@autotrustmotors.in
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="text-sm text-blue-200">Mon–Sat: 10am – 8pm</span>
              </li>
            </ul>
          </div>

          {/* Legal + CTA */}
          <div>
            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2.5 mb-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/cars"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Browse All Cars →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-blue-300">
            © {new Date().getFullYear()} AutoTrust Motors. All rights reserved. · Bangalore, Karnataka
          </p>
        </div>
      </div>
    </footer>
  );
}
