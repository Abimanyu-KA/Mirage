import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // <--- 1. Import it

// Load a cool tech font (optional, if you haven't already)
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Mirage Protocol",
  description: "Steganography & Encryption Suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mono.variable} font-sans bg-black text-white`}>
        <Navbar /> {/* <--- 2. Add it here */}
        
        {/* Add padding-top (pt-20) so content isn't hidden behind the fixed navbar */}
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}