"use client";
import React, { useState } from 'react';
import { useTripStore } from '../../../store/tripStore';
import { planTrip } from '../../../lib/api';

export default function ConstraintParserAgent() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTripConstraints, setItinerary } = useTripStore();

  const handleParse = async () => {
    setLoading(true);
    try {
      // Mock parsing for the demo
      const city = "Rome";
      const budget = 500;
      setTripConstraints(city, budget, 5);
      
      const result = await planTrip(city, { budget, days: 5 });
      if (result.itinerary) {
        setItinerary(result.itinerary);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Constraint Parser Agent</h1>
      <p className="text-gray-600 mb-6">Extracts structured constraints from free-text user inputs.</p>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Plan from Natural Language</h2>
        <textarea 
          className="w-full border border-gray-200 rounded-lg p-4 text-sm mb-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 5 days in Rome, €500 budget, love historical landmarks and pizza..."
        ></textarea>
        <button 
          onClick={handleParse}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Agent is Planning...' : 'Extract & Generate Trip'}
        </button>
      </div>
    </div>
  );
}
