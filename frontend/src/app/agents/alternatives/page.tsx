"use client";
import React, { useState } from 'react';

export default function AlternativesAgent() {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setResults([
        { id: 1, name: 'Vatican Museums', match: '98%', price: '€21', time: 'Fits exactly in the 3-hour slot' },
        { id: 2, name: 'Pantheon Tour', match: '85%', price: '€10', time: 'Saves 45 mins of transit time' },
        { id: 3, name: 'Borghese Gallery', match: '70%', price: '€15', time: 'Requires moving lunch by 30 mins' }
      ]);
    }, 1200);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Alternatives Agent</h1>
      <p className="text-gray-600 mb-6">Proposes 2-3 replacements ranked by interest match, proximity, price, and time fit when an activity becomes unavailable.</p>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Find Alternatives</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Unavailable Activity</label>
          <input type="text" className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500" defaultValue="Colosseum Tour" />
        </div>
        <button 
          onClick={handleSearch}
          disabled={searching}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {searching ? 'Solving for Alternatives...' : 'Generate Verified Alternatives'}
        </button>

        {results.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map(r => (
              <div key={r.id} className="border border-slate-200 p-4 rounded-lg bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                  {r.match} Match
                </div>
                <h3 className="font-bold text-slate-800 mt-2">{r.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{r.price}</p>
                <div className="mt-3 text-xs bg-white border border-slate-100 p-2 rounded text-slate-600">
                  {r.time}
                </div>
                <button className="mt-4 w-full bg-slate-800 text-white py-1.5 rounded text-xs font-bold hover:bg-slate-700 transition">
                  Swap Activity
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
