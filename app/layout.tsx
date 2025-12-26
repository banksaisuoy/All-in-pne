import type { Metadata } from "next";
import "./globals.css";
import MobileNav from "@/components/shared/MobileNav";

export const metadata: Metadata = {
  title: "NeuroMarket - AI-First Commerce",
  description: "The next generation of e-commerce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 pb-20 md:pb-0">
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
