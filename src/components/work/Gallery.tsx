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
        
        {/* THE FIX:
            - 'grid-cols-2': Default (Mobile) is now 2 columns.
            - 'md:grid-cols-3': Desktop stays 3 columns.
            - 'gap-3': Tighter gap on mobile so images are larger.
            - 'md:gap-6': Wider gap on desktop for breathing room.
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {images.map((image: GalleryImage, i: number) => {
            if (!image?.asset) return null
            const imageUrl = urlFor(image).width(800).url()

            if (!imageUrl) return null

            return (
              <motion.div
                key={image._key || i}
                layoutId={`image-${image._key || i}`}
                onClick={() => setSelectedImage(image)}
                className="relative aspect-square w-full bg-neutral-900 rounded-lg md:rounded-xl overflow-hidden border border-white/5 cursor-zoom-in group"
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors z-10 duration-500" />
                
                <Image
                  src={imageUrl}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                
                {/* Zoom Icon (Hidden on mobile to keep view clean, visible on desktop hover) */}
                <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-300 z-20">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/20 flex items-center gap-2">
                      <ZoomIn size={16} /> <span className="text-xs font-mono uppercase tracking-widest">View</span>
                    </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition bg-white/10 p-3 rounded-full z-50">
              <X size={24} />
            </button>

            <motion.div
              layoutId={`image-${selectedImage._key || 'selected'}`} 
              className="relative w-full max-w-6xl max-h-screen"
              onClick={(e) => e.stopPropagation()} 
            >
              {selectedImage.asset && (
                <img
                  src={urlFor(selectedImage).width(1600).url()} 
                  alt="Full view"
                  className="w-full h-auto max-h-[85vh] object-contain mx-auto rounded-md shadow-2xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}