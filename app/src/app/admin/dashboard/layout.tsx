"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Car, Tag, Users, LogOut, Menu, X, ChevronRight,
} from "lucide-react";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Vehicles", href: "/admin/dashboard/cars", icon: Car },
  { label: "Categories", href: "/admin/dashboard/categories", icon: Tag },
  { label: "Leads", href: "/admin/dashboard/leads", icon: Users },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-light flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-brand-dark flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-white/5 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">LM</span>
            </div>
            <span className="text-base font-bold text-surface-white">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-muted hover:text-text-inverse transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/admin/dashboard" 
              ? pathname === "/admin/dashboard" 
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-primary text-surface-white"
                    : "text-surface-white/60 hover:text-surface-white hover:bg-surface-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-surface-white/5 shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-surface-white/50 hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-surface-white border-b border-border-light flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors mr-3 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-text-secondary min-w-0">
            <Link href="/admin/dashboard" className="hover:text-brand-primary transition-colors shrink-0">
              Admin
            </Link>
            {pathname !== "/admin/dashboard" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <span className="text-text-primary font-medium capitalize truncate max-w-[120px] sm:max-w-none">
                  {pathname.split("/").pop()?.replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>
          <div className="ml-auto shrink-0">
            <Link
              href="/"
              target="_blank"
              className="text-xs sm:text-sm text-brand-primary hover:text-brand-primary-hover font-medium transition-colors whitespace-nowrap"
            >
              <span className="hidden sm:inline">View Website →</span>
              <span className="sm:hidden">View →</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
