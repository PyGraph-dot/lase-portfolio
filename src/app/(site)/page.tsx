import { client } from '@/lib/sanity/client'
import { projectsQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import Image from 'next/image'
import Link from 'next/link'

// This makes the page static for speed, but revalidates every 60s
export const revalidate = 60 

interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

interface Project {
  _id: string
  title: string
  slug: string
  tagline: string
  primaryColor: string
  mainImage: SanityImage | null
}

export default async function Home() {
  // 1. Fetch data directly on the server
  const projects: Project[] = await client.fetch(projectsQuery)

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
      
      {/* Hero Section */}
      <section className="h-[40vh] flex flex-col justify-center px-6 md:px-20">
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
          LASE.
        </h1>
        <p className="text-neutral-400 mt-4 text-xl font-light">
          Digital Architect. <span className="text-white">Precision Identity.</span>
        </p>
      </section>

      {/* Projects Grid */}
      <section className="px-6 md:px-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project) => (
            <Link 
              key={project._id} 
              href={`/project/${project.slug}`}
              className="group relative block"
            >
              {/* THE NEON GLOW LOGIC - inline style required for dynamic color */}
              <div 
                className="absolute -inset-1 rounded-2xl opacity-25 group-hover:opacity-100 transition duration-500 blur-lg"
                style={{ backgroundColor: project.primaryColor || '#333' }}
              ></div>

              {/* Card Content */}
              <div className="relative aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden border border-white/10">
                {project.mainImage && (
                  <Image
                    src={urlFor(project.mainImage).width(800).url()}
                    alt={project.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105" 
                  />
                )}
                
                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                  <p className="text-sm text-neutral-300 mt-1">{project.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}