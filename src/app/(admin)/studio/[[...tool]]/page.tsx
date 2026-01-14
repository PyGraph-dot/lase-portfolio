'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config' 
// Tech Note: This looks up 7 levels. 
// If your IDE underlines this red, use the "@" trick below.

// ALTERNATIVE (Safest for Windows):
// If the import above fails, move 'sanity.config.ts' INTO 'src/' folder 
// and change the import to:
// import config from '@/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}