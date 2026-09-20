import React from 'react';

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'link';
  children: React.ReactNode;
}

export function LuxuryButton({ variant = 'primary', children, className = '', ...props }: LuxuryButtonProps) {
  const baseClasses = "relative overflow-hidden inline-flex items-center justify-center font-medium uppercase text-xs tracking-[0.2em] transition-all duration-500 ease-luxury group";
  
  const variants = {
    primary: "bg-charcoal text-alabaster h-12 px-10 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] border-none rounded-none",
    secondary: "bg-transparent text-charcoal h-12 px-10 border border-charcoal hover:bg-charcoal hover:text-alabaster rounded-none",
    link: "bg-transparent text-charcoal p-0 border-none hover:text-gold hover:underline underline-offset-4 rounded-none",
  };

  if (variant === 'primary') {
    return (
      <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
        {/* Gold slide-in overlay */}
        <span className="absolute inset-0 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-luxury z-0"></span>
        <span className="relative z-10">{children}</span>
      </button>
    );
  }

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
