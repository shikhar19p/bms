"use client";

import { MobileNav } from "./mobile-nav";
import { Navbar } from "./navbar";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-black/95 border-b border-white/10 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Desktop Navbar */}
        <Navbar />
        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </header>
  );
}
