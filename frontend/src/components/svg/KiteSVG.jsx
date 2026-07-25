import React from 'react'
import { motion } from 'framer-motion'

export default function KiteSVG({ className = "" }) {
  return (
    <motion.svg
      width="120"
      height="180"
      viewBox="0 0 120 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={{
        y: [0, -30, 15, 0],
        x: [0, 20, -10, 0],
        rotate: [-5, 3, -8, -5]
      }}
      transition={{
        duration: 15,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {/* Kite Body */}
      <path d="M60 10 L10 60 L60 120 L110 60 Z" fill="url(#kite-grad)" />
      {/* Kite Crossbones */}
      <line x1="60" y1="10" x2="60" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <line x1="10" y1="60" x2="110" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      
      {/* Kite String */}
      <path d="M60 120 Q 50 140, 60 160 T 50 180" stroke="#F59E0B" strokeWidth="2" fill="none" />
      
      {/* Bows */}
      <path d="M55 135 L45 130 L55 145 Z" fill="#38BDF8" />
      <path d="M65 135 L75 130 L65 145 Z" fill="#38BDF8" />
      
      <path d="M65 155 L75 150 L65 165 Z" fill="#8B5CF6" />
      <path d="M55 155 L45 150 L55 165 Z" fill="#8B5CF6" />
      
      <path d="M52 172 L42 167 L52 182 Z" fill="#14B8A6" />
      <path d="M62 172 L72 167 L62 182 Z" fill="#14B8A6" />

      <defs>
        <linearGradient id="kite-grad" x1="60" y1="10" x2="60" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D97757" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}
