import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { MobileNav } from "@/components/shared/MobileNav";
import { Chatbot } from "@/components/shop/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniFlow - AI Powered Commerce",
  description: "Next-gen e-commerce platform built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950`}
      >
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto pb-20 md:pb-0">
            {children}
        </main>
        <Chatbot />
        <MobileNav className="md:hidden" />
      </body>
    </html>
  );
}
