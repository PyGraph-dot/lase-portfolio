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
      .order('created_at', { ascending: false })
    
    if (error) {
        console.error("Connection Error")
        setIsConnected(false)
    } else {
        setIsConnected(true)
        if (data) {
            const unique = Array.from(new Set(data.map((item: any) => item.session_id)))
            setSessions(unique as string[])
        }
    }
  }

  async function loadMessages(id: string) {
    setActiveSession(id)
    setIsMobileMenuOpen(false) 
    
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      
    if (data) setMessages(data as Message[])
    setUnreadMap((s) => ({ ...s, [id]: 0 }))
  }

  // --- Auth ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await verifyAdminPin(pinInput)
    setLoading(false)
    
    if (result.success) {
      setIsAuth(true)
      fetchSessions() 
    } else {
      alert("Access Denied")
      setPinInput('')
    }
  }

  // --- Actions ---
  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeSession) return
    
    const textToSend = input
    setInput('') 

    // 1. Optimistic Update
    const tempMsg: Message = {
        id: crypto.randomUUID(),
        text: textToSend,
        session_id: activeSession,
        sender: 'admin',
        created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    // 2. Send to DB
    const { error } = await supabase.from('messages').insert({
      text: textToSend,
      session_id: activeSession,
      sender: 'admin'
    })

    if (error) {
        alert('Failed to send. Check connection.')
        setIsConnected(false)
    }
  }

  const triggerWhatsApp = async () => {
    if (!activeSession) return
    const link = `https://wa.me/2349121539519?text=Hi, continuing session ID: ${activeSession.substring(0,5)}`
    
    const payload = JSON.stringify({
      type: 'action_card',
      action: 'open_whatsapp',
      label: 'Continue on WhatsApp',
      url: link,
    })

    await supabase.from('messages').insert({
      text: payload,
      session_id: activeSession,
      sender: 'admin'
    })
    
    // Force refresh
    loadMessages(activeSession)
  }

  const handleDeleteSession = async () => {
    if (!activeSession) return
    if (!confirm('Delete conversation?')) return
    
    const result = await deleteSessionMessages(activeSession)
    if (result.success) {
        setMessages([])
        setSessions(prev => prev.filter(id => id !== activeSession))
        setActiveSession(null)
    }
  }

  // --- BROADCAST PRESENCE ---
  useEffect(() => {
    if (!isAuth) return

    const channel = supabase.channel('global_presence')
    
    const sendHeartbeat = async () => {
      try {
        await channel.send({
          type: 'broadcast',
          event: 'admin_ping',
          payload: { status: 'online' }
        })
      } catch (err) {
        console.error("Heartbeat failed", err)
      }
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        sendHeartbeat() 
      }
    })

    const interval = setInterval(sendHeartbeat, 5000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [isAuth])


  // --- SYNC ENGINE ---
  useEffect(() => {
    if (!isAuth) return

    // 1. REALTIME
    const channel = supabase.channel('admin_global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message
        
        if (activeSession === newMsg.session_id) {
            setMessages(prev => {
                if (prev.some(m => m.text === newMsg.text && m.sender === newMsg.sender)) return prev
                return [...prev, newMsg]
            })
        } else {
            if (newMsg.sender === 'user') {
                setUnreadMap(prev => ({ ...prev, [newMsg.session_id]: (prev[newMsg.session_id] || 0) + 1 }))
                fetchSessions() 
            }
        }
      })
      .subscribe()

    // 2. POLLING BACKUP
    const interval = setInterval(() => {
        fetchSessions()
        if (activeSession) {
            supabase.from('messages')
                .select('*')
                .eq('session_id', activeSession)
                .order('created_at', { ascending: true })
                .then(({ data }) => {
                   if (data) {
                       setMessages(prev => {
                           if (data.length !== prev.length) return data as Message[]
                           return prev
                       })
                   }
                })
        }
    }, 4000)
      
    return () => { 
        supabase.removeChannel(channel) 
        clearInterval(interval)
    }
  }, [activeSession, isAuth])


  // --- Render ---

  if (!isAuth) {
    return (
      <div className="h-[100dvh] bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-xs space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white tracking-tighter">LASE<span className="text-[#00D4FF]">.ADMIN</span></h1>
                <p className="text-neutral-500 text-sm mt-2">Secure Gateway</p>
            </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="PIN Access"
              className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl p-4 text-center text-lg tracking-[0.5em] focus:border-[#00D4FF] outline-none transition-colors"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              maxLength={6}
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-[#00D4FF] transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    // FIX: Use 100dvh to fix mobile scroll issues
    <div className="flex h-[100dvh] bg-black text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 h-16 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <h2 className="font-bold tracking-tight">INBOX <span className="text-neutral-600 ml-1">{sessions.length}</span></h2>
                {!isConnected && <WifiOff size={14} className="text-red-500 animate-pulse"/>}
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-neutral-400"><X /></button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100dvh-64px)]">
            {sessions.map(id => (
                <button
                    key={id}
                    onClick={() => loadMessages(id)}
                    className={`w-full p-4 border-b border-white/5 flex items-start gap-3 transition-colors ${activeSession === id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                >
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                        <User size={14} className="text-neutral-400"/>
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-xs text-[#00D4FF] truncate">{id.slice(0,6)}...</span>
                            {unreadMap[id] > 0 && <span className="w-2 h-2 bg-[#00D4FF] rounded-full" />}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">Click to load history</div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* CHAT AREA */}
      {/* FIX: flex-col with min-h-0 ensures children scroll correctly */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black relative">
        
        {activeSession ? (
            <>
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-black/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-neutral-400">
                            <Menu size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                <span className="font-mono text-sm">ID: {activeSession.slice(0,6)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={triggerWhatsApp} className="p-2 hover:bg-white/10 rounded-lg text-green-500" title="Push to WhatsApp">
                            <Phone size={18} />
                        </button>
                        <button onClick={handleDeleteSession} className="p-2 hover:bg-white/10 rounded-lg text-red-500" title="Delete Session">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages - Takes available space */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[60%] p-3 sm:p-4 rounded-2xl text-sm ${
                                msg.sender === 'admin' 
                                    ? 'bg-white text-black rounded-tr-none' 
                                    : 'bg-neutral-900 border border-white/10 text-neutral-300 rounded-tl-none'
                            }`}>
                                {msg.text.includes('action_card') ? (
                                    <span className="italic text-neutral-500 flex items-center gap-2">
                                        <Phone size={14} /> WhatsApp Prompt Sent
                                    </span>
                                ) : msg.text}
                            </div>
                        </div>
                    ))}
                    <div className="h-2" /> 
                </div>

                {/* Input - Stays at bottom without sticky issues */}
                <div className="p-4 border-t border-white/10 bg-black shrink-0">
                    <form onSubmit={sendReply} className="flex gap-2">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a reply..."
                            className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4FF] outline-none transition-colors"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim()}
                            className="bg-[#00D4FF] text-black px-4 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mb-4 p-4 bg-neutral-900 rounded-full text-white">
                    <Menu size={24} />
                </button>
                <Monitor size={48} className="opacity-20 mb-4" />
                <p>Waiting for incoming transmission...</p>
            </div>
        )}
      </div>
    </div>
  )
}
