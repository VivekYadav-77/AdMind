import React, { useEffect, useState } from 'react'
import KiteSVG from './svg/KiteSVG'
import {
  BarChartSVG,
  FunnelSVG,
  TargetSVG,
  CursorClickSVG,
  MegaphoneSVG,
  PieChartSVG,
  PercentBadgeSVG,
  TrendArrowSVG
} from './svg/AdAnalyticsSVGs'

const AdCardFloat = ({ metric, value, x, y, delay, duration, mouseOffset }) => (
  <div 
    className="absolute bg-animated-card rounded-xl px-4 py-3 flex flex-col items-center justify-center font-sans border border-borderwarm shadow-sm transition-transform duration-300 ease-out"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animation: `icon-float ${duration}s ease-in-out ${delay}s infinite alternate`,
      transform: `translate(${mouseOffset.x * 0.05}px, ${mouseOffset.y * 0.05}px)`
    }}
  >
    <span className="text-[10px] font-bold uppercase tracking-wider text-textmuted">{metric}</span>
    <span className="text-sm font-semibold text-textprimary">{value}</span>
  </div>
)

const ICONS = [
  BarChartSVG, FunnelSVG, TargetSVG, CursorClickSVG, 
  MegaphoneSVG, PieChartSVG, PercentBadgeSVG, TrendArrowSVG
]

// Pre-defined scattered positions for a balanced look without overlapping
const FIXED_POSITIONS = [
  { x: 10, y: 15 }, { x: 85, y: 20 }, { x: 15, y: 80 }, { x: 80, y: 85 },
  { x: 30, y: 10 }, { x: 70, y: 15 }, { x: 25, y: 85 }, { x: 65, y: 90 },
]

const FIXED_CARDS = [
  { metric: 'CTR', value: '4.2%', x: 15, y: 35 },
  { metric: 'ROI', value: '187%', x: 80, y: 60 },
  { metric: 'Imp.', value: '2.1M', x: 50, y: 85 }
]

export default function AnimatedBackground({ density = 'low', showKite = false }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate offset from center of screen
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  let iconCount = 4
  if (density === 'full') iconCount = 8
  if (density === 'minimal') iconCount = 2

  const icons = Array.from({ length: iconCount }).map((_, i) => {
    const Icon = ICONS[i % ICONS.length]
    const pos = FIXED_POSITIONS[i % FIXED_POSITIONS.length]
    // Use index to seed delay and duration for consistent rendering
    const delay = -(i * 2.5)
    const duration = 15 + (i % 3) * 3
    const reverse = i % 2 === 0
    return { id: `icon-${i}`, Component: Icon, x: pos.x, y: pos.y, delay, duration, reverse }
  })

  let cardCount = 0
  if (density === 'full') cardCount = 3
  if (density === 'low') cardCount = 1

  const cards = FIXED_CARDS.slice(0, cardCount).map((card, i) => ({
    id: `card-${i}`, 
    ...card, 
    delay: -(i * 4), 
    duration: 12 + (i * 2) 
  }))

  const kiteConfig = showKite ? { x: 65, y: 25 } : null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-animated-layer">
      {icons.map((item, index) => {
        const animationName = item.reverse ? 'icon-float-reverse' : 'icon-float'
        // Different parallax depth based on index
        const depth = 0.02 + (index % 3) * 0.015;
        
        return (
          <div
            key={item.id}
            className="absolute bg-svg-icon transition-transform duration-300 ease-out"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animation: `${animationName} ${item.duration}s ease-in-out ${item.delay}s infinite alternate`,
              transform: `translate(${mousePosition.x * depth}px, ${mousePosition.y * depth}px)`
            }}
          >
            <item.Component className="w-16 h-16 md:w-20 md:h-20" />
          </div>
        )
      })}

      {cards.map((item) => (
        <AdCardFloat 
          key={item.id} 
          metric={item.metric} 
          value={item.value} 
          x={item.x} 
          y={item.y} 
          delay={item.delay} 
          duration={item.duration} 
          mouseOffset={mousePosition}
        />
      ))}

      {kiteConfig && (
        <div 
          className="absolute bg-kite transition-transform duration-500 ease-out"
          style={{
            left: `${kiteConfig.x}%`,
            top: `${kiteConfig.y}%`,
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        >
          <KiteSVG />
        </div>
      )}
    </div>
  )
}
