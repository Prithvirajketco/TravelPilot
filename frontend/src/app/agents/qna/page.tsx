"use client";
import React, { useState } from 'react';

export default function QnAAgent() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');

  const handleAsk = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        text: 'Based on your itinerary, tomorrow morning you have a Colosseum Tour scheduled at 10:00 AM. It is a 15-minute walk from your hotel.' 
      }]);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold mb-4">Q&A Agent</h1>
        <p className="text-gray-600 mb-6">Answers natural-language questions about the trip using real trip state via tool-calling.</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto mb-4 border border-gray-100 rounded-lg p-4 bg-slate-50 space-y-4">
          {messages.length === 0 ? (
             <div className="text-center text-sm text-gray-400 mt-10">Ask a question about your itinerary...</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                  {m.text}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <input 
            type="text" 
            className="flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="e.g., What should I do tomorrow morning?" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button onClick={handleAsk} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Ask</button>
        </div>
      </div>
    </div>
  );
}
