import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import LandingNav from '../components/LandingNav'
import AnimatedBackground from '../components/AnimatedBackground'

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

export default function TermsOfService() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => {
      const saved = localStorage.getItem('theme')
      if (saved !== 'dark') document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-bgbase text-textprimary overflow-hidden selection:bg-brand-500/30 font-sans">
      <AnimatedBackground />
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
          className="max-w-3xl mx-auto space-y-6"
        >
          <motion.div variants={FADE_UP_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgpanel/50 border border-brand-500/30 text-brand-400 text-sm font-medium backdrop-blur-sm">
            <ShieldCheck size={16} />
            <span>Last Updated: October 24, 2026</span>
          </motion.div>
          <motion.h1 variants={FADE_UP_VARIANTS} className="text-4xl md:text-6xl font-bold font-serif tracking-tight">
            Terms of <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">Service</span>
          </motion.h1>
          <motion.p variants={FADE_UP_VARIANTS} className="text-lg text-textsecondary">
            Rules and guidelines for using the AdMind platform.
          </motion.p>
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 px-6 lg:px-8 pb-32 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Sticky Sidebar */}
        <div className="md:w-1/4 hidden md:block">
          <div className="sticky top-32 bg-bgpanel/40 border border-borderwarm rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="font-bold text-textprimary mb-4 font-serif">Table of Contents</h3>
            <ul className="space-y-3 text-sm text-textsecondary">
              <li><a href="#acceptance" className="hover:text-brand-500 transition-colors">1. Acceptance of Terms</a></li>
              <li><a href="#usage" className="hover:text-brand-500 transition-colors">2. Platform Usage</a></li>
              <li><a href="#accounts" className="hover:text-brand-500 transition-colors">3. User Accounts</a></li>
              <li><a href="#ip" className="hover:text-brand-500 transition-colors">4. Intellectual Property</a></li>
              <li><a href="#disclaimers" className="hover:text-brand-500 transition-colors">5. Disclaimers</a></li>
              <li><a href="#termination" className="hover:text-brand-500 transition-colors">6. Termination</a></li>
              <li><a href="#governing-law" className="hover:text-brand-500 transition-colors">7. Governing Law</a></li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4 prose prose-invert prose-brand max-w-none">
          <div className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-xl">
            <p className="text-textsecondary mb-8">
              Welcome to AdMind. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 id="acceptance" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">1. Acceptance of Terms</h2>
            <p className="text-textsecondary mb-6">
              By creating an account, accessing, or using AdMind, you agree to comply with and be bound by these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>

            <h2 id="usage" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">2. Platform Usage</h2>
            <p className="text-textsecondary mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-textsecondary space-y-2 mb-6">
              <li>Violate any local, state, national, or international law.</li>
              <li>Infringe on the intellectual property rights of others.</li>
              <li>Generate misleading, fraudulent, or malicious ad campaigns.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            </ul>

            <h2 id="accounts" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">3. User Accounts</h2>
            <p className="text-textsecondary mb-6">
              You must provide accurate and complete information when creating an account. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure. We reserve the right to suspend or terminate accounts that violate our policies.
            </p>

            <h2 id="ip" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">4. Intellectual Property</h2>
            <p className="text-textsecondary mb-6">
              The AI-generated ad copy and strategies produced by AdMind for you are yours to use for your business purposes. However, the underlying technology, algorithms, software, and design of the AdMind platform remain the exclusive property of AdMind Inc.
            </p>

            <h2 id="disclaimers" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">5. Disclaimers</h2>
            <p className="text-textsecondary mb-6">
              AdMind provides AI-assisted recommendations and copy. While we strive for high quality, we do not guarantee specific performance results, conversion rates, or ROI for your advertising campaigns. You are responsible for reviewing and approving all ad copy and strategies before deploying them in live campaigns.
            </p>
            
            <h2 id="termination" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">6. Termination</h2>
            <p className="text-textsecondary mb-6">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2 id="governing-law" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">7. Governing Law</h2>
            <p className="text-textsecondary mb-6">
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </section>

      {/* Reused Footer from LandingPage */}
      <footer className="relative z-10 bg-bgbase border-t border-borderwarm py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold tracking-tight text-textprimary">AdMind</span>
            </div>
            <p className="text-textsecondary mb-6 max-w-sm">
              The AI co-pilot for digital marketers. Build campaigns, analyze performance, and write converting copy in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-textprimary mb-4">Resources</h4>
            <ul className="space-y-3 text-textmuted text-sm">
              <li><Link to="/blog" className="hover:text-brand-500 transition-colors">Blog</Link></li>
              <li><Link to="/community" className="hover:text-brand-500 transition-colors">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-textprimary mb-4">Company</h4>
            <ul className="space-y-3 text-textmuted text-sm">
              <li><a href="#" className="hover:text-brand-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Contact</a></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-borderwarm flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textmuted">
          <div>&copy; {new Date().getFullYear()} AdMind Inc. Made in India 🇮🇳 by Vivek Yadav.</div>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-textprimary transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-textprimary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
