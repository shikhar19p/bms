"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  role?: string;
  status?: string;
  accessToken?: string;
  onLogout?: () => void;
}

export function Navbar({ role = "", status = "", accessToken = "", onLogout }: NavbarProps) {
  const router = useRouter();

  const isUserVerified = status === "VERIFIED";

  // Define arrays for the role groups
  const platformRoles = [
    "BMSP_SUPER_ADMIN",
    "BMSP_ADMIN",
    "BMSP_FINANCE_ADMIN",
    "BMSP_VENUES_ADMIN",
    "BMSP_REGIONAL_VENUES_ADMIN",
    "BMSP_BOOKINGS_ADMIN",
    "BMSP_CUSTOMER_CARE",
  ];

  const venueRoles = [
    "VENUE_OWNER",
    "SECONDARY_VENUE_NAME_MANAGER",
    "VENUE_BOOKING_MANAGER",
    "VENUE_OPERATIONS_MANAGER",
  ];

  // Determine dashboard URL based on role
  let dashboardUrl: string | null = null;
  if (role && isUserVerified && platformRoles.includes(role)) {
    dashboardUrl = "/platform-admin/dashboard";
  } else if (role && isUserVerified && venueRoles.includes(role)) {
    dashboardUrl = "/venue-name-admin/dashboard"; // Adjust if your route is different
  }
  // For "USER" or any other role, dashboardUrl remains null

  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between w-full px-4 py-3 bg-neutral-900 text-white">
      {/* Left: Brand/Logo */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          {/* Logo */}
          <div className="h-6 w-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-blue-500"
            >
              <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-wide">Book My Sportz</span>
        </Link>
      </div>

      {/* Middle: Marketplace Dropdown & "JOIN US" */}
      <div className="hidden md:flex items-center space-x-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-white/90 hover:bg-white/10 hover:text-white"
            >
              MARKETPLACE
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-black/95 text-white">
            <DropdownMenuItem className="hover:bg-white/10">
              Sports
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/10">
              Gaming
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/10">
              Electronics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {role === "USER" && (
          <Link href="/venue-name-admin/onboard/identity-verification" className="text-white/90 hover:text-white">
            JOIN US
          </Link>
        )}

        {/* Conditionally render Dashboard Link based on role */}
        {dashboardUrl && (
          <Link href={dashboardUrl} className="text-white/90 hover:text-white">
            Dashboard
          </Link>
        )}
      </div>

      {/* Right: Sign in, Signup or Logout */}
      <div className="flex items-center space-x-4">
        {!accessToken ? (
          <>
            <Link href="/signin">
              <Button
                variant="ghost"
                className="text-white/90 hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Signup
              </Button>
            </Link>
          </>
        ) : (
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-white/90 hover:bg-white/10 hover:text-white"
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
