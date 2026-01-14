// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import project from './lib/sanity/schemas/project'
import service from './lib/sanity/schemas/services'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  name: 'default',
  title: 'LASE Studio',
  projectId,
  dataset,
  basePath: '/studio', // This is where you will edit content
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [project, service],
  },
})