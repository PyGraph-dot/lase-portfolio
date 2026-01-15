// src/lib/sanity/client.ts
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = '2024-01-10'
// Use CDN in production for better performance
const useCdn = process.env.NODE_ENV === 'production'

function assertProjectId(id?: string) {
  if (!id) {
    throw new Error(
      'Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Set it in .env.local (lowercase a-z, 0-9 and dashes).'
    )
  }
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SANITY_PROJECT_ID: "${id}". It must only contain lowercase a-z, numbers and dashes.`
    )
  }
}

function assertDataset(ds?: string) {
  if (!ds) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET. Set it in .env.local (e.g. "production").')
  }
  if (/\s/.test(ds)) {
    throw new Error(`Invalid NEXT_PUBLIC_SANITY_DATASET: "${ds}" (no spaces allowed).`)
  }
}

assertProjectId(projectId)
assertDataset(dataset)

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
})