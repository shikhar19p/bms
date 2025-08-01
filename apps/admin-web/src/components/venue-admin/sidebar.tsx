"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/venue-name-admin/dashboard",
  },
  {
    title: "Bookings",
    icon: CalendarDays,
    href: "/venue-name-admin/bookings",
  },
  {
    title: "Customers",
    icon: Users,
    href: "/venue-name-admin/customers",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/venue-name-admin/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/venue-name-admin/settings",
  },
];

export default function VenueAdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full md:w-[240px] flex-col bg-[#0F172A] text-white">
      <div className="p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Bookmysports Admin
        </h1>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>
      <div className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/10">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
