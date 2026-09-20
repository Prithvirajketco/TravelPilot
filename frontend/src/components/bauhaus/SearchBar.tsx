"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function SearchBar() {
  const [origin, setOrigin] = useState('');
  const [showOrigin, setShowOrigin] = useState(false);
  const [originResults, setOriginResults] = useState<string[]>([]);
  
  const [dest, setDest] = useState('');
  const [showDest, setShowDest] = useState(false);
  const [destResults, setDestResults] = useState<string[]>([]);
  
  const [dates, setDates] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Real Calendar Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 11, 1);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    if (viewMonth > minMonth) {
      setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    if (viewMonth < maxMonth) {
      setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
    }
  };

  const viewYear = viewMonth.getFullYear();
  const viewMonthIdx = viewMonth.getMonth();
  const daysInMonth = new Date(viewYear, viewMonthIdx + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonthIdx, 1).getDay();
  const startingDay = firstDay === 0 ? 6 : firstDay - 1; // Mon=0, Sun=6
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) setShowOrigin(false);
      if (destRef.current && !destRef.current.contains(event.target as Node)) setShowDest(false);
      if (calRef.current && !calRef.current.contains(event.target as Node)) setShowCalendar(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Origin Autocomplete
  useEffect(() => {
    if (origin.length < 2) {
      setOriginResults([]);
      return;
    }
    const debounce = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${origin}&count=6&language=en&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data.results) {
            const places = data.results.map((r: any) => 
              `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`
            );
            setOriginResults(Array.from(new Set(places)) as string[]);
          } else {
            setOriginResults([]);
          }
        }).catch(() => setOriginResults([]));
    }, 300);
    return () => clearTimeout(debounce);
  }, [origin]);

  // Fetch Destination Autocomplete
  useEffect(() => {
    if (dest.length < 2) {
      setDestResults([]);
      return;
    }
    const debounce = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${dest}&count=6&language=en&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data.results) {
            const places = data.results.map((r: any) => 
              `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`
            );
            setDestResults(Array.from(new Set(places)) as string[]);
          } else {
            setDestResults([]);
          }
        }).catch(() => setDestResults([]));
    }, 300);
    return () => clearTimeout(debounce);
  }, [dest]);

  return (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 lg:gap-0 border-4 border-bauhaus-fg shadow-[12px_12px_0px_0px_#121212] bg-bauhaus-bg relative z-50">
      
      {/* ORIGIN INPUT */}
      <div 
        ref={originRef} 
        className={`flex-1 flex flex-col p-4 border-b-4 lg:border-b-0 lg:border-r-4 border-bauhaus-fg bg-white relative ${showOrigin ? 'z-[100]' : 'z-10'}`}
      >
        <label className="text-xs font-bold uppercase tracking-widest text-bauhaus-red mb-1">Origin</label>
        <input 
          type="text" 
          value={origin}
          onChange={(e) => { setOrigin(e.target.value); setShowOrigin(true); }}
          onFocus={() => { setShowOrigin(true); setShowDest(false); setShowCalendar(false); }}
          placeholder="FROM WHERE?" 
          className="w-full text-xl font-black uppercase outline-none bg-transparent placeholder:text-bauhaus-muted" 
        />
        
        {/* Origin Dropdown */}
        {showOrigin && origin.length >= 2 && (
          <div className="absolute top-[100%] left-[-4px] right-[-4px] mt-2 bg-white border-4 border-bauhaus-fg shadow-[8px_8px_0px_0px_#121212] max-h-64 overflow-y-auto z-[999]">
            {originResults.length > 0 ? originResults.map((loc, idx) => (
              <div 
                key={idx} 
                className="p-4 font-bold uppercase text-sm border-b-2 border-bauhaus-fg/10 hover:bg-bauhaus-red hover:text-white cursor-pointer transition-colors"
                onMouseDown={(e) => { e.preventDefault(); setOrigin(loc); setShowOrigin(false); }}
              >
                {loc}
              </div>
            )) : (
              <div className="p-4 font-bold uppercase text-sm text-bauhaus-muted">SEARCHING GLOBE...</div>
            )}
          </div>
        )}
      </div>
      
      {/* CONNECTION ARROW (Independent sibling to prevent z-index clipping) */}
      <div className="hidden lg:block flex-none w-0 relative z-[200]">
        <div className="absolute top-1/2 left-0 w-8 h-8 bg-bauhaus-yellow border-4 border-bauhaus-fg flex items-center justify-center rounded-full transform -translate-x-[calc(50%+2px)] -translate-y-1/2">
          <span className="text-bauhaus-fg font-black leading-none">→</span>
        </div>
      </div>
      
      {/* DESTINATION INPUT */}
      <div 
        ref={destRef} 
        className={`flex-1 flex flex-col p-4 border-b-4 lg:border-b-0 lg:border-r-4 border-bauhaus-fg bg-white relative ${showDest ? 'z-[100]' : 'z-10'}`}
      >
        <label className="text-xs font-bold uppercase tracking-widest text-bauhaus-blue mb-1 pl-4 lg:pl-4">Destination</label>
        <input 
          type="text" 
          value={dest}
          onChange={(e) => { setDest(e.target.value); setShowDest(true); }}
          onFocus={() => { setShowDest(true); setShowOrigin(false); setShowCalendar(false); }}
          placeholder="TO WHERE?" 
          className="w-full text-xl font-black uppercase outline-none bg-transparent placeholder:text-bauhaus-muted pl-4 lg:pl-4" 
        />

        {/* Destination Dropdown */}
        {showDest && dest.length >= 2 && (
          <div className="absolute top-[100%] left-[-4px] right-[-4px] mt-2 bg-white border-4 border-bauhaus-fg shadow-[8px_8px_0px_0px_#121212] max-h-64 overflow-y-auto z-[999]">
            {destResults.length > 0 ? destResults.map((loc, idx) => (
              <div 
                key={idx} 
                className="p-4 font-bold uppercase text-sm border-b-2 border-bauhaus-fg/10 hover:bg-bauhaus-blue hover:text-white cursor-pointer transition-colors"
                onMouseDown={(e) => { e.preventDefault(); setDest(loc); setShowDest(false); }}
              >
                {loc}
              </div>
            )) : (
              <div className="p-4 font-bold uppercase text-sm text-bauhaus-muted">SEARCHING GLOBE...</div>
            )}
          </div>
        )}
      </div>

      {/* DATES INPUT */}
      <div 
        ref={calRef} 
        className={`flex-1 flex flex-col p-4 border-b-4 lg:border-b-0 lg:border-r-4 border-bauhaus-fg bg-white relative cursor-pointer ${showCalendar ? 'z-[100]' : 'z-10'}`} 
        onClick={() => { setShowCalendar(!showCalendar); setShowOrigin(false); setShowDest(false); }}
      >
        <label className="text-xs font-bold uppercase tracking-widest text-bauhaus-fg mb-1">Dates</label>
        
        <div className="w-full text-xl font-black uppercase text-bauhaus-fg flex items-center justify-between">
           <span>{dates || <span className="text-bauhaus-muted">SELECT DATES</span>}</span>
           <span className="text-sm text-bauhaus-fg">▼</span>
        </div>

        {/* Bauhaus Calendar Dropdown */}
        {showCalendar && (
          <div 
            className="absolute top-[100%] right-[-4px] w-80 mt-2 bg-white border-4 border-bauhaus-fg shadow-[8px_8px_0px_0px_#121212] z-[999] p-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
             <div className="flex justify-between items-center mb-4 border-b-4 border-bauhaus-fg pb-2">
                <button 
                  onClick={handlePrevMonth}
                  disabled={viewMonth <= minMonth}
                  className={`font-black text-xl px-2 ${viewMonth <= minMonth ? 'text-bauhaus-muted opacity-50 cursor-not-allowed' : 'hover:text-bauhaus-red cursor-pointer'}`}
                >←</button>
                <span className="font-bold uppercase tracking-widest text-sm">{monthNames[viewMonthIdx]} {viewYear}</span>
                <button 
                  onClick={handleNextMonth}
                  disabled={viewMonth >= maxMonth}
                  className={`font-black text-xl px-2 ${viewMonth >= maxMonth ? 'text-bauhaus-muted opacity-50 cursor-not-allowed' : 'hover:text-bauhaus-blue cursor-pointer'}`}
                >→</button>
             </div>
             
             <div className="grid grid-cols-7 gap-1 mb-2">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center font-bold text-xs text-bauhaus-fg/50">{d}</div>
                ))}
             </div>
             
             <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const date = new Date(viewYear, viewMonthIdx, day);
                  const isPast = date < today;
                  
                  return (
                    <button 
                      key={day}
                      disabled={isPast}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        if (!isPast) {
                           const endDate = new Date(viewYear, viewMonthIdx, day + 6);
                           setDates(`${monthNames[viewMonthIdx].substring(0,3)} ${day} - ${monthNames[endDate.getMonth()].substring(0,3)} ${endDate.getDate()}`);
                           setShowCalendar(false); 
                        }
                      }}
                      className={`aspect-square flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                        isPast 
                          ? 'text-bauhaus-muted border-transparent cursor-not-allowed line-through' 
                          : 'border-transparent hover:border-bauhaus-fg hover:bg-bauhaus-yellow cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
             </div>
             
             <div className="mt-4 pt-2 border-t-2 border-bauhaus-fg/20 flex justify-between">
                <button onClick={(e) => { e.preventDefault(); setDates(''); setShowCalendar(false); }} className="text-xs font-bold uppercase tracking-widest hover:text-bauhaus-red">Clear</button>
                <span className="text-xs font-bold uppercase tracking-widest text-bauhaus-fg/50">7-Day Blocks</span>
             </div>
          </div>
        )}
      </div>

      <Link href={`/dashboard?city=${dest.split(',')[0] || 'Custom'}&days=7&budget=2500`} className="flex z-10">
        <button className="w-full lg:w-auto px-12 bg-bauhaus-red text-white text-xl font-black uppercase tracking-widest hover:bg-bauhaus-fg transition-colors h-full py-6 lg:py-0 active-press border-none">
          Search Routes
        </button>
      </Link>

    </div>
  );
}
