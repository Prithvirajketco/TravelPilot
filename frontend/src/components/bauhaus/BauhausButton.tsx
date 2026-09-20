import React from 'react';

interface BauhausButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'outline' | 'ghost';
  shape?: 'square' | 'pill';
  children: React.ReactNode;
}

export function BauhausButton({ 
  variant = 'primary', 
  shape = 'square',
  children, 
  className = '', 
  ...props 
}: BauhausButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-bold uppercase tracking-wider text-sm h-14 px-8 border-2 border-bauhaus-fg transition-all duration-200 ease-out active-press";
  
  const shapeClass = shape === 'square' ? 'rounded-none' : 'rounded-full';

  const variants = {
    primary: "bg-bauhaus-red text-white shadow-hard-sm hover:bg-bauhaus-red/90",
    secondary: "bg-bauhaus-blue text-white shadow-hard-sm hover:bg-bauhaus-blue/90",
    yellow: "bg-bauhaus-yellow text-bauhaus-fg shadow-hard-sm hover:bg-bauhaus-yellow/90",
    outline: "bg-white text-bauhaus-fg shadow-hard-sm hover:bg-bauhaus-bg",
    ghost: "border-none text-bauhaus-fg hover:bg-bauhaus-muted shadow-none",
  };

  return (
    <button className={`${baseClasses} ${shapeClass} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
