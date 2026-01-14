import Image from 'next/image'
import { Download, ChevronRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="pt-24 md:pt-32 pb-20 px-6 md:px-20 max-w-7xl mx-auto">
      
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 md:mb-32">
        <div className="order-2 md:order-1"> {/* Photo on top on mobile? No, text first is usually better for SEO, but visual hierarchy might prefer photo. Let's keep text first. */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            More than just <br/>
            <span className="text-[#00D4FF]">Pixels.</span>
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed mb-8">
            I am Toluwalase Samuel Adedeji, a Digital Architect based in Lagos. 
            I bridge the gap between creative Brand Identity and functional Web Development.
          </p>
          <p className="text-lg text-neutral-400 leading-relaxed mb-8">
            While most designers stop at the logo, and developers stop at the code, 
            I build the entire ecosystem. From the first sketch on paper to the final 
            deployment on the server, I ensure your brand remains consistent, fast, and scalable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/resume.pdf" 
              download
              className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-[#00D4FF] hover:text-black transition group"
            >
              <Download size={18} /> Download CV
            </a>
            <a 
              href="/contact"
              className="flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition"
            >
              Start a Project <ChevronRight size={18} />
            </a>
          </div>
        </div>

        {/* Photo Frame */}
        <div className="order-1 md:order-2 relative aspect-square max-w-sm md:max-w-md mx-auto md:mr-0 w-full">
          <div className="absolute inset-0 bg-[#00D4FF] rounded-2xl rotate-6 opacity-20 blur-lg"></div>
          <div className="relative h-full w-full bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 md:rotate-3 md:hover:rotate-0 transition duration-500">
            <Image 
              src="/profile.jpg" 
              alt="Toluwalase Samuel Adedeji"
              fill
              className="object-cover md:grayscale md:hover:grayscale-0 transition duration-700"
            />
          </div>
        </div>
      </div>

      {/* Responsive Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-y border-white/10 py-12 mb-32">
        {[
          { label: 'Years Experience', value: '4+' },
          { label: 'Projects Completed', value: '30+' },
          { label: 'Happy Clients', value: '100%' },
          { label: 'Stack Depth', value: 'Full' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-xs md:text-sm text-neutral-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

    </main>
  )
}