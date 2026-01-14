export interface Project {
  _id?: string
  title?: string
  slug?: string
  category?: string
  primaryColor?: string
  mainImage?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  } | null
  tagline?: string
}
