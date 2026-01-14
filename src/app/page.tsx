import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import Link from 'next/link'
import Image from 'next/image'
import Marquee from '@/components/ui/Marquee'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

// Fetch the SINGLE best project
const spotlightQuery = `*[_type == "project"] | order(_createdAt desc)[0] {
  title,
  "slug": slug.current,
  category,
  tagline,
  mainImage
}`

export const revalidate = 60

export default async function Home() {
  const project = await client.fetch(spotlightQuery)

  return (
    <main className="bg-[#050505] min-h-screen text-white selection:bg-[#00D4FF] selection:text-black overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-4 md:px-20 pt-20 overflow-hidden">
        
        {/* Background Glow (Toned down for mobile performance) */}
        <div className="absolute top-[-10%] right-[-10%] w-[75px] md:w-[200px] h-[75px] md:h-[200px] bg-[#5F192D] rounded-full blur-[120px] md:blur-[180px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[75px] md:w-[150px] h-[75px] md:h-[150px] bg-[#00D4FF] rounded-full blur-[100px] md:blur-[150px] opacity-10 pointer-events-none" />

        <div className="z-10 max-w-5xl">
          <p className="text-[#00D4FF] font-mono mb-4 md:mb-6 tracking-widest uppercase text-xs md:text-sm animate-fade-in">
            ● Available for new projects
          </p>
          <h1 className="text-5xl md:text-[9rem] leading-[0.95] md:leading-[0.9] font-bold tracking-tighter mb-6 md:mb-8">
            DIGITAL <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
              ARCHITECT.
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-neutral-400 max-w-xl md:max-w-2xl leading-relaxed mb-8 md:mb-12">
            I don&apos;t just build websites. I engineer <span className="text-white">Digital Empires</span>. 
            Merging precision Brand Identity with high-performance Web Development.
          </p>
          
          {/* Mobile: Stacked Buttons (Full Width) | Desktop: Row */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <Link 
              href="/work" 
              className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#00D4FF] transition-all duration-300 w-full md:w-auto"
            >
              View Selected Works
              <ArrowRight className="group-hover:translate-x-1 transition" />
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-4 rounded-full font-bold text-lg border border-white/20 hover:bg-white/5 transition w-full md:w-auto text-center"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <Marquee />

      {/* 3. FEATURED SPOTLIGHT */}
      {project && (
        <section className="py-20 md:py-32 px-4 md:px-20">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 md:mb-12">
            <div>
              <h2 className="text-xs md:text-sm font-mono text-neutral-500 mb-2 uppercase tracking-widest">Latest Case Study</h2>
              <p className="text-3xl md:text-5xl font-bold">Featured Project</p>
            </div>
            <Link href="/work" className="hidden md:flex items-center gap-2 text-[#00D4FF] hover:text-white transition mt-4 md:mt-0">
              See all projects <ArrowRight size={18} />
            </Link>
          </div>

          <Link href={`/project/${project.slug}`} className="group block relative w-full aspect-[4/5] md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10">
            {/* Overlay Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 flex flex-col justify-end p-6 md:p-16 transition duration-500">
              <span className="text-[#00D4FF] font-mono text-xs md:text-sm uppercase tracking-widest mb-2">
                {project.category}
              </span>
              <h3 className="text-3xl md:text-6xl font-bold tracking-tighter mb-2 md:mb-4">{project.title}</h3>
              <p className="text-sm md:text-lg text-neutral-300 max-w-xl line-clamp-2 md:line-clamp-none">{project.tagline}</p>
              
              <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-white text-black w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center rotate-45 md:group-hover:rotate-0 transition duration-500">
                <ArrowUpRight size={20} className="md:w-8 md:h-8" />
              </div>
            </div>

            {/* The Image */}
            {project.mainImage && (
              <Image
                src={urlFor(project.mainImage).width(1600).url()}
                alt={project.title}
                fill
                className="object-cover transition duration-1000 group-hover:scale-105"
              />
            )}
          </Link>
          
          <div className="mt-6 md:hidden flex justify-center">
            <Link href="/work" className="flex items-center gap-2 text-white border-b border-white pb-1 text-sm">
              See all projects <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* 4. SERVICES TEASER */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-20 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { num: '01', title: 'Brand Identity', desc: 'Logos, Typography, Color Psychology' },
            { num: '02', title: 'Web Development', desc: 'Next.js, High Performance, SEO' },
            { num: '03', title: 'Art Direction', desc: 'Visual Strategy, Campaigns, Rollouts' }
          ].map((s) => (
            <Link href="/services" key={s.num} className="group p-8 md:p-12 hover:bg-neutral-900/30 transition block active:bg-neutral-800">
              <span className="text-xs font-mono text-neutral-600 mb-4 md:mb-6 block">{s.num}</span>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-[#00D4FF] transition">{s.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. GIANT CTA FOOTER */}
      <section className="py-24 md:py-40 px-6 text-center bg-[#0a0a0a]">
        <h2 className="text-4xl md:text-8xl font-bold tracking-tighter mb-8">
          Have an idea?
        </h2>
        <Link 
          href="/contact"
          className="inline-block text-xl md:text-4xl border-b-2 border-[#00D4FF] pb-2 hover:text-[#00D4FF] hover:border-white transition"
        >
          Let&apos;s build it together.
        </Link>
      </section>

    </main>
  )
}