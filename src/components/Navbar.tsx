"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lock, Unlock, Activity, Terminal } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "HOME", path: "/", icon: <Home size={16} /> },
    { name: "ENCODE", path: "/encode", icon: <Lock size={16} /> },
    { name: "DECODE", path: "/decode", icon: <Unlock size={16} /> },
    { name: "INSPECTOR", path: "/analyze", icon: <Activity size={16} /> },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white hover:text-green-500 transition-colors">
          <Terminal size={24} className="text-green-500" />
          MIRAGE_OS
        </Link>

        {/* Links */}
        <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all ${
                  isActive 
                    ? "bg-gray-800 text-white shadow-lg" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}