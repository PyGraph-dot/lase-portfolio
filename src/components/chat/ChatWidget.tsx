'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Check, Copy, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

// Define Message Interface
interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  created_at: string
  session_id?: string
}

export default function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  // Session ID Management
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const STORAGE_KEY = 'chatSessionId_v2'
      let id = localStorage.getItem(STORAGE_KEY)
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(STORAGE_KEY, id)
      }
      return id
    }
    return ''
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [adminOnline, setAdminOnline] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // --- NEW: LISTEN FOR OPEN EVENT FROM CONTACT PAGE ---
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true)
    }
    window.addEventListener('open-chat-widget', handleOpenChat)
    return () => window.removeEventListener('open-chat-widget', handleOpenChat)
  }, [])
  // ----------------------------------------------------

  // Normalizer helper
  const normalizeWithLocal = (row: any, localMessages: Message[] = []) => {
    const id = String(row.id ?? row._id ?? crypto.randomUUID())
    const text = row.text
    const created_at = row.created_at ?? new Date().toISOString()

    if (row.sender) {
      return { id, text, sender: row.sender as 'user' | 'admin', created_at, session_id: row.session_id }
    }

    const localMatch = localMessages.find((m) => {
      if (m.text !== text || m.sender !== 'user') return false
      const localTime = new Date(m.created_at).getTime()
      const serverTime = new Date(created_at).getTime()
      return Math.abs(localTime - serverTime) < 120000 
    })
    const sender = localMatch ? 'user' : 'admin'
    return { id, text, sender, created_at, session_id: row.session_id }
  }

  // Fetch & Subscribe Logic
  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio') || !sessionId) return

    const fetchHistory = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages((data as any[]).map((d) => normalizeWithLocal(d, [])) as Message[])
      }
    }
    fetchHistory()

    const channel = supabase
      .channel('chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
      (payload) => {
        setMessages((prev) => {
          const normalized = normalizeWithLocal(payload.new, prev) as Message
          if (prev.some((m) => m.id === normalized.id)) return prev
          return [...prev, normalized]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pathname, sessionId])

  // Admin Presence Logic
  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return
    const presenceChannel = supabase.channel('presence_broadcast')
      .on('broadcast', { event: 'presence' }, (payload) => {
        const p = payload.payload as any
        if (p?.admin) setAdminOnline(p.status === 'online')
      })
      .subscribe()

    return () => { supabase.removeChannel(presenceChannel) }
  }, [pathname])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim()) return

    const tempMsg: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      created_at: new Date().toISOString()
    }
    
    setMessages((prev) => [...prev, tempMsg])
    const msgToSend = input
    setInput('')

    const { data: inserted, error } = await supabase
      .from('messages')
      .insert([{ session_id: sessionId, text: msgToSend }])
      .select()

    if (!error && inserted && inserted.length > 0) {
      setMessages((prev) => {
        const idx = prev.map((m) => m.text).lastIndexOf(msgToSend)
        const withoutTemp = idx >= 0 ? [...prev.slice(0, idx), ...prev.slice(idx + 1)] : prev
        const normalized = (inserted as any[]).map((r) => normalizeWithLocal(r, prev)) as Message[]
        return [...withoutTemp, ...normalized]
      })
    }
  }

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[95vw] sm:w-[90vw] md:w-[380px] h-[500px] max-h-[80vh] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-neutral-800/50 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
              <div>
                <h3 className="font-bold text-white text-sm">Lase Support</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-green-400' : 'bg-neutral-700'}`} />
                  <span className="text-[10px] text-neutral-400">{adminOnline ? 'Online' : 'Offline'}</span>
                  <button onClick={copySessionId} className="ml-2 flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition">
                    {copied ? <Check size={10} /> : <Copy size={10} />} ID: {sessionId.slice(0, 6)}
                  </button>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white"><X size={18} /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 && (
                <div className="text-center mt-10 text-neutral-500 text-sm">
                  <p>Start a conversation.</p>
                  <p className="text-xs">Usually replies in 1 hour.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={msg.id + i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#00D4FF] text-black rounded-tr-none font-medium'
                      : 'bg-neutral-800 text-white rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-black/20 border-t border-white/5 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-neutral-800/50 border border-white/5 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:brightness-95 transition"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        // --- UPDATED CLASS: Adds pulse only when closed ---
        className={`w-14 h-14 bg-[#00D4FF] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition duration-300 ${!isOpen ? 'chat-button-pulse' : ''}`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  )
}