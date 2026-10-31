'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { verifyAdminPin, deleteSessionMessages } from './actions' 
import { Send, Phone, User, Monitor, Menu, X, Trash2, Loader2, WifiOff } from 'lucide-react'

// --- Types ---
type Message = {
  id: string
  text: string
  session_id: string
  sender: 'user' | 'admin'
  created_at: string
}

export default function AdminDashboard() {
  // --- State ---
  const [sessions, setSessions] = useState<string[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  
  // Trackers
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  // --- Auto-Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeSession])

  // --- Data Fetching ---
  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('session_id, created_at')
      .order('created_at', { ascending: fals¶»§q«^