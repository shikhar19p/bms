import { Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "../components/providers"
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Book My Sports",
  description: "Book My Sports - A sports club",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-[#000314] h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
