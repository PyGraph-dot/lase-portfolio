import { clientNoCdn } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/types'
import WorkClient from './WorkClient'

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

// Revalidate every 60 seconds to get fresh data
export const revalidate = 60

export default async function WorkPage() {
  let projects: Project[] = []
  
  try {
    // Use clientNoCdn to bypass CDN cache and get fresh data
    projects = await clientNoCdn.fetch<Project[]>(query) || []
  } catch (error) {
    console.error('Error fetching projects:', error)
    projects = []
  }

  return <WorkClient initialProjects={projects} />
}
