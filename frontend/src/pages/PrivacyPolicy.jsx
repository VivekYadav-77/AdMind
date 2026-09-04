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

export default function PrivacyPolicy() {

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
            Privacy <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">Policy</span>
          </motion.h1>
          <motion.p variants={FADE_UP_VARIANTS} className="text-lg text-textsecondary">
            How AdMind collects, uses, and protects your data.
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
              <li><a href="#information-collection" className="hover:text-brand-500 transition-colors">Information Collection</a></li>
              <li><a href="#information-usage" className="hover:text-brand-500 transition-colors">Information Usage</a></li>
              <li><a href="#data-protection" className="hover:text-brand-500 transition-colors">Data Protection</a></li>
              <li><a href="#third-party" className="hover:text-brand-500 transition-colors">Third-Party Services</a></li>
              <li><a href="#your-rights" className="hover:text-brand-500 transition-colors">Your Rights</a></li>
              <li><a href="#contact" className="hover:text-brand-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4 prose prose-invert prose-brand max-w-none">
          <div className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-xl">
            <p className="text-textsecondary mb-8">
              Welcome to AdMind. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 id="information-collection" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">1. Information We Collect</h2>
            <p className="text-textsecondary mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 text-textsecondary space-y-2 mb-6">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services (like ad copy generated, campaigns analyzed).</li>
            </ul>

            <h2 id="information-usage" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">2. How We Use Your Information</h2>
            <p className="text-textsecondary mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-textsecondary space-y-2 mb-6">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>To train our AI models (only aggregated and anonymized data is used, unless you opt-in for specific fine-tuning).</li>
            </ul>

            <h2 id="data-protection" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">3. Data Security</h2>
            <p className="text-textsecondary mb-6">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 id="third-party" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">4. Third-Party Services</h2>
            <p className="text-textsecondary mb-6">
              We use third-party APIs (such as Google Gemini) to process ad copy generation and strategy audits. Data sent to these third parties is subject to their respective privacy policies. We ensure that our partners comply with strict data protection standards.
            </p>

            <h2 id="your-rights" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">5. Your Legal Rights</h2>
            <p className="text-textsecondary mb-4">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
            </p>
            <ul className="list-disc pl-6 text-textsecondary space-y-2 mb-6">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
            </ul>

            <h2 id="contact" className="text-2xl font-bold font-serif text-textprimary mt-10 mb-4">6. Contact Us</h2>
            <p className="text-textsecondary mb-6">
              If you have any questions about this privacy policy or our privacy practices, please contact us at <strong>privacy@admind.ai</strong>.
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
