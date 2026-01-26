'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Mail, Phone, Loader2, CheckCircle, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { contactSchema } from '@/lib/schemas' // Make sure you created Step 1
import { z } from 'zod'

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}>
      <ContactContent />
    </Suspense>
  )
}

function ContactContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Auto-fill logic
  const interest = searchParams.get('interest')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '' // Honeypot field
  })

  // Effect to set initial message only once
  useEffect(() => {
    if (interest) {
      setFormData(prev => ({
        ...prev,
        message: `Hi Lase,\n\nI am interested in starting a project involving:\n• ${interest.split(', ').join('\n• ')}\n\nHere are some details about my timeline and budget:`
      }))
    }
  }, [interest])

  // Open Chat Logic
  const openChat = () => {
    // Dispatch a custom event to open the chat widget
    window.dispatchEvent(new Event('open-chat-widget'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setValidationError(null)

    // 1. Security Check: Honeypot
    if (formData.website) {
      setLoading(false)
      return // Silently fail for bots
    }

    // 2. Security Check: Zod Validation
    try {
      contactSchema.parse(formData)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationError(err.errors[0].message)
        setLoading(false)
        return
      }
    }

    // 3. Database Insertion
    const { error } = await supabase.from('inquiries').insert([{
      name: formData.name,
      email: formData.email,
      message: formData.message
    }])

    setLoading(false)
    if (error) {
      alert('Error sending message. Please try again.')
    } else {
      setSuccess(true)
      setFormData({ name: '', email: '', message: '', website: '' })
    }
  }

  return (
    <main className="pt-24 md:pt-32 pb-20 px-6 md:px-20 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        
        {/* Left Info */}
        <div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Let&apos;s build <br/> something <span className="text-[#00D4FF]">Great.</span>
          </h1>
          <p className="text-lg text-neutral-400 mb-12">
            Have a project in mind? Whether you need a full brand overhaul or a 
            high-speed website, I am ready to collaborate.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-lg md:text-xl text-neutral-300">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                <Phone className="text-white" size={20} />
              </div>
              <span className="break-all">+234 912 153 9519</span>
            </div>
            <div className="flex items-center gap-4 text-lg md:text-xl text-neutral-300">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                <Mail className="text-white" size={20} />
              </div>
              <span className="break-all">lase.branding@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-neutral-900/30 p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-center">
          
          {/* Success Overlay */}
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/95 z-20 text-center p-8"
            >
              <CheckCircle size={64} className="text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-neutral-400">I&apos;ll get back to you within 24 hours.</p>
              <button onClick={() => setSuccess(false)} className="mt-6 text-[#00D4FF] hover:underline">
                Send another message
              </button>
            </motion.div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-white">Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black border border-white/10 p-4 rounded-lg focus:border-[#00D4FF] focus:outline-none transition text-white placeholder-neutral-600" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-white">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black border border-white/10 p-4 rounded-lg focus:border-[#00D4FF] focus:outline-none transition text-white placeholder-neutral-600" 
                placeholder="john@example.com" 
              />
            </div>
            
            {/* Honeypot Field (Hidden) */}
            <input 
              type="text" 
              name="website" 
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="hidden" 
              autoComplete="off"
            />

            <div>
              <label className="block text-sm font-bold mb-2 text-white">Message</label>
              <textarea 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-black border border-white/10 p-4 rounded-lg h-32 focus:border-[#00D4FF] focus:outline-none transition text-white placeholder-neutral-600 resize-none" 
                placeholder="Tell me about your project..." 
              />
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <p className="text-red-500 text-sm font-medium">{validationError}</p>
            )}

            {/* THE CHAT STRATEGY SECTION */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              
              {/* The Nudge */}
              <div className="flex items-center justify-between text-xs md:text-sm text-neutral-500">
                <span>Typical email reply: 24 hours</span>
                <button 
                  type="button" 
                  onClick={openChat}
                  className="flex items-center gap-1 text-[#00D4FF] hover:underline transition group"
                >
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4FF]"></span>
                  </span>
                  Live Chat is faster →
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-[#00D4FF] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  )
}