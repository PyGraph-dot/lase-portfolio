'use client'
import { motion } from 'framer-motion'

export default function Marquee() {
  const items = ["BRAND IDENTITY", "WEB DEVELOPMENT", "UI/UX DESIGN", "SEO STRATEGY", "ART DIRECTION", "NEXT.JS ARCHITECTURE"]
  
  return (
    <div className="relative flex overflow-hidden py-6 border-y border-white/5 bg-neutral-900/30">
      <motion.div 
        className="flex whitespace-nowrap gap-12"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="text-sm font-mono tracking-widest text-neutral-400">{item}</span>
            <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
          </div>
        ))}
      </motion.div>
      
      {/* Fade Edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#050505] to-transparent z-10" />
    </div>
  )
}