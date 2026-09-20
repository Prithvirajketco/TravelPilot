"use client";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React, { useState } from "react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <title>TravelPilot - Bold Journeys</title>
      <body className="min-h-screen bg-bauhaus-bg text-bauhaus-fg font-sans flex flex-col relative">
        
        {/* Navigation */}
        <nav className="relative z-50 bg-white border-b-4 border-bauhaus-fg flex justify-between items-stretch">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center border-r-4 border-bauhaus-fg px-6 py-4 bg-bauhaus-yellow hover:bg-bauhaus-red transition-colors group cursor-pointer">
            <div className="flex gap-1 mr-3">
              <div className="w-4 h-4 bg-bauhaus-red rounded-full border-2 border-bauhaus-fg group-hover:bg-white transition-colors"></div>
              <div className="w-4 h-4 bg-bauhaus-blue rounded-none border-2 border-bauhaus-fg group-hover:bg-white transition-colors"></div>
              <div className="w-4 h-4 bg-white rounded-none border-2 border-bauhaus-fg group-hover:bg-bauhaus-yellow transition-colors" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase group-hover:text-white transition-colors">TravelPilot</span>
          </Link>
          
          {/* Links */}
          <div className="hidden md:flex flex-1">
            <Link href="/" className="flex items-center justify-center px-8 border-r-4 border-bauhaus-fg font-bold uppercase tracking-widest text-sm hover:bg-bauhaus-blue hover:text-white transition-colors">Explore</Link>
            <Link href="/dashboard?city=Custom&days=7&budget=2500" className="flex items-center justify-center px-8 border-r-4 border-bauhaus-fg font-bold uppercase tracking-widest text-sm hover:bg-bauhaus-red hover:text-white transition-colors">Planner</Link>
            <Link href="/vault" className="flex items-center justify-center px-8 border-r-4 border-bauhaus-fg font-bold uppercase tracking-widest text-sm hover:bg-bauhaus-yellow hover:text-bauhaus-fg transition-colors">The Vault</Link>
          </div>

          <button 
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className={`flex items-center px-8 font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer outline-none border-none
              ${isLoggedIn ? 'bg-bauhaus-yellow text-bauhaus-fg hover:bg-bauhaus-red hover:text-white' : 'bg-bauhaus-fg text-white hover:bg-bauhaus-blue'}`}
          >
            {isLoggedIn ? 'User Profile' : 'Login'}
          </button>
        </nav>
        
        {/* Main Content Area */}
        <div className="relative z-10 flex-1 w-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
