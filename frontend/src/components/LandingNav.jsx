import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll } from 'framer-motion'
import clsx from 'clsx'

export default function LandingNav() {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  return (
    <motion.header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-bgpanel/80 backdrop-blur-md border-b border-borderwarm py-3' 
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white shadow-[0_0_15px_rgba(217,119,87,0.4)]">
            A
          </div>
          <span className="text-2xl font-bold tracking-tight text-textprimary">AdMind</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden sm:block text-sm font-medium text-textsecondary hover:text-textprimary transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="btn-primary text-sm px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(217,119,87,0.3)]"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
