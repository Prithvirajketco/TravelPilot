"use client";
import React, { useState } from 'react';

export default function WhatIfAgent() {
  const [scenario, setScenario] = useState('Flight Delayed');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSimulation = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setRunning(false);
      setResult({
        impact: 'Medium',
        costDelta: '+€45',
        dropped: ['Afternoon Museum Visit'],
        moved: ['Lunch at Pizzeria La Montecarlo (moved to 3 PM)']
      });
    }, 1500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">What-If Agent</h1>
      <p className="text-gray-600 mb-6">Runs sandboxed counterfactuals to show impact on cost, time, and activities without modifying the real plan.</p>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Simulate Event</h2>
        <select 
          className="w-full border border-slate-300 rounded-lg p-3 mb-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
        >
          <option>Flight Delayed by 3 hours</option>
          <option>Colosseum Cancelled due to weather</option>
          <option>Budget reduced by 20%</option>
        </select>
        <button 
          onClick={runSimulation}
          disabled={running}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50"
        >
          {running ? 'Running Simulation...' : 'Run Simulation'}
        </button>

        {result && (
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-bold text-slate-800 mb-2">Simulation Impact: {result.impact}</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p><span className="font-semibold text-slate-800">Cost Delta:</span> {result.costDelta}</p>
              <p><span className="font-semibold text-red-600">Dropped Activities:</span> {result.dropped.join(', ')}</p>
              <p><span className="font-semibold text-amber-600">Moved Activities:</span> {result.moved.join(', ')}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="bg-emerald-600 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-emerald-700">Apply to Trip</button>
              <button className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-slate-300">Discard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
