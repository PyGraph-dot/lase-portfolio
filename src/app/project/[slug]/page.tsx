/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Quote, Zap, Layers, RefreshCw } from 'lucide-react'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import Gallery from '@/components/work/Gallery' 

// --- THE QUERY ---
const query = `
  *[_type == "project" && slug.current == $slug][0] {
    title, tagline, category, primaryColor, 
    mainImage { asset, "dims": asset->metadata.dimensions },
    "slug": slug.current, scope, 
    
    // Custom Fields
    problemStatement, beforeImage, challengePivot, techStack, testimonial,
    
    // Social Media Array
    socials[] { _key, asset, "dims": asset->metadata.dimensions },
    
    description,
    
    // Standard Gallery Array
    gallery[] { _key, asset, "dims": asset->metadata.dimensions }
  }
`

type ProjectRouteProps = { params: Promise<{ slug: string }> }

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value || !value.asset) return null
      return (
        <div className="my-12 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
           <Image
            src={urlFor(value).width(1400).fit('max').auto('format').url()}
            alt="Case Study Detail"
            width={1400}
            height={1000}
            sizes="(max-widt¶»§q«^