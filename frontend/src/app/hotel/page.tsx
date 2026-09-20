import React from 'react';

export default function HotelMobileApp() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      {/* Mobile Device Mockup Container */}
      <div className="w-full max-w-[400px] h-[850px] bg-white rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-gray-800 flex flex-col relative">
        
        {/* Dynamic Island Mockup */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50"></div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
          
          {/* Header Image Area */}
          <div className="relative h-96 bg-[url('https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2787&auto=format&fit=crop')] bg-cover bg-center">
             <div className="absolute inset-0 bg-black/20"></div>
             
             {/* Nav */}
             <div className="absolute top-12 left-6 right-6 flex justify-between items-center text-white">
                <div className="text-xl font-serif">Serenity*</div>
                <div className="flex space-x-4 text-xs font-medium">
                   <span>Sign up</span>
                   <span>Log in</span>
                   <span className="text-lg leading-none">+</span>
                </div>
             </div>

             <div className="absolute bottom-12 left-6 right-6 text-white">
                <h1 className="text-3xl font-serif mb-2 leading-tight">Not just a hotel, but a<br/>place that feels like<br/>home</h1>
             </div>
             
             {/* Search Bar overlaying image */}
             <div className="absolute -bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-4 py-3 flex items-center justify-between text-white shadow-lg">
                <span className="text-xs">Search Destination</span>
                <span>🔍</span>
             </div>
          </div>

          {/* About Section */}
          <div className="px-6 pt-16 pb-8 text-center">
             <div className="inline-block border border-gray-200 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest text-gray-500 mb-4">About Us</div>
             <h2 className="text-2xl font-serif mb-4">Welcome to Serenity</h2>
             <p className="text-xs text-gray-500 leading-relaxed">
               From luxurious suites to personalized experiences, Serenity Hotel is designed to make every guest feel at home. Discover the perfect blend of nature, elegance, and warmth.
             </p>
          </div>

          {/* Grid Gallery */}
          <div className="px-6 grid grid-cols-2 gap-3 mb-12">
             <div className="h-32 bg-gray-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop" className="w-full h-full object-cover" /></div>
             <div className="h-32 bg-gray-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&auto=format&fit=crop" className="w-full h-full object-cover" /></div>
             <div className="h-32 bg-gray-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop" className="w-full h-full object-cover" /></div>
             <div className="h-32 bg-gray-200 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop" className="w-full h-full object-cover" /></div>
          </div>

          {/* Special Offer */}
          <div className="px-6 mb-12">
             <div className="inline-block border border-gray-200 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest text-gray-500 mb-4">Special Offer</div>
             <h2 className="text-2xl font-serif mb-4">Limited-Time Offers You<br/>Can't Miss!</h2>
             <p className="text-xs text-gray-500 leading-relaxed mb-6">
               Enjoy unbeatable rates, complimentary perks, and extra nights on us. Your perfect getaway just got even better!
             </p>
             <button className="bg-black text-white rounded-full px-6 py-3 text-xs font-medium mb-6">See All Special Offer</button>

             {/* Offer Card */}
             <div className="bg-gray-100 rounded-3xl overflow-hidden">
                <div className="h-48 relative">
                   <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop" className="w-full h-full object-cover" />
                   <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-[10px] px-3 py-1 rounded-full">30% Discount</div>
                </div>
                <div className="p-5">
                   <h3 className="font-serif text-lg mb-1">Elysian Haven Resort</h3>
                   <div className="flex items-center text-[10px] text-gray-500 mb-4">
                     <span className="mr-1">📍</span> Maldives
                   </div>
                </div>
             </div>
          </div>

          {/* FAQ */}
          <div className="px-6 mb-12">
             <div className="inline-block border border-gray-200 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest text-gray-500 mb-4">FAQ</div>
             <h2 className="text-2xl font-serif mb-4">Got Questions?<br/>We've Got Answers!</h2>
             <p className="text-xs text-gray-500 leading-relaxed mb-6">
               Find everything you need to know about your stay at Serenity. From check-in details to exclusive experiences, we've covered it all.
             </p>
             
             <div className="rounded-3xl overflow-hidden mb-6">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop" className="w-full h-64 object-cover" />
             </div>
             
             <div className="border-t border-gray-100 py-4">
                <h4 className="font-medium text-sm mb-2">What time is check-in and check-out?</h4>
                <p className="text-xs text-gray-500">Check-in time is at 3:00 PM and check-out is at 11:00 AM.</p>
             </div>
          </div>

        </div>

        {/* Floating Side Action Buttons (like Image 3) */}
        <div className="absolute top-32 right-4 flex flex-col space-y-2">
           <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex justify-center items-center shadow-lg">📤</button>
           <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex justify-center items-center shadow-lg font-serif">i</button>
        </div>

      </div>
    </div>
  );
}
