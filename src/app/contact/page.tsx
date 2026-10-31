'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Mail, Phone, Loader2, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { contactSchema } from '@/lib/schemas' 
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
  
  const interest = searchParams.get('interest')
  
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    message: interest
      ? `Hi Lase,\n\nI am interested in starting a project involving:\nâ€¢ ${interest.split(', ').join('\nâ€¢ ')}\n\nHere are some details about my timeline and budget:`
      : '',
    website: '',
  }))

  const openChat = () => {
    window.dispatchEvent(new Event('open-chat-widget'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setValidationError(null)

    // 1. Bot Protection (Honeypot)
    if (formData.website) {
      console.warn("Bot detecte¶»§q«^