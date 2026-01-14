'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    // 1. Track Mouse
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    // 2. Track Hover State (Buttons/Links)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // If we hover over a link, button, or input -> Expand Cursor
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    // Only show on devices that support hover (Desktops)
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9999] hidden md:block mix-blend-difference"
      animate={{
        x: mousePosition.x - 16, // Center the circle
        y: mousePosition.y - 16,
        scale: isHovering ? 2.5 : 1, // Grow when clicking/hovering
        backgroundColor: isHovering ? 'white' : 'transparent', // Fill when active
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1
      }}
    />
  )
}