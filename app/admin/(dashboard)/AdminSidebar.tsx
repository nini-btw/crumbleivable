"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingBagIcon,
  ClockIcon,
  VoteIcon,
  LogOutIcon,
  CookieIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/presentation/lib/utils";
import { logoutAdmin } from "../actions";

const navItems = [
  { href: "/admin", icon: LayoutDashboardIcon, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingBagIcon, label: "Orders" },
  { href: "/admin/products", icon: PackageIcon, label: "Products" },
  { href: "/admin/drop", icon: ClockIcon, label: "Weekly Drop" },
  { href: "/admin/votes", icon: VoteIcon, label: "Votes" },
];

interface AdminSidebarProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ userEmail, isOpen, onClose }) => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAdmin();
  };

  return (
    <>
      {/* Backdrop - click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-[#2C1810] text-white flex flex-col z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
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
                onClick={onClose}
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

        <div className="p-4 border-t border-white/10 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-white/60">
            <UserIcon className="w-4 h-4" />
            <span className="truncate">{userEmail}</span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
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
