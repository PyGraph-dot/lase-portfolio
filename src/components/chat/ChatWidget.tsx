'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Check, Copy, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  created_at: string
}

export default function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState(() => {
    try {
      const STORAGE_KEY = 'chatSessionId_v2'
      let id = localStorage.getItem(STORAGE_KEY)
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(STORAGE_KEY, id)
      }
      return id
    } catch {
      return ''
    }
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [actionCopiedMap, setActionCopiedMap] = useState<Record<string, boolean>>({})
  const [adminOnline, setAdminOnline] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const latestMessagesRef = useRef<Message[]>([])

  const normalizeWithLocal = (row: any, localMessages: Message[] = []) => {
    const id = String(row.id ?? row._id ?? crypto.randomUUID())
    const text = row.text
    const created_at = row.created_at ?? new Date().toISOString()

    if (typeof row.is_user_message !== 'undefined') {
      return { id, text, sender: row.is_user_message ? 'user' : 'admin', created_at, session_id: row.session_id }
    }

    if (row.sender) {
      return { id, text, sender: row.sender as 'user' | 'admin', created_at, session_id: row.session_id }
    }

    // If this message matches a local optimistic message (same text and close timestamp), treat it as from the user.
    const localMatch = localMessages.find((m) => {
      if (m.text !== text || m.sender !== 'user') return false
      const localTime = new Date(m.created_at).getTime()
      const serverTime = new Date(created_at).getTime()
      return Math.abs(localTime - serverTime) < 120000 // within 2 minutes
    })
    const sender = localMatch ? 'user' : 'admin'
    return { id, text, sender, created_at, session_id: row.session_id }
  }

  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return
    // FIX 2: Version Control the ID
    // If the user has an old 'Integer' ID from before the update, this wipes it.
    const STORAGE_KEY = 'chatSessionId_v2' // Changed key to force new ID generation
    
    let currentId = localStorage.getItem(STORAGE_KEY)
    
    if (!currentId) {
      currentId = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, currentId)
    }

    

    const fetchHistory = async () => {
      // FIX 3: Debug the Fetch
      // We check for errors explicitly to catch RLS issues
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', currentId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Supabase Fetch Error:', error.message)
      } else if (data) {
        // For initial fetch, no optimistic local messages to match against
        setMessages((data as any[]).map((d) => normalizeWithLocal(d, [])) as Message[])
      }
    }
    fetchHistory()

    // Ensure state `sessionId` matches the ID we used for fetching/subscribing.
    setSessionId(currentId)

    const channel = supabase
      .channel('chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${currentId}` },
      (payload) => {
        setMessages((prev) => {
          const normalized = normalizeWithLocal(payload.new, prev) as Message
          if (prev.some((m) => m.id === normalized.id)) return prev
          // If the incoming message is from admin and widget is closed, show a browser notification
          try {
            const incomingIsAdmin = normalized.sender === 'admin'
            if (incomingIsAdmin && !isOpen && typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Lase Support', { body: normalized.text.slice(0, 120) })
              }
            }
          } catch (e) {
            // ignore notification errors
          }

          return [...prev, normalized]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pathname])

  // Request notification permission proactively when widget mounts
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      try {
        Notification.requestPermission().catch(() => {})
      } catch (e) {}
    }
  }, [])

  // Presence: inform others when this user opens/closes chat using a lightweight broadcast channel
  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return
    const presenceChannel = supabase.channel('presence_broadcast')
      .subscribe()

    const announce = (status: 'online' | 'offline') => {
      try {
        presenceChannel.send({ type: 'broadcast', event: 'presence', payload: { session_id: sessionId, status } })
      } catch (e) {
        // ignore
      }
    }

    // announce online once mounted
    if (sessionId) announce('online')

    const interval = setInterval(() => announce('online'), 15000)

    return () => {
      clearInterval(interval)
      announce('offline')
      supabase.removeChannel(presenceChannel)
    }
  }, [pathname, sessionId])

  // Listen for presence broadcasts (including admin presence)
  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return
    const listen = supabase.channel('presence_broadcast')
      .on('broadcast', { event: 'presence' }, (payload) => {
        try {
          const p = payload.payload as any
          if (!p) return
          if (p.admin) {
            setAdminOnline(p.status === 'online')
          }
        } catch (e) {}
      })
      .subscribe()

    return () => { supabase.removeChannel(listen) }
  }, [pathname])

  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) return
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    latestMessagesRef.current = messages
  }, [messages, isOpen, pathname])

  const handleSend = async () => {
    if (!input.trim()) return

    const tempMsg: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      created_at: new Date().toISOString()
    }
    
    // Optimistic Update
    setMessages((prev) => [...prev, tempMsg])
    const msgToSend = input
    setInput('')

    // FIX 4: Insert a minimal payload (omit `sender` if DB column missing)
    const { data: inserted, error } = await supabase
      .from('messages')
      .insert([
        {
          session_id: sessionId,
          text: msgToSend,
          // don't include optional columns (like `sender`/`is_read`) unless they exist in your DB
        },
      ])
      .select()

    if (error) {
      console.error('Message Send Error:', error.message, error.details)
      // Optional: Add UI feedback that message failed
      return
    }

    // If the insert returned the real row, reconcile optimistic update
    if (inserted && inserted.length > 0) {
      setMessages((prev) => {
        // Find last optimistic message matching the text and remove it, then append normalized rows.
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

  // FIX 1: Ensure strict hiding on admin/studio
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) {
    return null
  }

  // ... Render logic remains exactly the same ...
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[95vw] sm:w-[90vw] md:w-[380px] max-h-[85vh] md:h-[500px] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden touch-pan-y"
          >
            {/* Header */}
            <div className="p-4 bg-neutral-800/50 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
              <div>
                <h3 className="font-bold text-white text-sm">Lase Support</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <button 
                  onClick={copySessionId}
                  className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-[#00D4FF] transition mt-0.5"
                  title="Copy Ticket ID"
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  <span>Ref: {sessionId.slice(0, 8)}...</span>
                </button>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-green-400' : 'bg-neutral-700'}`} title={adminOnline ? 'Admin online' : 'Admin offline'} />
                    <span className="text-[10px] text-neutral-400">{adminOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setIsOpen(false)} aria-label="Close Chat" className="text-neutral-400 hover:text-white"><X size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-3">
              {messages.length === 0 && (
                <div className="text-center mt-10">
                  <p className="text-neutral-500 text-sm mb-2">Start a conversation</p>
                  <p className="text-xs text-neutral-600">Usually replies in 1 hour.</p>
                </div>
              )}
              {
                // Deduplicate messages by `id` to avoid React key collisions
                (() => {
                  const seen = new Set<string>()
                  const deduped: Message[] = []
                  for (const m of messages) {
                    if (!seen.has(m.id)) {
                      seen.add(m.id)
                      deduped.push(m)
                    }
                  }
                  return deduped.map((msg) => {
                    // Try parse structured payloads (action cards)
                    let parsed: any = null
                    try {
                      parsed = JSON.parse(msg.text)
                    } catch (e) {
                      parsed = null
                    }

                    if (parsed && parsed.type === 'action_card') {
                      const isCopied = !!actionCopiedMap[msg.id]
                      return (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-0 rounded-2xl text-sm ${
                            msg.sender === 'user'
                              ? 'rounded-tr-none'
                              : 'rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-3 bg-gradient-to-br from-neutral-900 to-neutral-800 p-3 rounded-xl border border-white/5 shadow-lg">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                  <Phone size={20} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-white">{parsed.label}</div>
                                <div className="text-xs text-neutral-400">Click to continue the conversation on WhatsApp.</div>
                                <div className="mt-3 flex gap-2">
                                  <a href={parsed.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366] text-black rounded-md font-semibold shadow-sm">
                                    <Phone size={14} /> Open WhatsApp
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(parsed.url)
                                      setActionCopiedMap((s) => ({ ...s, [msg.id]: true }))
                                      setTimeout(() => setActionCopiedMap((s) => ({ ...s, [msg.id]: false })), 2000)
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 text-white rounded-md text-sm"
                                  >
                                    {isCopied ? 'Copied!' : 'Copy link'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#00D4FF] text-black rounded-tr-none font-medium'
                            : 'bg-neutral-800 text-white rounded-tl-none border border-white/5'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    )
                  })
                })()
              }
            </div>

            {/* Input */}
            <div className="p-3 bg-black/20 border-t border-white/5 flex gap-2 items-end">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-neutral-800/50 border border-white/5 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition"
              />
              <button 
                onClick={handleSend}
                aria-label="Send Message"
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
        className="w-14 h-14 bg-[#00D4FF] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition duration-300"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  )
}