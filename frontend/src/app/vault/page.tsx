"use client";
import React from 'react';
import Link from 'next/link';
import { BauhausButton } from '../../components/bauhaus/BauhausButton';

// Mock saved trips
const SAVED_TRIPS = [
  { id: 'TRV-8820-X', city: 'Tokyo', days: 7, budget: 3000, date: 'OCT 14 - 20', color: 'bg-bauhaus-red' },
  { id: 'TRV-4411-Y', city: 'Rome', days: 5, budget: 1800, date: 'NOV 02 - 06', color: 'bg-bauhaus-blue' },
  { id: 'TRV-9932-Z', city: 'Swiss Alps', days: 4, budget: 2200, date: 'DEC 10 - 13', color: 'bg-bauhaus-yellow' }
];

export default function VaultPage() {
  return (
    <main className="w-full flex flex-col min-h-screen bg-bauhaus-bg p-8 md:p-16">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-16 border-b-4 border-bauhaus-fg pb-8">
         <div>
            <span className="bg-bauhaus-fg text-white font-bold uppercase tracking-widest px-4 py-1 text-xs mb-4 inline-block">Secure Storage</span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
               THE VAULT
            </h1>
         </div>
         <div className="hidden md:flex gap-4">
            <div className="w-12 h-12 bg-bauhaus-red border-4 border-bauhaus-fg rounded-full"></div>
            <div className="w-12 h-12 bg-bauhaus-blue border-4 border-bauhaus-fg rotate-45"></div>
         </div>
      </div>

      {/* Grid of Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl">
         
         {SAVED_TRIPS.map((trip, idx) => (
           <div key={idx} className="bg-white border-4 border-bauhaus-fg shadow-hard-lg flex flex-col sm:flex-row group hover:-translate-y-2 transition-transform duration-300">
              
              {/* Ticket Stub Left */}
              <div className={`${trip.color} p-6 border-b-4 sm:border-b-0 sm:border-r-4 border-bauhaus-fg flex flex-col justify-between items-center sm:w-32 shrink-0 relative overflow-hidden`}>
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#121212 2px, transparent 2px)', backgroundSize: '10px 10px' }}></div>
                 <div className="font-bold uppercase tracking-widest text-white text-xs rotate-0 sm:-rotate-90 whitespace-nowrap mb-4 sm:mb-0 relative z-10">
                    ADMIT ONE
                 </div>
                 <div className="w-8 h-8 bg-white rounded-full border-2 border-bauhaus-fg relative z-10"></div>
              </div>

              {/* Ticket Details Right */}
              <div className="p-8 flex-1 flex flex-col">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <span className="text-xs font-bold uppercase tracking-widest text-bauhaus-muted-fg block mb-1">Destination</span>
                       <h2 className="text-4xl font-black uppercase tracking-tighter text-bauhaus-fg leading-none">{trip.city}</h2>
                    </div>
                    <span className="bg-bauhaus-fg text-white text-xs font-bold px-2 py-1 uppercase">{trip.id}</span>
                 </div>

                 <div className="grid grid-cols-3 gap-4 mb-8 border-y-2 border-bauhaus-fg/10 py-4">
                    <div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-fg/50 block">Duration</span>
                       <span className="font-black text-lg">{trip.days} D</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-fg/50 block">Budget</span>
                       <span className="font-black text-lg">€{trip.budget}</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-bauhaus-fg/50 block">Date</span>
                       <span className="font-black text-sm">{trip.date}</span>
                    </div>
                 </div>

                 <div className="mt-auto flex justify-end gap-4">
                    <Link href={`/dashboard?city=${trip.city}&days=${trip.days}&budget=${trip.budget}`}>
                       <BauhausButton variant="outline" shape="square" className="scale-90 text-sm py-2">Load Data</BauhausButton>
                    </Link>
                 </div>
              </div>
           </div>
         ))}

         {/* Create New Card */}
         <Link href="/" className="bg-bauhaus-bg border-4 border-dashed border-bauhaus-fg/30 flex flex-col items-center justify-center p-12 hover:border-bauhaus-fg hover:bg-bauhaus-yellow transition-all duration-300 group min-h-[300px]">
            <div className="w-16 h-16 bg-white border-4 border-bauhaus-fg rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <span className="text-3xl font-black text-bauhaus-fg">+</span>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-bauhaus-fg">Generate New Trip</h3>
            <p className="text-sm font-bold tracking-widest uppercase text-bauhaus-fg/50 mt-2">Return to Engine</p>
         </Link>

      </div>
    </main>
  );
}
