'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import { urlFor } from '@/lib/sanity/image'

interface GalleryImage {
  _key: string;
  asset: any;
  dims?: {
    width: number;
    height: number;
  };
}

interface GalleryProps {
    images: GalleryImage[];
    title?: string; 
}

export default function Gallery({ images, title = "Visual Gallery" }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="mt-12 mb-24">
        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 border-b border-white/10 pb-4 flex items-center gap-2 text-white">
          {title} <span className="text-neutral-500 text-xs md:text-sm font-normal hidden md:inline-block">(Click to Expand)</span>
        </h3>
        
        {/* THE MASONRY FIX:
            - 'columns-2': Creates 2 vertical streams on mobile (Pinterest style).
            - 'md:columns-3': 3 streams on desktop.
            - 'gap-4': Spacing between columns.
            - 'space-y-4': Fallback spacing.
        */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((image: GalleryImage, i: number) => {
            if (!image?.asset) return null
            con¶»§q«^