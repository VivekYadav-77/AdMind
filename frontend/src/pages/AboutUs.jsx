import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Target, Rocket } from 'lucide-react'
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

export default function AboutUs() {
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
            <Users size={16} />
            <span>Who We Are</span>
          </motion.div>
          <motion.h1 variants={FADE_UP_VARIANTS} className="text-4xl md:text-6xl font-bold font-serif tracking-tight">
            About <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">AdMind</span>
          </motion.h1>
          <motion.p variants={FADE_UP_VARIANTS} className="text-lg text-textsecondary">
            Building the future of AI-driven digital marketing.
          </motion.p>
        </motion.div>
      </section>

      {/* Content Section - Placeholders */}
      <section className="relative z-10 px-6 lg:px-8 pb-32 max-w-4xl mx-auto space-y-12">
        
        {/* Mission Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center">
              <Target size={24} className="text-brand-500" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-textprimary">Our Mission</h2>
          </div>
          <div className="min-h-[150px] p-6 border-2 border-dashed border-borderwarm rounded-xl bg-bgbase/50 flex items-center justify-center text-center">
            <p className="text-textmuted text-lg italic">
              [ Placeholder: Enter your company mission statement here ]
            </p>
          </div>
        </motion.div>

        {/* Story Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Rocket size={24} className="text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-textprimary">Our Story</h2>
          </div>
          <div className="min-h-[200px] p-6 border-2 border-dashed border-borderwarm rounded-xl bg-bgbase/50 flex items-center justify-center text-center">
            <p className="text-textmuted text-lg italic">
              [ Placeholder: Write the story of how AdMind started and evolved here ]
            </p>
          </div>
        </motion.div>

        {/* Team Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users size={24} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-textprimary">Our Team</h2>
          </div>
          <div className="min-h-[250px] p-6 border-2 border-dashed border-borderwarm rounded-xl bg-bgbase/50 flex items-center justify-center text-center">
             <p className="text-textmuted text-lg italic">
              [ Placeholder: Add team member profiles, photos, and bios here ]
            </p>
          </div>
        </motion.div>

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
              <li><Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
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
