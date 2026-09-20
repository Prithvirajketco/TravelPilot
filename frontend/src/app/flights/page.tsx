import React from 'react';

export default function FlightsMobileApp() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      {/* Mobile Device Mockup Container */}
      <div className="w-full max-w-[400px] h-[850px] bg-[#f0f2f5] rounded-[3rem] overflow-hidden relative shadow-2xl border-[8px] border-gray-800">
        
        {/* Mock Topographic Background (using radial gradients to simulate the vibe) */}
        <div className="absolute inset-0 opacity-40 mix-blend-multiply" 
             style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 20%, #d1d5db 21%, transparent 22%), radial-gradient(circle at 30% 70%, transparent 30%, #d1d5db 31%, transparent 32%)', backgroundSize: '100px 100px' }}>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pt-6">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current Location</div>
              <div className="font-semibold text-lg flex items-center">Dhaka Bangladesh <span className="ml-1 text-xs">∨</span></div>
            </div>
            <button className="w-10 h-10 bg-white rounded-full flex justify-center items-center shadow-sm">🔔</button>
          </div>

          {/* Search */}
          <div className="bg-white rounded-full flex items-center px-4 py-3 mb-6 shadow-sm">
            <input type="text" placeholder="Search destination...." className="flex-1 outline-none text-sm bg-transparent" />
            <span className="text-gray-400">🔍</span>
          </div>

          {/* Toggles */}
          <div className="flex space-x-3 mb-8">
            <button className="w-10 h-10 bg-[#ccff00] rounded-full flex justify-center items-center shadow-sm">≡</button>
            <button className="bg-white rounded-full px-5 py-2 text-sm font-medium shadow-sm flex-1">Tour Package</button>
            <button className="bg-white rounded-full px-5 py-2 text-sm font-medium shadow-sm flex-1 text-gray-500">Flight Package</button>
          </div>

          {/* Flight Selection View (Simulating the right screen from Image 2) */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-light leading-tight">Select<br/><span className="font-bold text-3xl">Flight</span></h2>
            <div className="bg-white rounded-full px-3 py-1.5 text-xs font-medium shadow-sm flex items-center space-x-2">
              <span>Short by Price</span>
              <span>≡</span>
            </div>
          </div>

          {/* Flight Card 1 */}
          <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex justify-center items-center text-white text-[10px] font-bold">EK</div>
              <span className="font-semibold text-sm">Emirates Airline Ltd</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xl font-bold">CDG</div>
                <div className="text-[10px] text-gray-400">Paris</div>
              </div>
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="w-full border-t border-dashed border-gray-300 relative">
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg">✈️</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">DXB</div>
                <div className="text-[10px] text-gray-400">Dubai</div>
              </div>
            </div>
            <div className="flex justify-between text-xs mb-4">
              <div>
                <div className="font-bold text-sm">7:25 AM</div>
                <div className="text-[10px] text-gray-400">3 June, 2025</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">15:36 PM</div>
                <div className="text-[10px] text-gray-400">Flight EK 76</div>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-500">Economy Class</span>
              <span className="font-bold text-lg">$450</span>
            </div>
          </div>

          {/* Flight Card 2 */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-sm mb-20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex justify-center items-center text-white text-[10px] font-bold">SY</div>
              <span className="font-semibold text-sm">Skyway Airlines Inc</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xl font-bold">LAX</div>
                <div className="text-[10px] text-gray-400">Los Angeles</div>
              </div>
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="w-full border-t border-dashed border-gray-300 relative">
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg">✈️</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">JFK</div>
                <div className="text-[10px] text-gray-400">New York</div>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-8">
              <span className="text-xs text-gray-500">Business Class</span>
              <span className="font-bold text-lg">€850</span>
            </div>
          </div>

        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 flex space-x-8 shadow-lg z-20">
          <button className="w-10 h-10 bg-[#ccff00] rounded-full flex justify-center items-center text-xl">🏠</button>
          <button className="w-10 h-10 rounded-full flex justify-center items-center text-xl opacity-50">🧭</button>
          <button className="w-10 h-10 rounded-full flex justify-center items-center text-xl opacity-50">⚙️</button>
          <button className="w-10 h-10 rounded-full flex justify-center items-center text-xl opacity-50">👤</button>
        </div>

      </div>
    </div>
  );
}
