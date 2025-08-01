'use client';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Home, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/components/button";

// Define animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between children animations
      delayChildren: 0.2,    // Initial delay for the first child
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const, // Explicitly cast for TypeScript
      stiffness: 100,
      damping: 10,
    },
  },
};

// Variants for the combined 404 + icon
const errorHeaderVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
      delay: 0.4, // Delay after logo appears
    },
  },
};

const iconPulseVariants = {
  pulse: {
    scale: [1, 1.1, 1], // Slightly less aggressive pulse
    rotate: [0, -3, 3, 0], // Subtle rotation
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};


export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] dark:bg-[url('/assets/dark-grid.svg')] bg-repeat opacity-5 dark:opacity-10 -z-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

      <motion.div
        className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 text-center" // Adjust padding for smaller screens
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo with animation */}
        <motion.div
          className="mb-6 sm:mb-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg" // More precise max-width control
          variants={itemVariants}
        >
          <Image
            src="/images/logo/logo-big-dark.png" // Using a dark logo for better visibility on potentially darker gradients
            alt="BookMySportz Logo"
            width={700}
            height={150} // Adjust height to prevent excessive vertical space if the image aspect ratio is wide
            className="mx-auto w-full h-auto"
            priority
          />
        </motion.div>

        {/* Combined 404 text and Alert Icon */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6" // Flex to align horizontally on small-medium screens
          variants={errorHeaderVariants}
        >
          <motion.div
            variants={iconPulseVariants}
            animate="pulse"
            className="flex-shrink-0 mb-2 sm:mb-0 sm:mr-4" // Margin right on small screens+ to separate icon from text
          >
            <AlertCircle className="h-14 w-14 text-red-600 dark:text-red-400 sm:h-20 sm:w-20 lg:h-24 lg:w-24" /> {/* Larger icon */}
          </motion.div>

          <motion.h2 className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 sm:text-8xl lg:text-9xl"> {/* Larger text */}
            404
          </motion.h2>
        </motion.div>

        {/* Page Not Found Subtitle */}
        <motion.h3
          className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200 sm:text-3xl lg:text-4xl" // Adjusted font sizes
          variants={itemVariants}
        >
          Page Not Found
        </motion.h3>

        {/* Description text */}
        <motion.p
          className="text-muted-foreground text-base max-w-md sm:max-w-md mb-8 leading-relaxed dark:text-gray-400 sm:text-lg" // Adjusted text size and max-width
          variants={itemVariants}
        >
          Sorry, we couldn't find the page you're looking for. The page might have
          been removed, renamed, or is temporarily unavailable.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm px-4 sm:px-0" // More controlled button container width
          variants={itemVariants}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 group hover:border-blue-500 transition-all duration-300 dark:border-gray-700 dark:hover:border-blue-500 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Link href="/" className="flex items-center justify-center py-2"> {/* Added py-2 for consistent button height */}
              <motion.span className="flex items-center">
                <Home className="mr-2 h-5 w-5 group-hover:text-blue-500 transition-colors" />
                <span>Return Home</span>
              </motion.span>
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg group transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/venue-admin/dashboard" className="flex items-center justify-center py-2"> {/* Added py-2 */}
              <motion.span className="flex items-center">
                <span>Go to Dashboard</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}