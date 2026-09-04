import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Target, Rocket, Sparkles, Quote, Terminal, Github, Linkedin, Twitter } from 'lucide-react'
import LandingNav from '../components/LandingNav'
import AnimatedBackground from '../components/AnimatedBackground'

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
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
      <section className="relative pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={FADE_UP_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-medium backdrop-blur-sm">
            <Sparkles size={16} />
            <span>The Story Behind AdMind</span>
          </motion.div>
          <motion.h1 variants={FADE_UP_VARIANTS} className="text-5xl md:text-7xl font-bold font-serif tracking-tight leading-tight">
            Redefining the <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-brand-600 bg-clip-text text-transparent">Digital Marketing</span> Landscape
          </motion.h1>
          <motion.p variants={FADE_UP_VARIANTS} className="text-xl md:text-2xl text-textsecondary max-w-2xl mx-auto font-light leading-relaxed">
            We believe that AI isn't just a tool—it's a creative partner. AdMind was built to empower marketers, founders, and creators to unleash their full potential.
          </motion.p>
        </motion.div>
      </section>

      {/* Founder Section */}
      <section className="relative z-10 px-6 lg:px-8 pb-32 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-bgpanel/80 to-bgbase/40 border border-borderwarm/50 rounded-[2rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl overflow-hidden group"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>

          <div className="relative flex flex-col md:flex-row gap-12 items-center">
            {/* Image Side */}
            <div className="w-full md:w-1/3 flex flex-col items-center space-y-6">
              <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full p-2 bg-gradient-to-tr from-brand-500 to-purple-600 shadow-xl shadow-brand-500/20 group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-bgpanel flex items-center justify-center border-4 border-bgbase relative">
                  {/* The actual image */}
                  <img 
                    src="/vivek.jpg" 
                    alt="Vivek Yadav" 
                    className="w-full h-full object-cover z-10"
                    onError={(e) => {
                      // Fallback if image doesn't exist yet
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback avatar if image isn't placed yet */}
                  <div className="absolute inset-0 hidden flex-col items-center justify-center bg-bgpanel/50 backdrop-blur-sm z-0">
                    <Terminal size={48} className="text-textmuted mb-2" />
                    <span className="text-xs text-textmuted text-center px-4">Place vivek.jpg in /public</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <a href="https://github.com/VivekYadav-77/AdMind" className="p-3 rounded-full bg-bgbase/80 border border-borderwarm hover:bg-brand-500/10 hover:border-brand-500/50 hover:text-brand-400 transition-all shadow-lg text-textsecondary">
                  <Github size={20} />
                </a>
                <a href="https://www.linkedin.com/in/vivekyadav94/" className="p-3 rounded-full bg-bgbase/80 border border-borderwarm hover:bg-brand-500/10 hover:border-brand-500/50 hover:text-brand-400 transition-all shadow-lg text-textsecondary">
                  <Linkedin size={20} />
                </a>
                
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-2/3 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider">
                Founder & Creator
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-textprimary">Vivek Yadav</h2>
              <div className="relative">
                <Quote className="absolute -top-4 -left-4 text-brand-500/20 rotate-180" size={48} />
                <p className="text-lg md:text-xl text-textsecondary leading-relaxed relative z-10 pl-6 border-l-2 border-brand-500/30">
                  "I built AdMind because I saw how much time creators and businesses were losing to repetitive marketing tasks. I wanted to create an AI copilot that didn't just automate work, but actually elevated the creative process. AdMind is the tool I wish I had when I started out."
                </p>
              </div>
              <p className="text-textmuted leading-relaxed pt-4">
                As a Full-Stack Developer and AI Enthusiast, Vivek combines technical expertise with a deep understanding of digital marketing workflows. When he's not writing code or building AI pipelines, he's exploring the latest in tech design and user experience.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Content Grid - Mission & Vision */}
      <section className="relative z-10 px-6 lg:px-8 pb-32 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Mission Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-bgpanel/40 border border-borderwarm hover:border-brand-500/30 rounded-[2rem] p-10 md:p-12 backdrop-blur-md shadow-xl transition-all duration-500 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
            <Target size={32} className="text-brand-400" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-textprimary mb-4">Our Mission</h2>
          <p className="text-textsecondary text-lg leading-relaxed">
            To democratize access to world-class digital marketing by providing businesses of all sizes with intelligent, intuitive, and powerful AI tools. We aim to turn every user into a marketing powerhouse.
          </p>
        </motion.div>

        {/* Vision Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-bgpanel/40 border border-borderwarm hover:border-purple-500/30 rounded-[2rem] p-10 md:p-12 backdrop-blur-md shadow-xl transition-all duration-500 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
            <Rocket size={32} className="text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-textprimary mb-4">The Future</h2>
          <p className="text-textsecondary text-lg leading-relaxed">
            We envision a world where the technical barriers of marketing are completely eliminated. Where a simple idea can be instantly transformed into a multi-channel campaign that connects with the right audience.
          </p>
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
              <li><Link to="/contact" className="hover:text-brand-500 transition-colors">Contact</Link></li>
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
