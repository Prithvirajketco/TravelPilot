"use client";
import React, { useState } from 'react';

export default function ExplainerAgent() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Explainer Agent</h1>
      <p className="text-gray-600 mb-6">Generates human-readable reasons from facts and checks that no hallucinated numbers are present.</p>
      
      <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-slate-400 font-mono">agent_trace.log</span>
        </div>
        
        <div className="p-6 font-mono text-sm text-slate-300 h-[500px] overflow-y-auto">
          <div className="text-slate-500 mb-4">{"// TravelPilot Agent Orchestrator Trace"}</div>
          <div className="mb-2">
            <span className="text-blue-400">10:00:00</span> <span className="text-purple-400">[IntentRouter]</span> User input received: "5 days in Rome"
          </div>
          <div className="mb-2">
            <span className="text-blue-400">10:00:01</span> <span className="text-emerald-400">[ConstraintParser]</span> 
            <button onClick={() => setExpanded(!expanded)} className="ml-2 text-xs bg-slate-700 px-2 py-0.5 rounded hover:bg-slate-600 transition">
              {expanded ? 'Hide Payload' : 'View Payload'}
            </button>
            {expanded && (
              <pre className="mt-2 ml-8 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-green-300">
{`{
  "city": "Rome",
  "days": 5,
  "budget": 500,
  "hard_constraints": ["no travel > 2hrs"]
}`}
              </pre>
            )}
          </div>
          <div className="mb-2">
            <span className="text-blue-400">10:00:02</span> <span className="text-yellow-400">[CandidateGenerator]</span> Fetched 142 POIs for Rome, filtered to 34 by budget.
          </div>
          <div className="mb-2">
            <span className="text-blue-400">10:00:04</span> <span className="text-red-400">[Solver]</span> Running Or-Tools CP-SAT solver...
          </div>
          <div className="mb-2 pl-8 border-l border-slate-700 ml-4 py-2">
            <div className="text-slate-400">Iteration 1: Cost=450, Transit=120m</div>
            <div className="text-slate-400">Iteration 2: Cost=420, Transit=95m (Optimal)</div>
          </div>
          <div className="mb-2">
            <span className="text-blue-400">10:00:05</span> <span className="text-emerald-400">[Validator]</span> 0 hard-constraint violations found.
          </div>
          <div className="mb-2">
            <span className="text-blue-400">10:00:06</span> <span className="text-cyan-400">[Explainer]</span> Verified: All numbers in output match trip state memory.
          </div>
        </div>
      </div>
    </div>
  );
}
