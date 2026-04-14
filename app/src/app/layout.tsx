import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Plus_Jakarta_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AutoTrust Motors | Quality Pre-Owned Cars",
    template: "%s | AutoTrust Motors",
  },
  description:
    "Find reliable, quality pre-owned cars at great prices. Transparent pricing, thorough inspections, and hassle-free buying experience at AutoTrust Motors.",
  keywords: [
    "used cars",
    "pre-owned cars",
    "car dealership",
    "trusted cars",
    "affordable cars",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
