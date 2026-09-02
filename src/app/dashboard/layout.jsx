"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/store/Header";
import { LayoutGrid, Package, User } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                pathname === href ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </aside>
        <main className="min-h-[50vh]">{children}</main>
      </div>
    </>
  );
}
