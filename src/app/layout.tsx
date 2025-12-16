import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Or whatever font is there
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mirage",
  description: "Secure Steganography",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ADD THIS PROP BELOW: */}
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}