import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "ShopNow — Online Shop",
  description: "Your one-stop shop for everything you need.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}