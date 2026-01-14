import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function assertSupabaseUrl(url?: string) {
	if (!url) {
		throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local (must start with http:// or https://).')
	}
	if (!/^https?:\/\//i.test(url)) {
		throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${url}". Must be a valid HTTP/HTTPS URL.`)
	}
}

function assertSupabaseKey(key?: string) {
	if (!key) {
		throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in .env.local.')
	}
}

assertSupabaseUrl(supabaseUrl)
assertSupabaseKey(supabaseAnonKey)

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)