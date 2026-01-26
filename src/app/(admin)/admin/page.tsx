'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { verifyAdminPin, deleteSessionMessages } from './actions' // IMPORT SERVER ACTIONS
import { Send, Phone, User, Monitor, Menu, X } from 'lucide-react'

type Message = {
  id: string
  text: string
  session_id: string
  is_user_message: boolean
  created_at?: string
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<string[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [presenceMap, setPresenceMap] = useState<Record<string, 'online' | 'offline'>>({})
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})
  const [pinInput, setPinInput] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // --- Helper Functions ---

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // SECURE LOGIN: Call Server Action
    const result = await verifyAdminPin(pinInput)
    
    if (result.success) {
      setIsAuth(true)
    } else {
      alert("Access Denied: " + (result.error || "Invalid PIN"))
      setPinInput('')
    }
  }

  // --- Actions ---

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input || !activeSession) return
    
    await supabase.from('messages').insert({
      text: input,
      session_id: activeSession,
      is_user_message: false 
    })
    setInput('')
  }

  const triggerWhatsApp = async () => {
    if (!activeSession) return
    const link = `https://wa.me/2349121539519?text=Hi Toluwalase, continuing session ID: ${activeSession.substring(0,5)}`
    const payload = JSON.stringify({
      type: 'action_card',
      action: 'open_whatsapp',
      label: 'Continue this conversation on WhatsApp',
      url: link,
    })

    await supabase.from('messages').insert({
      text: payload,
      session_id: activeSession,
      is_user_message: false
    })
  }

  const exportMessages = async () => {
    if (!activeSession) return
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', activeSession)
        .order('created_at', { ascending: true })

      const payload = JSON.stringify(data ?? [], null, 2)
      const blob = new Blob([payload], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session-${activeSession}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Failed to export messages')
    }
  }

  // UPDATED: Use Server Action for Secure Deletion
  const clearMessages = async () => {
    if (!activeSession) return
    const ok = confirm('Clear all messages for this session? This cannot be undone.')
    if (!ok) return
    
    const result = await deleteSessionMessages(activeSession)

    if (result.success) {
        setMessages([])
        alert('Messages cleared successfully')
    } else {
        alert('Failed to clear: ' + result.error)
    }
  }

  // UPDATED: Use Server Action for Secure Deletion
  const deleteSession = async () => {
    if (!activeSession) return
    const ok = confirm('Delete this session entirely? This will remove all messages.')
    if (!ok) return
    
    const result = await deleteSessionMessages(activeSession)

    if (result.success) {
        setMessages([])
        setSessions(prev => prev.filter(id => id !== activeSession))
        setActiveSession(null)
        alert('Session deleted successfully')
    } else {
        alert('Failed to delete: ' + result.error)
    }
  }

  const copySessionId = async () => {
    if (!activeSession) return
    try {
      await navigator.clipboard.writeText(activeSession)
      alert('Session ID copied to clipboard')
    } catch (err) {
      console.error(err)
      alert('Failed to copy session id')
    }
  }

  // --- Effects ---

  useEffect(() => {
    if (!isAuth) return

    const fetchSessions = async () => {
      const { data } = await supabase
        .from('messages')
        .select('session_id')
        .order('created_at', { ascending: false })
      
      if (data) {
        const unique = Array.from(new Set(data.map((item: any) => item.session_id)))
        setSessions(unique as string[])
      }
    }
    fetchSessions()

    const channel = supabase.channel('admin_global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        fetchSessions()
        if (activeSession) loadMessages(activeSession)

        try {
          const row = payload.new as any
          if (row.is_user_message) {
            const sid = row.session_id
            setUnreadMap((s) => ({ ...s, [sid]: (s[sid] ?? 0) + 1 }))
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('New user message', { body: String(row.text).slice(0, 120) })
              }
            }
          }
        } catch (e) { }
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [activeSession, isAuth])

  useEffect(() => {
    if (!isAuth || typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      try { Notification.requestPermission().catch(() => {}) } catch (e) {}
    }
  }, [isAuth])

  useEffect(() => {
    if (!isAuth) return
    const presenceChannel = supabase.channel('presence_broadcast')
      .on('broadcast', { event: 'presence' }, (payload) => {
        try {
          const p = payload.payload as any
          if (!p || !p.session_id) return
          setPresenceMap((s) => ({ ...s, [p.session_id]: p.status }))
        } catch (e) {}
      })
      .subscribe()

    return () => { supabase.removeChannel(presenceChannel) }
  }, [isAuth])

  useEffect(() => {
    if (!isAuth) return
    const adminPresence = supabase.channel('presence_broadcast').subscribe()

    const announce = (status: 'online' | 'offline') => {
      try {
        adminPresence.send({ type: 'broadcast', event: 'presence', payload: { admin: true, status } })
      } catch (e) {}
    }

    announce('online')
    const t = setInterval(() => announce('online'), 15000)

    return () => {
      clearInterval(t)
      announce('offline')
      supabase.removeChannel(adminPresence)
    }
  }, [isAuth])


  // --- Render ---

  if (!isAuth) {
    return (
      <div className="h-screen bg-black flex items-center justify-center font-sans px-4">
        <div className="text-center space-y-4 w-full max-w-sm">
          <h1 className="text-white font-bold text-2xl md:text-3xl tracking-tighter">LASE. <span className="text-neutral-500">ADMIN</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter PIN"
              className="bg-neutral-900 text-white p-3 md:p-4 rounded-lg border border-white/20 focus:border-white focus:outline-none text-center w-full text-lg"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <button 
              type="submit"
              className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-neutral-200 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 overflow-y-auto hidden md:block">
        <h2 className="font-bold mb-6 text-xl tracking-tighter">LASE. <span className="text-neutral-500 text-sm">CMD</span></h2>
        <div className="space-y-2">
          {sessions.map(id => (
            <button
              key={id}
              onClick={() => {
                loadMessages(id)
                setUnreadMap((s) => ({ ...s, [id]: 0 }))
              }}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 text-sm transition ${
                activeSession === id ? 'bg-white text-black' : 'hover:bg-neutral-900 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex items-center gap-3">
                  <User size={14} />
                  <span className="truncate">{id.substring(0, 8)}...</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {presenceMap[id] === 'online' ? (
                    <span className="w-2 h-2 rounded-full bg-green-400" title="Online" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-700" title="Offline" />
                  )}
                  {unreadMap[id] > 0 && (
                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">{unreadMap[id]}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-black border-r border-white/10 p-4 overflow-y-auto z-50 md:hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl tracking-tighter">LASE. <span className="text-neutral-500 text-sm">CMD</span></h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-neutral-400"
                aria-label="Close menu"
                title="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {sessions.map(id => (
                <button
                  key={id}
                  onClick={() => {
                    loadMessages(id)
                    setUnreadMap((s) => ({ ...s, [id]: 0 }))
                  }}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 text-sm transition ${
                    activeSession === id ? 'bg-white text-black' : 'hover:bg-neutral-900 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center gap-3">
                      <User size={14} />
                      <span className="truncate">{id.substring(0, 8)}...</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {presenceMap[id] === 'online' ? (
                        <span className="w-2 h-2 rounded-full bg-green-400" title="Online" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-700" title="Offline" />
                      )}
                      {unreadMap[id] > 0 && (
                        <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">{unreadMap[id]}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeSession ? (
          <>
            {/* Mobile Menu Button */}
            <div className="md:hidden border-b border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-white hover:text-neutral-400 p-2 flex items-center"
                aria-label="Open sessions menu"
                title="Open sessions menu"
              >
                <Menu size={20} />
                {sessions.length > 0 && (
                  <span className="ml-2 text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    {sessions.length}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-green-500" />
                <span className="font-mono text-xs text-neutral-300 truncate">{activeSession.substring(0,8)}</span>
              </div>
            </div>

            {/* Header with Actions */}
            <div className="h-auto md:h-16 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 bg-white/5 gap-3 md:gap-0">
              <div className="hidden md:flex items-center gap-2">
                <Monitor size={16} className="text-green-500" />
                <span className="font-mono text-sm text-neutral-300">Session: {activeSession.substring(0,8)}</span>
              </div>
              
              {/* Mobile: Scrollable button row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button
                  onClick={copySessionId}
                  className="px-3 py-1.5 md:py-1 bg-neutral-800 text-neutral-300 rounded-md text-xs md:text-sm hover:bg-neutral-700 whitespace-nowrap"
                >
                  Copy ID
                </button>
                <button
                  onClick={exportMessages}
                  className="px-3 py-1.5 md:py-1 bg-neutral-800 text-neutral-300 rounded-md text-xs md:text-sm hover:bg-neutral-700 whitespace-nowrap"
                >
                  Export
                </button>
                <button
                  onClick={clearMessages}
                  className="px-3 py-1.5 md:py-1 bg-neutral-800 text-amber-400 rounded-md text-xs md:text-sm hover:bg-neutral-700 whitespace-nowrap"
                >
                  Clear
                </button>
                <button
                  onClick={deleteSession}
                  className="px-3 py-1.5 md:py-1 bg-red-600 text-white rounded-md text-xs md:text-sm hover:brightness-90 whitespace-nowrap"
                >
                  Delete
                </button>
                <button 
                  onClick={triggerWhatsApp}
                  className="bg-[#25D366] text-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 hover:brightness-110 whitespace-nowrap"
                >
                  <Phone size={14} className="md:w-4 md:h-4" fill="black" /> 
                  <span className="hidden sm:inline">Close to WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#0a0a0a]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_user_message ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] md:max-w-[60%] p-3 rounded-xl text-sm break-words ${
                    msg.is_user_message 
                      ? 'bg-neutral-800 text-neutral-300 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendReply} className="p-3 md:p-4 border-t border-white/10 bg-black flex gap-2 md:gap-3">
              <input 
                className="flex-1 bg-neutral-900 border border-white/20 rounded-lg px-3 md:px-4 py-2 md:py-2.5 focus:outline-none focus:border-white text-white text-sm md:text-base"
                placeholder="Reply as Admin..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="p-2.5 md:p-3 bg-white text-black rounded-lg hover:bg-neutral-200 flex-shrink-0"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 px-4">
            <p className="text-center">Select a session to initiate protocol.</p>
            {/* Mobile: Show menu button when no session selected */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mt-4 md:hidden px-4 py-2 bg-white text-black rounded-lg font-medium"
              aria-label="View sessions"
            >
              View Sessions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}