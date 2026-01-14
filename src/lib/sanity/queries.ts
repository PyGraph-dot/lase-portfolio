// src/lib/sanity/queries.ts
import { groq } from 'next-sanity'

export const projectsQuery = groq`
  *[_type == "project"] {
    _id,
    title,
    "slug": slug.current,
    tagline,
    primaryColor,
    mainImage
  }
`