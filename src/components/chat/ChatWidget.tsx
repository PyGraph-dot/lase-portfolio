'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Loader2, Phone, ExternalLink, ArrowRight } from 'lucide-react'
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

    // A. Fetch History
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      if (data) {
        setMessages((prev) => {
          const newIds = new Set(data.map(m => m.id))
          const merged = [...prev.filter(m => !newIds.has(m.id)), ...data]
          return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        })
      }
    }
    fetchMessages()

    // B. Real-time Listener
    const chatChannel = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
             if (prev.some(m => m.id === newMsg.id)) return prev
             return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    // C. Presence Listener
    const presenceChannel = supabase.channel('global_presence')
      .on('broadcast', { event: 'admin_ping' }, () => {
         setAdminOnline(true)
         if (presenceTimeout.current) clearTimeout(presenceTimeout.current)
         presenceTimeout.current = setTimeout(() => setAdminOnline(false), 10000)
      })
      .subscribe()

    // D. Polling Backup
    const interval = setInterval(fetchMessages, 4000)

    return () => { 
      supabase.removeChannel(chatChannel)
      supabase.removeChannel(presenceChannel)
      clearInterval(interval)
      if (presenceTimeout.current) clearTimeout(presenceTimeout.current)
    }
  }, [sessionId, pathname])

  // --- ACTIONS ---
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-chat-widget', handleOpen)
    return () => window.removeEventListener('open-chat-widget', handleOpen)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const textToSend = input
    setInput('')
    setLoading(true)

    const tempMsg: Message = {
      id: crypto.randomUUID(),
      text: textToSend,
      sender: 'user',
      session_id: sessionId,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    const { error } = await supabase.from('messages').insert({
      session_id: sessionId,
      text: textToSend,
      sender: 'user'
    })

    if (error) console.error("Send failed")
    setLoading(false)
  }

  // --- PARSER HELPER ---
  const renderMessageText = (text: string) => {
    // Check if message is our special JSON Card
    if (text.startsWith('{') && text.includes('action_card')) {
      try {
        const card = JSON.parse(text)
        if (card.type === 'action_card' && card.action === 'open_whatsapp') {
          return (
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-2 text-[#25D366] font-bold pb-2 border-b border-neutral-700/50">
                <Phone size={16} fill="currentColor" />
                <span>WhatsApp Connection</span>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Let&apos;s move this conversation to WhatsApp for faster updates and file sharing.
              </p>
              <a 
                href={card.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-2.5 rounded-lg transition-colors text-xs"
              >
                <span>Open WhatsApp</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )
        }
      } catch (e) {
        // Fallback if parsing fails
        return text
      }
    }
    return text
  }

  if (pathname?.startsWith('/admin')) return null

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[92vw] md:w-[380px] h-[70vh] md:h-[500px] bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-2.5 h-2.5 rounded-full ${adminOnline ? 'bg-green-500' : 'bg-neutral-600'}`} />
                  {adminOnline && <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none">Lase Support</div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {adminOnline ? 'Typically replies instantly' : 'Replies in ~24h'}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-black">
              {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-neutral-600 text-sm space-y-4">
                    <MessageCircle size={32} className="opacity-20" />
                    <p>Start a conversation...</p>
                 </div>
              )}
              {messages.map((msg) => {
                // Check if it's a card to style the container differently
                const isCard = msg.text.startsWith('{') && msg.text.includes('action_card');
                
                return (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm transition-all ${
                      msg.sender === 'admin' 
                        ? isCard 
                          ? 'bg-neutral-900 border border-[#25D366]/30 text-white rounded-tl-none p-0 overflow-hidden' // Card Style
                          : 'bg-neutral-800 text-white rounded-tl-none' // Standard Admin Msg
                        : 'bg-[#00D4FF] text-black font-medium rounded-tr-none' // User Msg
                    }`}>
                      {/* If it's a card, add padding inside the render function, else use default padding */}
                      <div className={isCard ? 'p-4' : ''}>
                        {renderMessageText(msg.text)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black border-t border-white/5 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:border-[#00D4FF] outline-none transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#00D4FF] text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_50px_rgba(0,212,255,0.5)] transition duration-300 relative group"
      >
        {adminOnline && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full z-10" />
        )}
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}