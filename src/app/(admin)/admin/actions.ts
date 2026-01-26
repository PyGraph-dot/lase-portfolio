'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// 1. Create a "God Mode" client that bypasses Row Level Security (RLS)
// CRITICAL: Ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local and Vercel!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 2. Verify PIN and Set Session Cookie
export async function verifyAdminPin(submittedPin: string) {
  const CORRECT_PIN = process.env.ADMIN_PIN

  if (!CORRECT_PIN) {
    console.error("ADMIN_PIN is not set in environment variables!")
    return { success: false, error: 'Server Configuration Error' }
  }

  if (submittedPin === CORRECT_PIN) {
    // Set a secure, HTTP-Only cookie so the server remembers you are admin
    cookies().set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return { success: true }
  }

  return { success: false, error: 'Invalid PIN' }
}

// 3. Delete Messages (Requires Admin Cookie)
export async function deleteSessionMessages(sessionId: string) {
  // Security Check: Does the user have the admin cookie?
  const sessionCookie = cookies().get('admin_session')
  
  if (!sessionCookie || sessionCookie.value !== 'true') {
    return { success: false, error: 'Unauthorized: Admin session expired' }
  }

  try {
    // Use the Admin Client to delete rows (Bypasses RLS)
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('session_id', sessionId)
    
    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Delete error:', error)
    return { success: false, error: error.message || 'Failed to delete' }
  }
}