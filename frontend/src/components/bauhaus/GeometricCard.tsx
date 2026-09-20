import React from 'react';

interface GeometricCardProps {
  children: React.ReactNode;
  className?: string;
  decoration?: 'circle' | 'square' | 'triangle' | 'none';
  decorationColor?: 'red' | 'blue' | 'yellow';
}

export function GeometricCard({ 
  children, 
  className = '',
  decoration = 'circle',
  decorationColor = 'red'
}: GeometricCardProps) {
  
  const colors = {
    red: 'bg-bauhaus-red',
    blue: 'bg-bauhaus-blue',
    yellow: 'bg-bauhaus-yellow'
  };

  return (
    <div className={`relative bg-white border-4 border-bauhaus-fg shadow-hard-lg hover:-translate-y-2 transition-transform duration-300 ease-out ${className}`}>
      
      {/* Corner Decoration */}
      {decoration !== 'none' && (
        <div className="absolute -top-3 -right-3 z-10">
          {decoration === 'circle' && (
            <div className={`w-8 h-8 rounded-full border-2 border-bauhaus-fg ${colors[decorationColor]}`}></div>
          )}
          {decoration === 'square' && (
            <div className={`w-8 h-8 rounded-none border-2 border-bauhaus-fg ${colors[decorationColor]}`}></div>
          )}
          {decoration === 'triangle' && (
            <div 
              className={`w-8 h-8 border-2 border-bauhaus-fg ${colors[decorationColor]}`}
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            ></div>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
}
