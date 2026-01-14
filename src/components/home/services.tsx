'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'

const services = [
  {
    title: 'Flyer Design',
    price: '₦15,000',
    description: 'High-conversion visuals for events and promos.',
    features: ['24h Turnaround', 'Social Media Resizing', '3 Revisions', 'High-Res Export'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Brand Identity',
    price: '₦50,000',
    description: 'Complete visual systems for serious businesses.',
    features: ['Logo Design Suite', 'Color & Typography', 'Brand Guidelines (PDF)', '3D Mockups (Signage/Bag)', 'Social Media Kit'],
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    title: 'Web Development',
    price: '₦150,000',
    description: 'Modern, fast websites that drive sales.',
    features: ['Next.js Architecture', 'SEO Optimization', 'Mobile Responsive', 'CMS Integration', '1 Month Support'],
    color: 'from-orange-500 to-red-500'
  }
]

export default function Services() {
  return (
    <section className="py-32 px-6 md:px-20 border-t border-white/10">
      <div className="mb-16">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Services.</h2>
        <p className="text-neutral-400 max-w-xl">
          Transparent pricing. Professional execution. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-2xl border ${service.popular ? 'border-white/20 bg-white/5' : 'border-white/5 bg-neutral-900/50'} group hover:border-white/30 transition duration-500`}
          >
            {/* Gradient Glow on Hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 rounded-2xl bg-gradient-to-br ${service.color} transition duration-500`} />

            {service.popular && (
              <span className="absolute top-0 right-0 m-4 px-3 py-1 text-xs font-bold bg-white text-black rounded-full">
                POPULAR
              </span>
            )}

            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
            <div className="text-3xl font-bold mb-4 text-white">
              {service.price} <span className="text-sm font-normal text-neutral-500">/ project</span>
            </div>
            <p className="text-neutral-400 text-sm mb-8 h-10">{service.description}</p>

            <ul className="space-y-4 mb-8">
              {service.features.map((feature, f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check size={16} className="text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className="w-full py-3 rounded-lg border border-white/20 hover:bg-white hover:text-black transition font-medium flex items-center justify-center gap-2 group-hover:gap-3">
              Book Now <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}