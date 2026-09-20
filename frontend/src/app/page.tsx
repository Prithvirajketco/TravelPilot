"use client";
import React from 'react';
import Link from 'next/link';
import { BauhausButton } from '../components/bauhaus/BauhausButton';
import { GeometricCard } from '../components/bauhaus/GeometricCard';

import { SearchBar } from '../components/bauhaus/SearchBar';

export default function Dashboard() {
  return (
    <main className="w-full flex flex-col">
      
      {/* 1. FLIGHT & DESTINATION SEARCH BAR (Moved to top) */}
      <section className="bg-white border-b-4 border-bauhaus-fg p-6 md:p-8 flex justify-center z-[100] relative">
         <SearchBar />
      </section>

      {/* 2. HERO SECTION (Color Blocked, Split Layout) */}
      <section className="flex flex-col lg:flex-row border-b-4 border-bauhaus-fg min-h-[65vh] relative z-10">
        
        {/* Left: Typography & CTA */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-bauhaus-yellow relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#121212 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-bauhaus-fg text-white font-bold uppercase tracking-widest px-4 py-2 text-sm mb-8">
              Construct Your Journey
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
              TRAVEL<br/>BOLDLY.
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-12 max-w-lg border-l-4 border-bauhaus-fg pl-6 py-2 bg-white/50">
              Stop dreaming. Start building. AI-powered itineraries engineered for the modern explorer.
            </p>
          </div>
        </div>

        {/* Right: Abstract Composition & Imagery */}
        <div className="flex-1 bg-bauhaus-blue border-t-4 lg:border-t-0 lg:border-l-4 border-bauhaus-fg p-8 md:p-16 flex items-center justify-center relative overflow-hidden">
          
          {/* Bauhaus Abstract Composition */}
          <div className="absolute top-1/4 -right-12 w-64 h-64 bg-bauhaus-red rounded-full border-4 border-bauhaus-fg mix-blend-multiply opacity-80"></div>
          <div className="absolute bottom-1/4 -left-12 w-64 h-64 bg-bauhaus-yellow border-4 border-bauhaus-fg transform rotate-45 mix-blend-multiply opacity-80"></div>
          
          {/* Main Hero Image */}
          <div className="relative z-10 w-full max-w-md aspect-[3/4] bg-white border-4 border-bauhaus-fg shadow-[12px_12px_0px_0px_#121212] overflow-hidden group">
             <div className="absolute inset-0 bg-gray-300 grayscale group-hover:grayscale-0 transition-all duration-300 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Paris" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
             </div>
             {/* Decorative Triangle overlay */}
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-bauhaus-yellow border-t-4 border-l-4 border-bauhaus-fg z-20" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0% 100%)' }}></div>
          </div>
        </div>
      </section>

      {/* 2. DESTINATIONS (Inspiration Grid) */}
      <section id="destinations" className="bg-bauhaus-bg border-b-4 border-bauhaus-fg py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 border-b-4 border-bauhaus-fg pb-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Inspiration</h2>
            <div className="w-16 h-16 bg-bauhaus-red rounded-full border-4 border-bauhaus-fg"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { title: 'Tokyo', desc: 'Neon & Tradition', color: 'bg-bauhaus-red', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
              { title: 'Rome', desc: 'Ancient Architecture', color: 'bg-bauhaus-blue', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
              { title: 'Swiss Alps', desc: 'Geometric Peaks', color: 'bg-bauhaus-yellow', img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
            ].map((dest, i) => (
              <Link href={`/dashboard?city=${dest.title}&days=7&budget=3000`} key={i} className="block">
                <GeometricCard decoration={i % 2 === 0 ? 'circle' : 'square'} decorationColor={i === 0 ? 'red' : i === 1 ? 'blue' : 'yellow'} className="group h-full">
                  <div className="h-64 border-b-4 border-bauhaus-fg overflow-hidden bg-gray-200">
                    <img src={dest.img} alt={dest.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                  </div>
                  <div className={`p-8 ${dest.color} text-white`}>
                    <h3 className="text-4xl font-black uppercase tracking-tighter mb-2">{dest.title}</h3>
                    <p className="font-bold tracking-widest uppercase text-xs">{dest.desc}</p>
                  </div>
                </GeometricCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE PLANNER CTA (AI Interface Entry) */}
      <section id="planner" className="bg-bauhaus-red border-b-4 border-bauhaus-fg py-24 px-8 md:px-16 flex justify-center">
        <div className="w-full max-w-4xl bg-white border-4 border-bauhaus-fg shadow-[16px_16px_0px_0px_#121212] p-8 md:p-16 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-48 h-48 bg-bauhaus-yellow rounded-full translate-x-1/2 -translate-y-1/2 border-4 border-bauhaus-fg z-0"></div>

          <div className="relative z-10 flex justify-between items-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">The Engine</h2>
          </div>
          
          <div className="relative z-10 bg-bauhaus-bg border-4 border-bauhaus-fg p-8 mb-8">
             <div className="absolute top-0 left-0 bg-bauhaus-fg text-white text-xs font-bold uppercase tracking-widest px-3 py-1">Input Sequence</div>
             
             <div className="mt-6 flex flex-col gap-6">
                <div className="flex flex-col border-b-2 border-bauhaus-fg pb-4">
                  <label className="font-bold uppercase text-sm mb-2">Destination Axis</label>
                  <input type="text" placeholder="E.G. BERLIN" className="bg-transparent text-3xl font-black uppercase outline-none placeholder:text-bauhaus-muted" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col border-b-2 border-bauhaus-fg pb-4">
                    <label className="font-bold uppercase text-sm mb-2">Duration (Days)</label>
                    <input type="number" placeholder="07" className="bg-transparent text-3xl font-black uppercase outline-none placeholder:text-bauhaus-muted" />
                  </div>
                  <div className="flex flex-col border-b-2 border-bauhaus-fg pb-4">
                    <label className="font-bold uppercase text-sm mb-2">Capital (€)</label>
                    <input type="number" placeholder="2500" className="bg-transparent text-3xl font-black uppercase outline-none placeholder:text-bauhaus-muted" />
                  </div>
                </div>
             </div>
          </div>

          <div className="relative z-10 flex justify-end">
            <Link href="/dashboard?city=Custom&days=7&budget=2500">
              <BauhausButton variant="secondary" className="text-lg h-16 px-12">Execute Generation -{'>'}</BauhausButton>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. REVIEWS */}
      <section className="bg-bauhaus-blue border-b-4 border-bauhaus-fg py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-16">
             <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white bg-bauhaus-fg px-6 py-2 border-4 border-white shadow-hard-lg rotate-2">
                Field Reports
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { name: "Alex Rivera", role: "Digital Nomad", quote: "The AI engine literally saved me 40 hours of planning. Flawless execution.", color: "bg-bauhaus-yellow" },
               { name: "Sam Chen", role: "Photographer", quote: "Found spots I wouldn't have discovered on my own. The alternatives agent is brilliant.", color: "bg-white" },
               { name: "Jordan Bell", role: "Architect", quote: "Form follows function. The itinerary was perfectly balanced and aesthetically pleasing.", color: "bg-bauhaus-red" }
             ].map((review, i) => (
                <div key={i} className={`border-4 border-bauhaus-fg p-8 ${review.color} shadow-hard-md hover:-translate-y-2 transition-transform duration-300 relative group`}>
                   
                   {/* Massive Quote Mark */}
                   <div className="absolute top-4 right-4 text-6xl font-black opacity-20">"</div>
                   
                   <p className={`text-xl font-bold uppercase mb-8 leading-tight relative z-10 ${review.color === 'bg-bauhaus-red' ? 'text-white' : 'text-bauhaus-fg'}`}>
                     "{review.quote}"
                   </p>
                   
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-bauhaus-fg overflow-hidden bg-gray-300">
                         <img src={`https://ui-avatars.com/api/?name=${review.name}&background=121212&color=fff&size=128`} alt={review.name} className="grayscale group-hover:grayscale-0 transition-all duration-300" />
                      </div>
                      <div>
                         <h4 className={`font-black uppercase text-sm ${review.color === 'bg-bauhaus-red' ? 'text-white' : 'text-bauhaus-fg'}`}>{review.name}</h4>
                         <span className={`font-bold tracking-widest uppercase text-[10px] ${review.color === 'bg-bauhaus-red' ? 'text-white/80' : 'text-bauhaus-fg/70'}`}>{review.role}</span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bauhaus-fg text-white p-12 flex flex-col md:flex-row justify-between items-center gap-4">
         <span className="text-3xl font-black uppercase tracking-tighter">TravelPilot</span>
         <span className="font-bold tracking-widest uppercase text-xs">Form Follows Function © 2026</span>
      </footer>

    </main>
  );
}
