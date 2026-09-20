import React from 'react';
import Link from 'next/link';

export default function AgentsDashboard() {
  const agents = [
    { name: 'Constraint Parser Agent', path: '/agents/parser', description: 'Extracts constraints from user input' },
    { name: 'Alternatives Agent', path: '/agents/alternatives', description: 'Proposes verified alternatives for unavailable activities' },
    { name: 'What-If Agent', path: '/agents/what-if', description: 'Simulates the impact of hypothetical events on the itinerary' },
    { name: 'Q&A Agent', path: '/agents/qna', description: 'Answers natural language questions about the trip state' },
    { name: 'Explainer Agent', path: '/agents/explainer', description: 'Provides human-readable reasons for plan changes' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Agent Ecosystem Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Link href={agent.path} key={agent.path}>
            <div className="glass-card p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
              <p className="text-gray-500 text-sm">{agent.description}</p>
              <div className="mt-auto pt-4 flex justify-end">
                <span className="text-sm font-medium text-blue-600">Open UI →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
