
import React from 'react';

export const APP_NAME = "VILLAGE BANK PLATFORM";

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <path d="M50 5L15 25V75L50 95L85 75V25L50 5Z" fill="url(#logo-grad)" fillOpacity="0.1" stroke="url(#logo-grad)" strokeWidth="4" />
    <path d="M50 20V80" stroke="url(#logo-grad)" strokeWidth="8" strokeLinecap="round" />
    <path d="M30 40L50 20L70 40" stroke="url(#logo-grad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="10" fill="url(#logo-grad)" />
    <path d="M35 65H65" stroke="url(#logo-grad)" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export const DEFAULT_THEME_COLOR = "bg-slate-900";
export const ACCENT_COLOR = "blue-500";
