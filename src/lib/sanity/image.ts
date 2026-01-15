import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const imageBuilder = imageUrlBuilder(client)

// More flexible type to handle different Sanity image structures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const urlFor = (source: any) => {
  if (!source || !source.asset) {
    console.warn('urlFor: Invalid image source', source)
    return imageBuilder.image('').auto('format').fit('max')
  }
  return imageBuilder.image(source).auto('format').fit('max')
}
