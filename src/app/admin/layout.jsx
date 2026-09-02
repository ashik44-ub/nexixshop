"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Store } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 font-bold text-lg text-primary-700 border-b border-gray-100">
          <Store className="h-5 w-5 mr-2" /> Admin Panel
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links
            .filter((l) => !l.adminOnly || role === "admin")
            .map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    active ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/" className="block text-xs text-gray-400 px-4 py-2">← Back to store</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <p className="text-sm text-gray-500 md:hidden font-bold text-primary-700">Admin Panel</p>
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
