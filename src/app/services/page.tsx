'use client'

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Plus, X, ArrowRight } from 'lucide-react'

// Define the Service Interface
interface Service {
  _id: string
  title: string
  category: string
  description: string
  features: string[]
  icon: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  } | null
}

const categories = [
  { id: 'all', label: 'All Expertise' },
  { id: 'design', label: 'Visual Design' },
  { id: 'dev', label: 'Development' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'growth', label: 'Growth & Maintenance' },
]

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  
  // NEW: Selection State
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const query = `*[_type == "service"] | order(title asc)`
    client.fetch(query).then((data) => {
      setServices(data)
      setLoading(false)
    })
  }, [])

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(s => s.category === filter)

  // Toggle Logic
  const toggleService = (title: string) => {
    if (selected.includes(title)) {
      setSelected(selected.filter(s => s !== title))
    } else {
      setSelected([...selected, title])
    }
  }

  // Go to Contact with Data
  const handleProceed = () => {
    const params = new URLSearchParams()
    params.set('interest', selected.join(', '))
    router.push(`/contact?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-32 px-4 md:px-20 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
          Build Your <span className="text-[#00D4FF]">Ecosystem.</span>
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
          Select the services you need below to construct a custom scope of work.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="w-full overflow-x-auto pb-6 mb-10 no-scrollbar">
        <div className="flex md:justify-center gap-2 min-w-max px-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                filter === cat.id ? 'text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {filter === cat.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The Interactive Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" /></div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredServices.map((service) => {
              const isSelected = selected.includes(service.title)
              
              return (
                <motion.div
                  layout
                  onClick={() => toggleService(service.title)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    borderColor: isSelected ? '#39FF14' : 'rgba(255,255,255,0.1)',
                    backgroundColor: isSelected ? 'rgba(57, 255, 20, 0.05)' : 'rgba(23, 23, 23, 0.4)'
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  key={service._id}
                  className="group relative cursor-pointer border p-8 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  {/* Selection Indicator */}
                  <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#39FF14] border-[#39FF14]' : 'border-white/20 bg-transparent'
                  }`}>
                    {isSelected ? <Check size={14} className="text-black" /> : <Plus size={14} className="text-white/50" />}
                  </div>

                  {/* Icon */}
                  <div className="relative w-12 h-12 mb-6 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    {service.icon ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <Image src={urlFor(service.icon as any).url()} alt={service.title} width={24} height={24} className="opacity-70 group-hover:opacity-100" />
                    ) : (
                      <div className="w-6 h-6 bg-white/20 rounded-full" />
                    )}
                  </div>

                  <h3 className={`text-xl font-bold mb-3 transition ${isSelected ? 'text-[#39FF14]' : 'text-white'}`}>
                    {service.title}
                  </h3>
                  
                  <p className="text-neutral-400 text-sm leading-relaxed mb-8 min-h-[60px]">
                    {service.description}
                  </p>

                  <ul className="space-y-3 border-t border-white/5 pt-6">
                    {service.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-neutral-300">
                        <Check size={14} className="text-[#39FF14]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* THE FLOATING DOCK (Mobile & Desktop) */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 w-full px-6 flex justify-center z-30 pointer-events-none"
          >
            <div className="bg-[#121212] border border-[#39FF14]/30 shadow-[0_0_40px_rgba(57,255,20,0.1)] rounded-full px-6 py-4 flex items-center gap-6 pointer-events-auto">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 font-mono uppercase tracking-widest">Package</span>
                <span className="text-white font-bold">{selected.length} Selected</span>
              </div>
              
              <button 
                onClick={() => setSelected([])}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition text-neutral-400"
              >
                <X size={14} />
              </button>

              <button 
                onClick={handleProceed}
                className="bg-[#39FF14] text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-white transition flex items-center gap-2"
              >
                Start Project <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}