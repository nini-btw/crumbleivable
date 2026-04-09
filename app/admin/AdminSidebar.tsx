"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ClockIcon,
  VoteIcon,
  LogOutIcon,
  CookieIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/presentation/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboardIcon, label: "Dashboard" },
  { href: "/admin/products", icon: PackageIcon, label: "Products" },
  { href: "/admin/drop", icon: ClockIcon, label: "Weekly Drop" },
  { href: "/admin/votes", icon: VoteIcon, label: "Votes" },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#F4538A] text-white rounded-lg cursor-pointer hover:bg-[#D63A72] transition-colors shadow-lg"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-[#2C1810] text-white flex flex-col z-40 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <CookieIcon className="w-8 h-8 text-[#F4538A]" />
            <div>
              <span className="font-display text-xl text-white">crumbleivable!</span>
              <span className="text-xs text-white/50 block mt-0.5">
                Admin Dashboard
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-[#F4538A] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all w-full cursor-pointer"
          >
            <LogOutIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
