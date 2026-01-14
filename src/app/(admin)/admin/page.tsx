'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Send, Phone, User, Monitor } from 'lucide-react'

type Message = {
  id: string
  text: string
  session_id: string
  is_user_message: boolean
  created_at?: string
}

export default function AdminDashboard() {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const [sessions, setSessions] = useState<string[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [presenceMap, setPresenceMap] = useState<Record<string, 'online' | 'offline'>>({})
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})
  const [pinInput, setPinInput] = useState('') // New state for input field

  // 3. Helper Functions
  async function loadMessages(id: string) {
    setActiveSession(id)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
    if (data) setMessages(data as Message[])
    // clear unread for this session when messages are loaded
    setUnreadMap((s) => ({ ...s, [id]: 0 }))
  }

  // 2. Fetch Sessions (Always runs, even if not logged in - efficient? no. safe? yes.)
  useEffect(() => {
    if (!isAuth) return // We just exit the EFFECT, not the COMPONENT

    const fetchSessions = async () => {
      const { data } = await supabase
        .from('messages')
        .select('session_id')
        .order('created_at', { ascending: false })
      
      if (data) {
        const unique = Array.from(new Set(data.map(item => item.session_id)))
        setSessions(unique as string[])
      }
    }
    fetchSessions()

    const channel = supabase.channel('admin_global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        fetchSessions()
        // reload messages for the active session if it matches
        if (activeSession) loadMessages(activeSession)

        try {
          const row = payload.new as any
          // If this is a user message, mark unread and notify the admin
          if (row.is_user_message) {
            const sid = row.session_id
            setUnreadMap((s) => ({ ...s, [sid]: (s[sid] ?? 0) + 1 }))
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('New user message', { body: String(row.text).slice(0, 120) })
              }
            }
          }
        } catch (e) {
          // ignore
        }
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [activeSession, isAuth]) // Added isAuth dependency

  // Request notification permission for admin when logged in
  useEffect(() => {
    if (!isAuth || typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      try { Notification.requestPermission().catch(() => {}) } catch (e) {}
    }
  }, [isAuth])

  // Presence listener (broadcast channel)
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

  // Announce admin presence so users can see if admin is available
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
    // Insert a structured action card so the user sees a clickable card in the chat
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

  const clearMessages = async () => {
    if (!activeSession) return
    const ok = confirm('Clear all messages for this session? This cannot be undone.')
    if (!ok) return
    try {
      // Debug: fetch rows that match this session first
      const { data: foundBefore, error: findErr } = await supabase
        .from('messages')
        .select('id, session_id')
        .eq('session_id', activeSession)

      console.log('Found before delete', { foundBefore, findErr })
      alert('Found before delete: ' + JSON.stringify({ foundBeforeLength: foundBefore?.length ?? 0, findErr }, null, 2))

      // Try delete with .match() (alternate API) and return deleted rows
      const { data: deleted, error } = await supabase
        .from('messages')
        .delete()
        .match({ session_id: activeSession })
        .select()

      console.log('Clear response', { deleted, error })
      alert('Clear response: ' + JSON.stringify({ deleted, error }, null, 2))
      if (error) return

      setMessages([])

      // Refresh sessions list from server to ensure UI matches DB
      const { data } = await supabase
        .from('messages')
        .select('session_id')
        .order('created_at', { ascending: false })
      if (data) {
        const unique = Array.from(new Set(data.map((item: any) => item.session_id)))
        setSessions(unique as string[])
      } else {
        setSessions([])
      }

      setActiveSession(null)
    } catch (err) {
      console.error(err)
      alert('Failed to clear messages')
    }
  }

  const deleteSession = async () => {
    if (!activeSession) return
    const ok = confirm('Delete this session entirely? This will remove all messages.')
    if (!ok) return
    try {
      // Debug: fetch rows that match this session first
      const { data: foundBefore, error: findErr } = await supabase
        .from('messages')
        .select('id, session_id')
        .eq('session_id', activeSession)

      console.log('Found before delete', { foundBefore, findErr })
      alert('Found before delete: ' + JSON.stringify({ foundBeforeLength: foundBefore?.length ?? 0, findErr }, null, 2))

      // Try delete using .match() to ensure exact match
      const { data: deleted, error } = await supabase
        .from('messages')
        .delete()
        .match({ session_id: activeSession })
        .select()

      console.log('Delete response', { deleted, error })
      alert('Delete response: ' + JSON.stringify({ deleted, error }, null, 2))
      if (error) return

      // Refresh sessions from the server to ensure consistency
      const { data } = await supabase
        .from('messages')
        .select('session_id')
        .order('created_at', { ascending: false })
      if (data) {
        const unique = Array.from(new Set(data.map((item: any) => item.session_id)))
        setSessions(unique as string[])
      } else {
        setSessions([])
      }

      setMessages([])
      setActiveSession(null)
    } catch (err) {
      console.error(err)
      alert('Failed to delete session')
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === '1234') setIsAuth(true)
  }

  // 4. THE RENDER LOGIC (This is where we swap screens)
  if (!isAuth) {
    return (
      <div className="h-screen bg-black flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <h1 className="text-white font-bold text-2xl tracking-tighter">LASE. <span className="text-neutral-500">ADMIN</span></h1>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Enter PIN"
              className="bg-neutral-900 text-white p-3 rounded-lg border border-white/20 focus:border-white focus:outline-none text-center w-64 block mx-auto"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
          </form>
        </div>
      </div>
    )
  }

  // 5. THE DASHBOARD (Only shown if isAuth is true)
  return (
    <div className="h-screen bg-black text-white flex font-sans">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 overflow-y-auto hidden md:block">
        <h2 className="font-bold mb-6 text-xl tracking-tighter">LASE. <span className="text-neutral-500 text-sm">CMD</span></h2>
        <div className="space-y-2">
          {sessions.map(id => (
            <button
              key={id}
              onClick={() => {
                loadMessages(id)
                // clear unread for this session when opened
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-green-500" />
                <span className="font-mono text-sm text-neutral-300">Session: {activeSession.substring(0,8)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copySessionId}
                  className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-md text-sm hover:bg-neutral-700"
                >
                  Copy ID
                </button>
                <button
                  onClick={exportMessages}
                  className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-md text-sm hover:bg-neutral-700"
                >
                  Export
                </button>
                <button
                  onClick={clearMessages}
                  className="px-3 py-1 bg-neutral-800 text-amber-400 rounded-md text-sm hover:bg-neutral-700"
                >
                  Clear
                </button>
                <button
                  onClick={deleteSession}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:brightness-90"
                >
                  Delete
                </button>
                <button 
                  onClick={triggerWhatsApp}
                  className="bg-[#25D366] text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-110"
                >
                  <Phone size={16} fill="black" /> Close to WhatsApp
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a0a0a]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_user_message ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[60%] p-3 rounded-xl text-sm ${
                    msg.is_user_message 
                      ? 'bg-neutral-800 text-neutral-300 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendReply} className="p-4 border-t border-white/10 bg-black flex gap-3">
              <input 
                className="flex-1 bg-neutral-900 border border-white/20 rounded-lg px-4 focus:outline-none focus:border-white text-white"
                placeholder="Reply as Admin..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" className="p-3 bg-white text-black rounded-lg hover:bg-neutral-200">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <p>Select a session to initiate protocol.</p>
          </div>
        )}
      </div>
    </div>
  )
}