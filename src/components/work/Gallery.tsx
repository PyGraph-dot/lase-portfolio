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

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  if (!images || images.length === 0) return null

  return (
    <>
      {/* THE GRID: Dense & Scannable */}
      <div className="mt-24">
        <h3 className="text-2xl font-bold mb-8 border-t border-white/10 pt-8 flex items-center gap-2">
          Visual Gallery <span className="text-neutral-500 text-sm font-normal">(Click to Expand)</span>
        </h3>
        
        {/* Logic: 
           - Mobile: columns-2 (Side by side, efficient) 
           - Tablet/Desktop: columns-3 (Not too big, easy to scan) 
           - gap-4: Tighter spacing for a "Collection" feel
        */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((image: GalleryImage, i: number) => {
            if (!image?.asset) return null
            const width = image.dims?.width || 800
            const height = image.dims?.height || 1000
            const imageUrl = urlFor(image).width(800).url()

            if (!imageUrl) return null

            return (
              <motion.div
                key={image._key || i}
                layoutId={`image-${image._key || i}`}
                onClick={() => setSelectedImage(image)}
                className="relative w-full bg-neutral-900 rounded-lg overflow-hidden border border-white/5 cursor-zoom-in break-inside-avoid group"
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10" />
                <Image
                  src={imageUrl}
                  alt={`Gallery image ${i + 1}`}
                  width={width}
                  height={height}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-20">
                   <div className="bg-black/50 p-1.5 rounded-full text-white backdrop-blur-md">
                     <ZoomIn size={14} />
                   </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* THE LIGHTBOX: Full Screen Focus */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          >
            {/* Close Button */}
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition">
              <X size={32} />
            </button>

            <motion.div
              layoutId={`image-${selectedImage._key || 'selected'}`} // Smooth morph animation
              className="relative w-auto h-auto max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} // Prevent closing if clicking the image itself
            >
              {selectedImage.asset && (
                <img
                  src={urlFor(selectedImage).width(1600).url()} // Load High-Res here
                  alt="Full view gallery image"
                  className="max-h-[90vh] w-auto object-contain"
                  loading="eager"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}