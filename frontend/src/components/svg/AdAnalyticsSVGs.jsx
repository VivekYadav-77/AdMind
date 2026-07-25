import React from 'react'

export const BarChartSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="24" width="8" height="16" rx="2" fill="#D97757" />
    <rect x="20" y="12" width="8" height="28" rx="2" fill="#F59E0B" />
    <rect x="32" y="18" width="8" height="22" rx="2" fill="#14B8A6" />
  </svg>
)

export const FunnelSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 10C6 8.89543 6.89543 8 8 8H40C41.1046 8 42 8.89543 42 10V14C42 14.7956 41.6839 15.5587 41.1213 16.1213L28 29.2426V38C28 38.3978 27.7631 38.7589 27.3944 38.922L21.3944 41.922C20.6552 42.2916 19.7909 41.7533 19.7909 40.922V29.2426L6.87868 16.1213C6.31607 15.5587 6 14.7956 6 14V10Z" fill="url(#funnel-grad)"/>
    <defs>
      <linearGradient id="funnel-grad" x1="24" y1="8" x2="24" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#D97757" />
      </linearGradient>
    </defs>
  </svg>
)

export const TargetSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="24" cy="24" r="20" stroke="#D97757" strokeWidth="4" />
    <circle cx="24" cy="24" r="12" stroke="#D97757" strokeWidth="4" />
    <circle cx="24" cy="24" r="4" fill="#D97757" />
    <path d="M42 6L24 24" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
    <path d="M42 6L32 6M42 6L42 16" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const CursorClickSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14 14L24 38L28 28L38 24L14 14Z" fill="#38BDF8" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="28" cy="28" r="16" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" />
  </svg>
)

export const MegaphoneSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M22 28L10 28C7.79086 28 6 26.2091 6 24C6 21.7909 7.79086 20 10 20L22 20L34 12V36L22 28Z" fill="#F59E0B" />
    <path d="M40 16C42.5 19 42.5 29 40 32M36 20C37.5 22 37.5 26 36 28" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export const PieChartSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24H24V4Z" fill="#14B8A6" />
    <path d="M44 22C43.4357 12.2858 35.7142 4.5643 26 4V22H44Z" fill="#D97757" />
  </svg>
)

export const PercentBadgeSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="6" y="6" width="36" height="36" rx="8" fill="#D97757" fillOpacity="0.2" stroke="#D97757" strokeWidth="3" />
    <circle cx="18" cy="18" r="3" fill="#D97757" />
    <circle cx="30" cy="30" r="3" fill="#D97757" />
    <path d="M30 18L18 30" stroke="#D97757" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export const TrendArrowSVG = ({ className }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 38L20 26L28 34L40 22" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 22H40V30" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12L14 18L20 20L14 22L12 28L10 22L4 20L10 18L12 12Z" fill="#F59E0B" />
  </svg>
)
