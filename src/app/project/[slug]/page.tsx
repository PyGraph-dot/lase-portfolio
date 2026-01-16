/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Quote, Zap, Layers, RefreshCw } from 'lucide-react'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import Gallery from '@/components/work/Gallery' 

// --- THE QUERY ---
const query = `
  *[_type == "project" && slug.current == $slug][0] {
    title, tagline, category, primaryColor, 
    mainImage { asset, "dims": asset->metadata.dimensions },
    "slug": slug.current, scope, 
    
    // Custom Fields
    problemStatement, beforeImage, challengePivot, techStack, testimonial,
    
    // Social Media Array
    socials[] { _key, asset, "dims": asset->metadata.dimensions },
    
    description,
    
    // Standard Gallery Array
    gallery[] { _key, asset, "dims": asset->metadata.dimensions }
  }
`

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value || !value.asset) return null
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
  if (['studio', 'admin', 'api'].includes(slug?.toLowerCase())) return notFound()
  
  // Fetch with no-store to see updates instantly during dev
  const project = await client.fetch(query, { slug }, { next: { revalidate: 0 } })
  
  if (!project) return notFound()

  const isWebProject = project.category?.toLowerCase().includes('web') || project.title?.toLowerCase().includes('graphics');

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#5F192D] selection:text-white">
      
      {/* Dynamic Background Glow */}
      <div 
        className="fixed top-0 left-0 w-full h-[60vh] opacity-15 blur-[150px] pointer-events-none z-0"
        style={{ background: `radial-gradient(circle at 50% 0%, ${project.primaryColor || '#333'}, transparent)` }}
      />

      <div className="relative z-10 px-4 md:px-20 pt-24 pb-20">
         
         <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
          Back to Works
        </Link>

        {/* HEADER SECTION */}
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
            {project.title}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl">
            {project.tagline}
          </p>
        </div>

        {/* HERO IMAGE */}
        {project.mainImage && (
          <div className="mb-24">
            {project.mainImage.dims && project.mainImage.dims.height > project.mainImage.dims.width && !isWebProject ? (
              <div className="relative w-full h-[85vh] bg-neutral-900/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex justify-center">
                 <div className="absolute inset-0 opacity-30 blur-3xl scale-110">
                    <Image src={urlFor(project.mainImage).url()} alt="" fill className="object-cover" />
                 </div>
                 <Image
                  src={urlFor(project.mainImage).width(1600).url()}
                  alt={project.title || 'Project image'}
                  width={project.mainImage.dims.width}
                  height={project.mainImage.dims.height}
                  className="relative h-full w-auto object-contain z-10 py-4"
                  priority
                />
              </div>
            ) : (
              <div className="relative w-full aspect-video md:aspect-[21/9] bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <Image
                  src={urlFor(project.mainImage).width(1920).url()}
                  alt={project.title || 'Project image'}
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            )}
          </div>
        )}

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1400px] mx-auto mb-24">
          
          {/* LEFT RAIL */}
          <div className="lg:col-span-4 space-y-12">
            {(project.problemStatement || project.beforeImage) && (
              <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-xl backdrop-blur-sm">
                 <div className="flex items-center gap-3 mb-4 text-neutral-500">
                    <RefreshCw size={18} />
                    <span className="text-xs font-mono uppercase tracking-widest">The Transformation</span>
                 </div>
                 {project.beforeImage && (
                    <div className="w-full h-32 relative mb-6 rounded-lg overflow-hidden opacity-60 grayscale hover:grayscale-0 transition duration-500">
                        <Image src={urlFor(project.beforeImage).url()} alt="Before" fill className="object-cover" />
                    </div>
                 )}
                 <p className="text-neutral-400 text-sm leading-relaxed">{project.problemStatement}</p>
              </div>
            )}

            {project.techStack && (
               <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 p-8 rounded-xl">
                  <div className="flex items-center gap-3 mb-4 text-[#00D4FF]">
                    <Zap size={18} />
                    <span className="text-xs font-mono uppercase tracking-widest">Technical Edge</span>
                 </div>
                 <p className="text-[#00D4FF]/80 text-sm font-mono leading-relaxed">{project.techStack}</p>
               </div>
            )}
          </div>

          {/* RIGHT RAIL */}
          <div className="lg:col-span-8">
            {project.challengePivot && (
                <div className="mb-12 pl-6 border-l-4 border-yellow-500/80">
                    <h3 className="text-yellow-500 font-bold text-lg mb-2 flex items-center gap-2">
                        <Layers size={20} /> The Strategic Pivot
                    </h3>
                    <p className="text-xl md:text-2xl text-white font-light italic leading-relaxed">
                        &quot;{project.challengePivot}&quot;
                    </p>
                </div>
            )}
            {project.description && (
                <div className="prose prose-invert max-w-none">
                   <PortableText value={project.description} components={portableTextComponents} />
                </div>
             )}
          </div>
        </div>

        {/* --- SOCIAL MEDIA CAMPAIGN (Reusing Gallery Component) --- */}
        {project.socials && project.socials.length > 0 && (
          <div className="max-w-[1400px] mx-auto">
             <Gallery images={project.socials} title="Campaign Rollout" />
          </div>
        )}

        {/* TESTIMONIAL */}
        {project.testimonial && (
            <div className="mt-24 max-w-4xl mx-auto text-center mb-24">
                <Quote size={40} className="mx-auto text-neutral-600 mb-8" />
                <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-8">
                    &quot;{project.testimonial.quote}&quot;
                </h2>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-bold text-white">{project.testimonial.author}</span>
                    <span className="text-sm text-[#00D4FF] uppercase tracking-widest">{project.testimonial.role}</span>
                </div>
            </div>
        )}

        {/* STANDARD VISUAL GALLERY */}
        {project.gallery && project.gallery.length > 0 && (
          <Gallery images={project.gallery} title="Visual Gallery" />
        )}

      </div>
    </main>
  )
}