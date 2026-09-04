import React from 'react'

export default function Logo({ className = "h-8 w-8" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 2v2" className="text-brand-400 opacity-60" />
      <path d="M12 20v2" className="text-brand-400 opacity-60" />
      <path d="M4 12H2" className="text-brand-400 opacity-60" />
      <path d="M22 12h-2" className="text-brand-400 opacity-60" />
      <circle cx="12" cy="12" r="6" className="text-brand-500 fill-brand-500/10" />
      <path d="M12 9v6" className="text-brand-600" />
      <path d="M9 12h6" className="text-brand-600" />
      <circle cx="12" cy="12" r="2" className="text-white fill-brand-400" />
      
      {/* Node connections */}
      <circle cx="17.5" cy="6.5" r="1.5" className="text-brand-400 fill-brand-400" />
      <path d="M16.5 7.5L14 10" className="text-brand-500/50" />
      
      <circle cx="6.5" cy="17.5" r="1.5" className="text-brand-400 fill-brand-400" />
      <path d="M7.5 16.5L10 14" className="text-brand-500/50" />
      
      <circle cx="6.5" cy="6.5" r="1.5" className="text-brand-400 fill-brand-400" />
      <path d="M7.5 7.5L10 10" className="text-brand-500/50" />
    </svg>
  )
}
