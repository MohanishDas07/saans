import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "SAANS - Clean Air Assistant & Breath Budget Engine",
  description: "Navigate severe winter smog with personalized low-exposure routines, indoor hacks, and sustainable alternatives.",
  keywords: ["air quality", "AQI", "PM2.5", "Breath Budget", "Delhi smog", "Ghaziabad", "indoor air", "HEPA purifier"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-paper text-ink selection:bg-ink selection:text-paper">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
