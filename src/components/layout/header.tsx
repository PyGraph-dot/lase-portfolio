'use client'

import Link from 'next/link'
import Image from 'next/image' // Import Image
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { name: 'Work', href: '/work' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (pathname?.startsWith('/studio') || pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-black/50 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* REPLACED TEXT WITH LOGO */}
        <Link href="/" className="z-50 relative w-32 h-10">
          <Image 
            src="/logo.svg" 
            alt="LASE Digital" 
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Nav Overlay */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 w-full h-screen bg-black flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </header>
  )
}