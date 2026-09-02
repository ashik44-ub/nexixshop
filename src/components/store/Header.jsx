"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export default function Header() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-primary-700 shrink-0">
          Shop<span className="text-gray-900">Now</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-primary-700">Home</Link>
          <Link href="/shop" className="hover:text-primary-700">Shop</Link>
        </nav>

        <div className="hidden md:flex flex-1 max-w-md relative">
          <input placeholder="Search products..." className="input-field pl-10" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {session ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-card border border-gray-100 py-2 text-sm">
                  <p className="px-4 py-1 text-gray-500 truncate">{session.user.email}</p>
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  {["admin", "manager"].includes(session.user.role) && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                      <LayoutDashboard className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-red-600"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-700">
              <User className="h-5 w-5" /> <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-2 text-sm font-medium">
          <Link href="/" className="block">Home</Link>
          <Link href="/shop" className="block">Shop</Link>
        </div>
      )}
    </header>
  );
}
