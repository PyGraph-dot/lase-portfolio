'use client'

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowUpRight } from 'lucide-react'

export default function WorkPage() {

  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = `
      *[_type == "project"] | order(_createdAt desc) {
        _id,
        title,
        "slug": slug.current,
        category,
        primaryColor,
        mainImage,
        tagline
      }
    `
    client.fetch(query).then((data) => {
      setProjects(data || [])
      setLoading(false)
    }).catch((error) => {
      console.error('Error fetching projects:', error)
      setProjects([])
      setLoading(false)
    })
  }, [])

  const filteredProjects = filter === 'All' ? projects : projects.filter((p) => p.category === filter)

  const categories: string[] = ['All', ...Array.from(new Set(projects.map(p => p.category))).filter(Boolean) as string[]]

  return (
    <main className="pt-24 md:pt-32 pb-20 px-4 md:px-20 max-w-7xl mx-auto min-h-screen bg-[#050505]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-20">
        <div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-4">
            Selected <span className="text-[#00D4FF]">Works.</span>
          </h1>
          <p className="text-neutral-400 max-w-md text-lg">
            A curation of digital products and visual systems engineered for impact.
          </p>
        </div>

        {/* MOBILE-FIRST FILTER BAR (Horizontal Scroll) */}
        <div className="w-full md:w-auto overflow-x-auto pb-4 md:pb-0 no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border whitespace-nowrap ${
                  filter === cat 
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'bg-transparent text-neutral-500 border-neutral-800 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The Grid */}
      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="animate-spin text-neutral-500" />
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 md:gap-y-16">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={project._id}
              >
                <Link href={`/project/${project.slug}`} className="group block">
                  
                  {/* Image Card */}
                  <div className="relative aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 mb-6">
                    {/* Desktop Hover Glow (Disabled on touch to prevent sticky hover) */}
                    <div 
                      className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-30 transition duration-700 z-10 mix-blend-overlay pointer-events-none"
                      style={{ backgroundColor: project.primaryColor || '#333' }}
                    />
                    
                    {/* Arrow Icon */}
                    <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md p-2 rounded-full 
                                    opacity-100 md:opacity-0 md:group-hover:opacity-100 
                                    md:-translate-y-2 md:group-hover:translate-y-0 transition duration-300">
                      <ArrowUpRight className="text-white" size={20} />
                    </div>

                    {project.mainImage ? (
                      <Image
                        src={urlFor(project.mainImage).width(1000).url()}
                        alt={project.title ?? 'Project image'}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700">No Image</div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#00D4FF] transition duration-300">
                        {project.title}
                      </h3>
                      <p className="text-neutral-500 mt-1 line-clamp-1">
                        {project.tagline || 'Case Study'}
                      </p>
                    </div>
                    
                    <span className="text-xs font-mono border border-white/10 px-2 py-1 rounded text-neutral-400 uppercase tracking-widest mt-1">
                      {project.category}
                    </span>
                  </div>

                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="py-20 text-center text-neutral-500">
          <p>No projects found in this category.</p>
        </div>
      )}

    </main>
  )
}