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
      <path d="M60 10 L10 60 L60 120 L110 60 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1" className="svg-draw-path" />
      {/* Kite Crossbones */}
      <line x1="60" y1="10" x2="60" y2="120" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="svg-draw-path-dashed" />
      <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="svg-draw-path-dashed" />
      
      {/* Kite String */}
      <path d="M60 120 Q 50 140, 60 160 T 50 180" stroke="currentColor" strokeWidth="2" fill="none" pathLength="1" className="svg-draw-path" />
      
      {/* Bows */}
      <path d="M55 135 L45 130 L55 145 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1" className="svg-draw-path" />
      <path d="M65 135 L75 130 L65 145 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1" className="svg-draw-path" />
      
      <path d="M65 155 L75 150 L65 165 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1" className="svg-draw-path" />
      <path d="M55 155 L45 150 L55 165 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1" className="svg-draw-path" />
      
      <path d="M52 172 L42 167 L52 182 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1" className="svg-draw-path" />
      <path d="M62 172 L72 167 L62 182 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" pathLength="1" className="svg-draw-path" />
    </motion.svg>
  )
}
