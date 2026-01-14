'use client' // 1. Convert to Client Component

import Link from 'next/link'
import { usePathname } from 'next/navigation' // 2. Import hook
import { Instagram, Linkedin, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()

  // 3. THE BOUNCER CHECK
  if (pathname.startsWith('/studio') || pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-neutral-900/50 border-t border-white/5 pt-20 pb-10 px-6">
      {/* ... (Keep your existing Footer code exactly the same below) ... */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold tracking-tighter text-white mb-6">LASE.</h2>
          <p className="text-neutral-400 max-w-sm">
            Digital Architect helping brands build scalable identities and high-performance platforms.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Sitemap</h3>
          <ul className="space-y-2 text-neutral-400 text-sm">
            <li><Link href="/work" className="hover:text-white">Selected Work</Link></li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/about" className="hover:text-white">About Me</Link></li>
            <li><Link href="/admin" className="hover:text-white">Client Portal</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Connect</h3>
          <ul className="space-y-2 text-neutral-400 text-sm">
            <li className="flex items-center gap-2"><Mail size={14} /> info@bestchoicegraphics.com</li>
            <li className="flex items-center gap-2">Lagos, Nigeria</li>
          </ul>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com" className="text-neutral-400 hover:text-white"><Instagram size={20}/></a>
            <a href="https://linkedin.com" className="text-neutral-400 hover:text-white"><Linkedin size={20}/></a>
            <a href="https://twitter.com" className="text-neutral-400 hover:text-white"><Twitter size={20}/></a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between text-xs text-neutral-500">
        <p>© 2026 LASE. All rights reserved.</p>
        <p>Designed & Built by Toluwalase.</p>
      </div>
    </footer>
  )
}