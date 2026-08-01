import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'
import Logo from './Logo'

export default function LandingNav() {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const navLinks = [
    { name: 'Features', href: '/#features', isAnchor: true },
    { name: 'Use Cases', href: '/#use-cases', isAnchor: true },
    { name: 'Testimonials', href: '/#testimonials', isAnchor: true },
    { name: 'Blog', href: '/blog', isAnchor: false },
    { name: 'Community', href: '/community', isAnchor: false },
    { name: 'FAQ', href: '/#faq', isAnchor: true },
  ]

  const scrollToSection = (e, link) => {
    if (!link.isAnchor) {
      setMobileMenuOpen(false)
      return // Let Link handle the routing
    }
    
    // If we are on the home page, scroll smoothly
    if (window.location.pathname === '/') {
      e.preventDefault()
      setMobileMenuOpen(false)
      const element = document.querySelector(link.href.replace('/', ''))
      if (element) {
        const offset = 80 // height of the fixed nav
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
    // Else, we let it navigate to /#section naturally
  }

  return (
    <>
      <motion.header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled 
            ? 'bg-bgpanel/80 backdrop-blur-md border-b border-borderwarm py-3 shadow-sm' 
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10 text-brand-500" />
              <span className="text-2xl font-bold tracking-tight text-textprimary">AdMind</span>
            </div>
            
            
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isAnchor && window.location.pathname === '/' ? (
                <a 
                  key={link.name} 
                  href={link.href.replace('/', '')}
                  onClick={(e) => scrollToSection(e, link)}
                  className="text-sm font-medium text-textsecondary hover:text-brand-500 transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => scrollToSection(e, link)}
                  className="text-sm font-medium text-textsecondary hover:text-brand-500 transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-textsecondary hover:text-textprimary transition-colors px-4 py-2"
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

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-textprimary focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-bgbase md:hidden overflow-y-auto"
          >
            <div className="p-6 flex flex-col min-h-screen">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Logo className="h-10 w-10 text-brand-500" />
                  <span className="text-2xl font-bold tracking-tight text-textprimary">AdMind</span>
                </div>
                <button 
                  className="p-2 text-textprimary focus:outline-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-6 flex-1 mt-4">
                {navLinks.map((link) => (
                  link.isAnchor && window.location.pathname === '/' ? (
                    <a 
                      key={link.name} 
                      href={link.href.replace('/', '')}
                      onClick={(e) => scrollToSection(e, link)}
                      className="text-2xl font-serif font-bold text-textprimary"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={(e) => scrollToSection(e, link)}
                      className="text-2xl font-serif font-bold text-textprimary"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </nav>

              <div className="flex flex-col gap-4 mt-8 pb-8">
                <Link
                  to="/login"
                  className="btn-secondary w-full text-center py-4"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary w-full text-center py-4 text-lg"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
