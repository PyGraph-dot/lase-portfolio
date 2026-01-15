/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import Gallery from '@/components/work/Gallery' // <--- IMPORT THE NEW COMPONENT

const query = `
  *[_type == "project" && slug.current == $slug][0] {
    title,
    tagline,
    category,
    primaryColor,
    mainImage {
      asset,
      "dims": asset->metadata.dimensions
    },
    "slug": slug.current,
    scope,
    description,
    gallery[] {
      _key,
      asset,
      "dims": asset->metadata.dimensions
    }
  }
`

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      return (
        <div className="my-12 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
           <img
            src={urlFor(value).width(1400).fit('max').auto('format').url()}
            alt="Case Study Detail"
            className="w-full h-auto block" 
            loading="lazy"
          />
        </div>
      )
    },
  },
  block: {
    h2: ({ children }: any) => <h2 className="text-3xl md:text-4xl font-bold text-white mt-16 mb-6 tracking-tight">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl md:text-2xl font-bold text-[#00D4FF] mt-10 mb-4">{children}</h3>,
    normal: ({ children }: any) => <p className="text-lg text-neutral-300 leading-relaxed mb-6">{children}</p>,
  }
}

export async function generateMetadata({ params }: { params: any }) {
  const { slug } = await params
  return { title: `LASE | ${slug}` }
}

export default async function ProjectPage({ params }: { params: any }) {
  const { slug } = await params
  let project = null
  try {
    project = await client.fetch(query, { slug })
  } catch (error) {
    console.error('Error fetching project:', error)
    return notFound()
  }

  if (!project) return notFound()

  // Web Project Logic (for Hero Image)
  const isWebProject = project.category?.toLowerCase().includes('web') || project.title?.toLowerCase().includes('graphics');

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#5F192D] selection:text-white">
      
      <div 
        className="fixed top-0 left-0 w-full h-[60vh] opacity-15 blur-[150px] pointer-events-none z-0"
        style={{ background: `radial-gradient(circle at 50% 0%, ${project.primaryColor || '#333'}, transparent)` }}
      />

      <div className="relative z-10 px-4 md:px-20 pt-24 pb-20">
        
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
          Back to Works
        </Link>

        {/* Header */}
        <div className="max-w-4xl mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-6">
             <span className="px-3 py-1 border border-[#00D4FF] text-[#00D4FF] text-xs font-mono uppercase tracking-widest rounded-full">
               {project.category || 'Case Study'}
             </span>
             {project.scope?.map((item: string) => (
                <span key={item} className="text-neutral-500 text-xs uppercase tracking-widest border border-white/10 px-2 py-1 rounded-full">
                  {item}
                </span>
             ))}
          </div>
          <h1 className="text-5xl md:text-8xl font-bold leading-none tracking-tighter mb-6">
            {project.title}.
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl">
            {project.tagline}
          </p>
        </div>

        {/* Hero Image */}
        {project.mainImage && (
          <div className="mb-24">
            {project.mainImage.dims && project.mainImage.dims.height > project.mainImage.dims.width && !isWebProject ? (
              // Portrait Mode
              <div className="relative w-full h-[85vh] bg-neutral-900/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex justify-center">
                 <div className="absolute inset-0 opacity-30 blur-3xl scale-110">
                    <Image src={urlFor(project.mainImage).url()} alt="" fill className="object-cover" />
                 </div>
                 <Image
                  src={urlFor(project.mainImage).width(1600).url()}
                  alt={project.title}
                  width={project.mainImage.dims.width}
                  height={project.mainImage.dims.height}
                  className="relative h-full w-auto object-contain z-10 py-4"
                  priority
                />
              </div>
            ) : (
              // Landscape Mode
              <div className="relative w-full aspect-video md:aspect-[21/9] bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <Image
                  src={urlFor(project.mainImage).width(1920).url()}
                  alt={project.title}
                  fill
                  className="object-cover object-top transition-transform duration-[3s] ease-in-out group-hover:scale-105"
                  priority
                />
                {isWebProject && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white/70 border border-white/10 pointer-events-none">
                    Desktop View
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Narrative Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-12 md:px-10 lg:px-20">
             {project.description ? (
                <div className="max-w-4xl mx-auto">
                   <PortableText value={project.description} components={portableTextComponents} />
                </div>
             ) : (
                <p className="text-center text-neutral-500">The story is being written...</p>
             )}
          </div>
        </div>

        {/* 6. NEW: INTERACTIVE GALLERY COMPONENT */}
        <Gallery images={project.gallery} />

      </div>
    </main>
  )
}