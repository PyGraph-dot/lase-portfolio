'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Loader2, Phone, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

// --- Types ---
type Message = {
  id: string
  text: string
  session_id: string
  sender: 'user' | 'admin'
  created_at: string
}

export default function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminOnline, setAdminOnline] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const presenceTimeout = useRef<NodeJS.Timeout | null>(null)

  // 1. Session ID Management
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const key = 'lase_chat_session_v2'
      let id = localStorage.getItem(key)
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(key, id)
      }
      return id
    }
    return ''
  })

  // 2. Auto-Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  // --- REAL-TIME ENGINE ---
  useEffect(() => {
    if (pathname?.startsWith('/admin') || !sessionId) return

    // A. Fetch Hi¶»§q«^