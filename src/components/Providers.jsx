"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <RouteLoadingIndicator />
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      {children}
    </SessionProvider>
  );
}

// Shows a brief global spinner whenever the route changes.
function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <div className="h-1 bg-primary-600 animate-pulse" />
    </div>
  );
}
