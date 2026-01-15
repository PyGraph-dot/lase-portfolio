import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const imageBuilder = imageUrlBuilder(client)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const urlFor = (source: { asset: { _ref: string } }) => {
  return imageBuilder.image(source).auto('format').fit('max')
}