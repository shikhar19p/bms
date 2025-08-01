"use client"

import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5 text-white" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="bg-black/95 text-white">
        {/* Animated container for the drawer content */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="flex h-full flex-col gap-6 pt-6"
        >
          <Link
            href="/"
            className="text-lg font-semibold transition-transform duration-200 hover:text-blue-400 hover:scale-105"
          >
            Marketplace
          </Link>
          <Link
            href="/"
            className="text-lg font-semibold transition-transform duration-200 hover:text-blue-400 hover:scale-105"
          >
            Location
          </Link>
          <Link
            href="/signin"
            className="text-lg font-semibold transition-transform duration-200 hover:text-blue-400 hover:scale-105"
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="text-lg font-semibold transition-transform duration-200 hover:text-blue-400 hover:scale-105"
          >
            Register
          </Link>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
