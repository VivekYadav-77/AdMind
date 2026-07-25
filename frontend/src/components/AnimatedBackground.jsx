import React, { useMemo } from 'react'
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

const AdCardFloat = ({ metric, value, x, y, delay, duration }) => (
  <div 
    className="absolute bg-animated-card rounded-xl px-4 py-3 flex flex-col items-center justify-center font-sans border border-borderwarm backdrop-blur-sm shadow-sm"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animation: `icon-float ${duration}s ease-in-out ${delay}s infinite alternate`,
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

export default function AnimatedBackground({ density = 'low', showKite = false }) {
  // Memoize random positions to avoid re-renders causing jumps
  const backgroundElements = useMemo(() => {
    let iconCount = 4
    if (density === 'full') iconCount = 8
    if (density === 'minimal') iconCount = 2

    const icons = Array.from({ length: iconCount }).map((_, i) => {
      const Icon = ICONS[i % ICONS.length]
      const x = Math.floor(Math.random() * 90) + 5
      const y = Math.floor(Math.random() * 90) + 5
      const delay = Math.random() * -20 // random start point in animation
      const duration = Math.floor(Math.random() * 10) + 15 // 15-25s
      const reverse = Math.random() > 0.5
      return { id: `icon-${i}`, Component: Icon, x, y, delay, duration, reverse }
    })

    let cardCount = 0
    if (density === 'full') cardCount = 3
    if (density === 'low') cardCount = 1

    const cardData = [
      { metric: 'CTR', value: '4.2%' },
      { metric: 'ROI', value: '187%' },
      { metric: 'Imp.', value: '2.1M' }
    ]

    const cards = Array.from({ length: cardCount }).map((_, i) => {
      const x = Math.floor(Math.random() * 80) + 10
      const y = Math.floor(Math.random() * 80) + 10
      const delay = Math.random() * -20
      const duration = Math.floor(Math.random() * 8) + 12 // 12-20s
      return { id: `card-${i}`, ...cardData[i % cardData.length], x, y, delay, duration }
    })

    const kiteConfig = showKite ? {
      x: Math.floor(Math.random() * 60) + 10,
      y: Math.floor(Math.random() * 50) + 10
    } : null

    return { icons, cards, kiteConfig }
  }, [density, showKite])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-animated-layer">
      {backgroundElements.icons.map((item) => {
        const animationName = item.reverse ? 'icon-float-reverse' : 'icon-float'
        return (
          <div
            key={item.id}
            className="absolute bg-svg-icon"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animation: `${animationName} ${item.duration}s ease-in-out ${item.delay}s infinite alternate`
            }}
          >
            <item.Component className="w-12 h-12" />
          </div>
        )
      })}

      {backgroundElements.cards.map((item) => (
        <AdCardFloat 
          key={item.id} 
          metric={item.metric} 
          value={item.value} 
          x={item.x} 
          y={item.y} 
          delay={item.delay} 
          duration={item.duration} 
        />
      ))}

      {backgroundElements.kiteConfig && (
        <div 
          className="absolute bg-kite"
          style={{
            left: `${backgroundElements.kiteConfig.x}%`,
            top: `${backgroundElements.kiteConfig.y}%`,
          }}
        >
          <KiteSVG />
        </div>
      )}
    </div>
  )
}
