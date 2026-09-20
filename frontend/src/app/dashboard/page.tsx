"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { BauhausButton } from '../../components/bauhaus/BauhausButton';

interface Activity {
  id: string;
  time: string;
  cost: number;
  name: string;
  desc: string;
  type: 'activity' | 'food' | 'transit';
  duration?: string;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('whatif');
  
  // URL Params
  const city = searchParams?.get('city') || 'Tokyo';
  const days = parseInt(searchParams?.get('days') || '7', 10);
  const initialBudget = parseInt(searchParams?.get('budget') || '3000', 10);

  // States
  const [timelineData, setTimelineData] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  // What-If State
  const [pace, setPace] = useState<'Relaxed' | 'Balanced' | 'Packed'>('Balanced');
  const [simBudget, setSimBudget] = useState(initialBudget);
  
  // Q&A State
  const [qnaInput, setQnaInput] = useState('');
  const [qnaMessages, setQnaMessages] = useState([
    { role: 'user', text: 'Why is day 4 so expensive?' },
    { role: 'ai', text: 'Day 4 includes the Private Museum Tour which accounts for 60% of that day\'s budget. Would you like me to find cheaper alternatives?' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Parser State
  const [parserInput, setParserInput] = useState('');
  const [parserLogs, setParserLogs] = useState<string[]>([
    ">_ ENGINE READY",
    ">_ CURRENT CONSTRAINTS:"
  ]);

  // Boarding Pass
  const [showPass, setShowPass] = useState(false);
  
  // Real-world Data States
  const [realLandmarks, setRealLandmarks] = useState<string[]>([]);
  const [isLoadingLandmarks, setIsLoadingLandmarks] = useState(true);
  const [countryName, setCountryName] = useState<string>('');

  // Fetch real-world coordinates and Wikipedia landmarks for ANY city on Earth
  useEffect(() => {
    async function fetchGlobalData() {
      setIsLoadingLandmarks(true);
      try {
        // 1. Get exact coordinates & country for the selected city from Open-Meteo
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude, country } = geoData.results[0];
          setCountryName(country || 'Local');
          
          // 2. Fetch actual real-world landmarks within 10km using Wikipedia's GeoSearch API
          const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${latitude}|${longitude}&gsradius=10000&gslimit=30&format=json&origin=*`);
          const wikiData = await wikiRes.json();
          
          if (wikiData.query && wikiData.query.geosearch) {
            const titles = wikiData.query.geosearch.map((item: any) => item.title);
            // Filter out boring generic titles if they are too short
            const validTitles = titles.filter((t: string) => t.length > 4);
            setRealLandmarks(validTitles.length > 0 ? validTitles : [city]);
          } else {
             setRealLandmarks([]);
          }
        }
      } catch (e) {
        console.error("API Error", e);
        setRealLandmarks([]);
      }
      setIsLoadingLandmarks(false);
    }
    
    fetchGlobalData();
  }, [city]);

  // Dynamic City Data Generation from Wikipedia
  const getCityData = (cityName: string, dayNum: number) => {
    const defaultCuisines = ['Traditional Market Tasting', 'Local Bistro', 'Rooftop Dining', 'Street Food Tour', 'Chef\'s Table', 'Historic Tavern', 'Riverside Cafe'];
    const lunch = defaultCuisines[dayNum % defaultCuisines.length] + (countryName ? ` (${countryName})` : '');
    
    if (realLandmarks.length >= 2) {
      // Procedurally select different real-world landmarks for morning and evening
      const mLandmark = realLandmarks[(dayNum * 2) % realLandmarks.length];
      const eLandmark = realLandmarks[(dayNum * 2 + 1) % realLandmarks.length];
      
      return {
        morning: `Tour of ${mLandmark}`,
        lunch: lunch,
        evening: `Sunset near ${eLandmark}`
      };
    }

    // Extreme Fallback
    return { 
      morning: `Explore Historic ${cityName}`, 
      lunch: lunch, 
      evening: `${cityName} Night Walk` 
    };
  };

  // Generate Timeline based on Pace
  const generateTimeline = (currentPace: string) => {
    const newTimeline: Activity[] = [];
    for (let i = 0; i < days; i++) {
      const cityData = getCityData(city, i);
      
      newTimeline.push(
        { id: `day${i}-a1`, time: '09:00 AM', cost: 45, name: cityData.morning, desc: `Curated cultural and historical experience.`, type: 'activity' },
        { id: `day${i}-t1`, time: '', cost: 0, name: 'Transit', desc: 'Transit', type: 'transit', duration: '30 Min' }
      );
      
      if (currentPace !== 'Relaxed') {
        newTimeline.push(
          { id: `day${i}-a2`, time: '01:00 PM', cost: 30, name: cityData.lunch, desc: 'Highly rated local culinary recommendation.', type: 'food' },
          { id: `day${i}-t2`, time: '', cost: 0, name: 'Transit', desc: 'Transit', type: 'transit', duration: '15 Min' }
        );
      }

      if (currentPace === 'Packed') {
         newTimeline.push(
           { id: `day${i}-a3`, time: '06:00 PM', cost: 85, name: cityData.evening, desc: 'Immersive evening activity and dining.', type: 'activity' }
         );
      }
    }
    setTimelineData(newTimeline);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoadingLandmarks) {
      generateTimeline(pace);
    }
  }, [days, city, pace, isLoadingLandmarks]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [qnaMessages]);

  if (!mounted) return null;

  // Handlers
  const handleSwapClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setActiveTab('alternatives');
  };

  const handleApplySwap = (newActivityInfo: Partial<Activity>) => {
    if (!selectedActivityId) return;
    setTimelineData(prev => prev.map(item => item.id === selectedActivityId ? { ...item, ...newActivityInfo } : item));
  };

  const handleRecalculate = () => {
    // Mock AI recalculation delay
    setTimeout(() => {
       generateTimeline(pace);
    }, 500);
  };

  const handleSendQna = () => {
    if (!qnaInput.trim()) return;
    setQnaMessages(prev => [...prev, { role: 'user', text: qnaInput }]);
    const currentInput = qnaInput;
    setQnaInput('');
    
    // Mock AI Reply
    setTimeout(() => {
      setQnaMessages(prev => [...prev, { role: 'ai', text: `I have analyzed your request regarding "${currentInput}". I can adjust the itinerary to accommodate this. Should I proceed?` }]);
    }, 800);
  };

  const handleParserSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && parserInput.trim()) {
      setParserLogs(prev => [...prev, `>_ ${parserInput}`]);
      setParserInput('');
      
      setTimeout(() => setParserLogs(prev => [...prev, ">_ PROCESSING COMMAND..."]), 400);
      setTimeout(() => {
        setParserLogs(prev => [...prev, ">_ RE-SOLVING ITINERARY...", ">_ DONE. VIEW EXPLAINER FOR TRACE."]);
        setActiveTab('explainer');
      }, 1200);
    }
  };

  const selectedActivity = timelineData.find(a => a.id === selectedActivityId);

  return (
    <>
      <main className="w-full flex flex-col min-h-screen bg-bauhaus-bg">
        
        {/* Dashboard Header */}
        <header className="bg-bauhaus-yellow border-b-4 border-bauhaus-fg p-8 flex justify-between items-end relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-bauhaus-red rounded-full translate-x-1/2 -translate-y-1/2 border-4 border-bauhaus-fg z-0"></div>
          <div className="relative z-10">
             <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">{city}</h1>
             <p className="font-bold tracking-widest uppercase text-sm">{days} Days / {days - 1} Nights / €{simBudget}</p>
          </div>
          <div className="relative z-10 flex gap-2">
             <div className="w-6 h-6 bg-bauhaus-bg border-4 border-bauhaus-fg rotate-45"></div>
             <div className="w-6 h-6 bg-bauhaus-blue border-4 border-bauhaus-fg"></div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row relative">
          
          {/* Left Column: 7-Day Itinerary */}
          <section className="flex-[2] border-r-4 border-bauhaus-fg bg-white p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
             <div className="flex justify-between items-center mb-12 border-b-4 border-bauhaus-fg pb-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Constructed Plan</h2>
                <span className="bg-bauhaus-fg text-white text-xs font-bold tracking-widest px-2 py-1 uppercase">Valid</span>
             </div>

             <div className="flex flex-col gap-12 mb-16">
               {[...Array(days)].map((_, dayIndex) => {
                 const dayActivities = timelineData.filter(a => a.id.startsWith(`day${dayIndex}-`));
                 if (dayActivities.length === 0) return null;

                 return (
                   <div key={dayIndex} className="relative pl-12 border-l-4 border-bauhaus-fg">
                     <div className="absolute -left-[14px] top-0 w-6 h-6 bg-bauhaus-red border-4 border-bauhaus-fg rounded-full"></div>
                     
                     <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">Day 0{dayIndex + 1}</h3>
                     
                     <div className="flex flex-col gap-6">
                        {dayActivities.map(activity => {
                          if (activity.type === 'transit') {
                            return (
                              <div key={activity.id} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest pl-4">
                                 <div className="w-4 h-4 bg-bauhaus-blue border-2 border-bauhaus-fg"></div>
                                 Transit / {activity.duration}
                              </div>
                            );
                          }

                          return (
                            <div key={activity.id} className={`group border-4 border-bauhaus-fg p-6 shadow-hard-md hover:-translate-y-1 transition-transform relative ${selectedActivityId === activity.id ? 'bg-bauhaus-yellow' : activity.type === 'food' ? 'bg-bauhaus-bg' : 'bg-white'}`}>
                               <div className="flex justify-between items-start mb-4">
                                  <span className="font-bold tracking-widest uppercase text-sm">{activity.time}</span>
                                  <span className="bg-bauhaus-fg text-white text-xs font-bold px-2 py-1">€{activity.cost}</span>
                               </div>
                               <h4 className="text-xl font-bold uppercase mb-2">{activity.name}</h4>
                               <p className="text-sm font-medium mb-4">{activity.desc}</p>
                               
                               <div className="mt-4 border-t-2 border-bauhaus-fg/10 pt-4 flex justify-end">
                                  <BauhausButton 
                                    type="button"
                                    variant={selectedActivityId === activity.id ? 'outline' : 'yellow'} 
                                    shape="square" 
                                    className="scale-90 shadow-hard-sm" 
                                    onClick={() => handleSwapClick(activity.id)}
                                  >
                                    {selectedActivityId === activity.id ? 'SELECTED' : 'SWAP ACTIVITY'}
                                  </BauhausButton>
                               </div>
                            </div>
                          );
                        })}
                     </div>
                   </div>
                 );
               })}
             </div>
             
             {/* Finalize Button */}
             <div className="border-t-4 border-bauhaus-fg pt-12 flex justify-center pb-12">
                <BauhausButton variant="primary" className="w-full text-xl h-20 shadow-hard-lg" onClick={() => setShowPass(true)}>
                  FINALIZE JOURNEY →
                </BauhausButton>
             </div>
          </section>

          {/* Right Column: AI Agent Control Panel */}
          <aside className="flex-[1.5] bg-bauhaus-fg flex flex-col h-full sticky top-0" style={{ maxHeight: 'calc(100vh - 120px)' }}>
             {/* Agent Tabs */}
             <div className="flex flex-wrap border-b-4 border-bauhaus-fg shrink-0">
                {[
                  { id: 'parser', name: 'Parser', color: 'hover:bg-bauhaus-red' },
                  { id: 'alternatives', name: 'Alternatives', color: 'hover:bg-bauhaus-blue' },
                  { id: 'whatif', name: 'What-If', color: 'hover:bg-bauhaus-yellow' },
                  { id: 'qna', name: 'Q&A', color: 'hover:bg-bauhaus-red' },
                  { id: 'explainer', name: 'Explainer', color: 'hover:bg-bauhaus-blue' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[80px] p-4 text-xs font-bold uppercase tracking-widest border-r-4 border-bauhaus-fg last:border-r-0 transition-colors
                      ${activeTab === tab.id ? 'bg-white text-bauhaus-fg' : `text-white ${tab.color}`}`}
                  >
                    {tab.name}
                  </button>
                ))}
             </div>

             {/* Active Agent Interface */}
             <div className="flex-1 p-8 text-white flex flex-col bg-bauhaus-fg overflow-y-auto">
                
                {/* 1. PARSER AGENT */}
                {activeTab === 'parser' && (
                  <div className="flex flex-col h-full">
                     <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-bauhaus-red">01 / Constraint Parser</h2>
                     <p className="text-sm font-bold tracking-widest uppercase mb-8">Natural Language Engine</p>
                     
                     <div className="bg-black border-4 border-white p-6 font-mono flex-1 flex flex-col">
                        {parserLogs.map((log, i) => (
                           <div key={i} className={`text-sm mb-2 ${log.includes('DONE') ? 'text-bauhaus-red font-bold' : log.includes('CURRENT') ? 'text-white' : 'text-bauhaus-yellow'}`}>{log}</div>
                        ))}
                        
                        <div className="mt-auto pt-8">
                          <label className="text-white text-sm mb-2 block">{">_ INPUT NEW INSTRUCTION:"}</label>
                          <div className="flex items-center gap-2">
                             <span className="text-bauhaus-red font-bold animate-pulse">{">"}</span>
                             <input 
                               type="text" 
                               value={parserInput}
                               onChange={(e) => setParserInput(e.target.value)}
                               onKeyDown={handleParserSubmit}
                               className="bg-transparent text-white outline-none flex-1 border-b-2 border-bauhaus-red focus:border-white transition-colors" 
                               placeholder="Press Enter to execute..." 
                             />
                          </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* 2. ALTERNATIVES AGENT */}
                {activeTab === 'alternatives' && (
                  <div className="flex flex-col h-full">
                     <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-bauhaus-blue">02 / Alternatives</h2>
                     <p className="text-sm font-bold tracking-widest uppercase mb-8">The Swapper</p>
                     
                     {!selectedActivity ? (
                       <div className="flex-1 flex items-center justify-center border-4 border-dashed border-bauhaus-muted/30 p-8 text-center">
                          <p className="font-bold uppercase tracking-widest text-bauhaus-muted">Select an activity from the itinerary to view alternatives.</p>
                       </div>
                     ) : (
                       <div className="flex flex-col gap-4">
                          <div className="bg-white text-bauhaus-fg p-4 border-4 border-white shadow-hard-md">
                             <div className="text-xs font-bold uppercase tracking-widest mb-2 bg-bauhaus-fg text-white inline-block px-2">Current</div>
                             <div className="font-black uppercase text-xl">{selectedActivity.name}</div>
                             <div className="text-sm font-bold mt-2">€{selectedActivity.cost}</div>
                          </div>
                          
                          <div className="flex justify-center my-2">
                             <div className="w-8 h-8 bg-bauhaus-yellow flex items-center justify-center rotate-90 border-2 border-bauhaus-fg">
                               <span className="text-bauhaus-fg font-black leading-none">↑↓</span>
                             </div>
                          </div>

                          <button 
                            type="button"
                            className="w-full text-left block bg-bauhaus-blue text-white p-4 border-4 border-bauhaus-blue cursor-pointer hover:border-white hover:bg-bauhaus-red transition-all shadow-hard-md group"
                            onClick={() => handleApplySwap({ name: 'Street Food Tour', cost: 15, desc: 'Guided tour of local street food vendors.' })}
                          >
                             <div className="flex justify-between items-start mb-2">
                               <div className="text-xs font-bold uppercase tracking-widest bg-white text-bauhaus-fg inline-block px-2">Option A</div>
                               <span className="opacity-0 group-hover:opacity-100 font-bold uppercase text-xs tracking-widest">Select →</span>
                             </div>
                             <div className="font-black uppercase text-xl">Street Food Tour</div>
                             <div className="text-sm font-bold mt-2">€15</div>
                          </button>
                          
                          <button 
                            type="button"
                            className="w-full text-left block bg-bauhaus-blue text-white p-4 border-4 border-bauhaus-blue cursor-pointer hover:border-white hover:bg-bauhaus-red transition-all shadow-hard-md group"
                            onClick={() => handleApplySwap({ name: 'Riverside Cafe', cost: 25, desc: 'Quiet cafe by the river with local pastries.' })}
                          >
                             <div className="flex justify-between items-start mb-2">
                               <div className="text-xs font-bold uppercase tracking-widest bg-white text-bauhaus-fg inline-block px-2">Option B</div>
                               <span className="opacity-0 group-hover:opacity-100 font-bold uppercase text-xs tracking-widest">Select →</span>
                             </div>
                             <div className="font-black uppercase text-xl">Riverside Cafe</div>
                             <div className="text-sm font-bold mt-2">€25</div>
                          </button>
                       </div>
                     )}
                  </div>
                )}

                {/* 3. WHAT-IF AGENT */}
                {activeTab === 'whatif' && (
                  <div className="flex flex-col h-full">
                     <div>
                       <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-bauhaus-yellow">03 / Simulator</h2>
                       <p className="text-sm font-bold tracking-widest uppercase mb-4">What-If Scenarios</p>
                     </div>
                     
                     <div className="flex flex-col gap-4 flex-1 justify-center">
                        <div className="bg-white p-4 border-4 border-white text-bauhaus-fg shadow-hard-sm">
                           <label className="block text-sm font-bold uppercase tracking-widest mb-3">Pace Control</label>
                           <div className="flex gap-2 h-10">
                              {['Relaxed', 'Balanced', 'Packed'].map(p => (
                                <button 
                                  key={p}
                                  onClick={() => setPace(p as any)}
                                  className={`flex-1 font-bold uppercase text-xs transition-colors border-4 ${pace === p ? 'bg-bauhaus-red text-white border-bauhaus-fg shadow-hard-sm' : 'bg-bauhaus-bg text-bauhaus-fg border-transparent hover:border-bauhaus-fg'}`}
                                >
                                  {p}
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="bg-white p-4 border-4 border-white text-bauhaus-fg shadow-hard-sm">
                           <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-bold uppercase tracking-widest">Adjust Capital</label>
                              <span className="font-black text-lg">€{simBudget}</span>
                           </div>
                           <input 
                             type="range" 
                             min="500" max="10000" step="100"
                             value={simBudget}
                             onChange={(e) => setSimBudget(parseInt(e.target.value, 10))}
                             className="w-full h-4 bg-bauhaus-fg appearance-none rounded-none outline-none accent-bauhaus-yellow" 
                           />
                        </div>
                     </div>
                     
                     <div className="mt-4">
                       <BauhausButton variant="yellow" className="w-full" onClick={handleRecalculate}>Recalculate Plan</BauhausButton>
                     </div>
                  </div>
                )}

                {/* 4. Q&A AGENT */}
                {activeTab === 'qna' && (
                  <div className="flex flex-col h-full">
                     <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">04 / Concierge</h2>
                     <p className="text-sm font-bold tracking-widest uppercase mb-8 text-bauhaus-red">Q&A Interface</p>
                     
                     <div className="flex-1 bg-white border-4 border-white flex flex-col p-4 overflow-y-auto mb-4 gap-4 shadow-hard-md">
                        {qnaMessages.map((msg, i) => (
                           <div key={i} className={`${msg.role === 'user' ? 'self-end bg-bauhaus-fg text-white' : 'self-start bg-bauhaus-red text-white'} p-4 max-w-[80%] border-2 border-bauhaus-fg shadow-hard-sm`}>
                              <p className="text-sm font-medium">{msg.text}</p>
                           </div>
                        ))}
                        <div ref={chatEndRef} />
                     </div>
                     
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={qnaInput}
                          onChange={(e) => setQnaInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendQna()}
                          className="flex-1 bg-white border-4 border-white text-bauhaus-fg p-4 outline-none font-medium" 
                          placeholder="Ask about the itinerary..." 
                        />
                        <button onClick={handleSendQna} className="bg-bauhaus-red text-white font-bold uppercase px-6 border-4 border-white hover:bg-white hover:text-bauhaus-red transition-colors active-press">Send</button>
                     </div>
                  </div>
                )}

                {/* 5. EXPLAINER AGENT */}
                {activeTab === 'explainer' && (
                  <div className="flex flex-col h-full">
                     <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-bauhaus-blue">05 / Explainer</h2>
                     <p className="text-sm font-bold tracking-widest uppercase mb-8">Trace & Logic</p>
                     
                     <div className="flex-1 flex flex-col gap-4">
                        <div className="flex gap-4">
                          <div className="flex-1 bg-bauhaus-bg text-bauhaus-fg border-4 border-white p-4 flex flex-col justify-between shadow-hard-md">
                             <span className="text-xs font-bold uppercase">Candidates</span>
                             <span className="text-4xl font-black">1,402</span>
                          </div>
                          <div className="flex-1 bg-bauhaus-yellow text-bauhaus-fg border-4 border-white p-4 flex flex-col justify-between shadow-hard-md">
                             <span className="text-xs font-bold uppercase">Solve Time</span>
                             <span className="text-4xl font-black">1.4s</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-black border-4 border-white p-4 text-white font-mono text-xs overflow-y-auto shadow-hard-md">
                           <div className="mb-2 text-bauhaus-red">{"[VALIDATOR] Checking constraints..."}</div>
                           <div className="mb-2">{"[VALIDATOR] Resolving conflicts based on constraints..."}</div>
                           <div className="mb-2">{"[SCORER] Path A Score: 84.5"}</div>
                           <div className="mb-2 text-bauhaus-yellow">{"[SCORER] Path B Score: 92.1 (SELECTED)"}</div>
                           <div className="mb-2">{"[ENGINE] Finalizing schedule..."}</div>
                        </div>
                     </div>
                  </div>
                )}

             </div>
          </aside>

        </div>
      </main>

      {/* Bauhaus Boarding Pass Overlay */}
      {showPass && (
        <div className="fixed inset-0 z-[100] bg-bauhaus-fg/90 flex items-center justify-center p-4 lg:p-12 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-bauhaus-bg border-8 border-white flex flex-col md:flex-row shadow-[24px_24px_0px_0px_#D02020] relative">
             
             {/* Close Button */}
             <button onClick={() => setShowPass(false)} className="absolute -top-6 -right-6 w-12 h-12 bg-white text-bauhaus-fg border-4 border-bauhaus-fg font-black text-xl hover:bg-bauhaus-red hover:text-white transition-colors z-20 shadow-hard-sm rotate-12 hover:rotate-0">X</button>

             {/* Left Geometry */}
             <div className="w-full md:w-1/3 bg-bauhaus-blue border-b-8 md:border-b-0 md:border-r-8 border-white p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-bauhaus-yellow rounded-full mix-blend-screen opacity-50"></div>
                <div className="relative z-10">
                   <h2 className="text-6xl font-black uppercase tracking-tighter text-white mb-2 rotate-[-5deg]">TICKET</h2>
                   <span className="bg-white text-bauhaus-fg font-bold uppercase tracking-widest px-2 py-1 text-xs">Admit One</span>
                </div>
                <div className="relative z-10 mt-12 md:mt-0 text-white">
                   <div className="font-mono text-xs opacity-70 mb-2">PASS ID: TRV-8820-X</div>
                   <div className="barcode-mockup h-16 w-full bg-white opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #121212 0, #121212 2px, transparent 2px, transparent 6px, #121212 6px, #121212 10px, transparent 10px, transparent 12px)' }}></div>
                </div>
             </div>

             {/* Right Content */}
             <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+PGNpcmNsZSBjeD0nMjAnIGN5PScyMCcgcj0nMicgZmlsbD0nIzEyMTIxMicgb3BhY2l0eT0nMC4xJy8+PC9zdmc+')]">
                
                <div className="flex justify-between items-start mb-12 border-b-4 border-bauhaus-fg pb-8">
                   <div>
                      <span className="text-bauhaus-red font-bold uppercase tracking-widest text-xs mb-1 block">Destination</span>
                      <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-bauhaus-fg leading-none">{city}</h3>
                   </div>
                   <div className="text-right">
                      <span className="text-bauhaus-blue font-bold uppercase tracking-widest text-xs mb-1 block">Class</span>
                      <h4 className="text-3xl font-black uppercase text-bauhaus-fg">{pace}</h4>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                   <div>
                      <span className="text-bauhaus-muted-fg font-bold uppercase tracking-widest text-[10px] mb-1 block text-bauhaus-fg/50">Duration</span>
                      <div className="font-black text-2xl text-bauhaus-fg">{days} DAYS</div>
                   </div>
                   <div>
                      <span className="text-bauhaus-muted-fg font-bold uppercase tracking-widest text-[10px] mb-1 block text-bauhaus-fg/50">Budget</span>
                      <div className="font-black text-2xl text-bauhaus-fg">€{simBudget}</div>
                   </div>
                   <div>
                      <span className="text-bauhaus-muted-fg font-bold uppercase tracking-widest text-[10px] mb-1 block text-bauhaus-fg/50">Date</span>
                      <div className="font-black text-2xl text-bauhaus-fg">TBD</div>
                   </div>
                   <div>
                      <span className="text-bauhaus-muted-fg font-bold uppercase tracking-widest text-[10px] mb-1 block text-bauhaus-fg/50">Seat</span>
                      <div className="font-black text-2xl text-bauhaus-fg">ANY</div>
                   </div>
                </div>

                <div className="mt-auto flex justify-between items-end">
                   <div className="flex gap-2">
                     <div className="w-8 h-8 bg-bauhaus-red rounded-full border-2 border-bauhaus-fg"></div>
                     <div className="w-8 h-8 bg-bauhaus-yellow border-2 border-bauhaus-fg"></div>
                   </div>
                   <button className="bg-bauhaus-fg text-white font-bold uppercase tracking-widest px-8 py-4 hover:bg-bauhaus-red transition-colors active-press shadow-hard-sm" onClick={() => window.print()}>
                     PRINT PASS
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
