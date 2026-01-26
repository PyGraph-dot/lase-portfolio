// sanity.config.ts
import { defineConfig, isDev } from 'sanity' // Import 'isDev'
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
  basePath: '/studio',
  
  // LOGIC CHANGE: Only show Vision Tool if we are developing locally
  plugins: isDev 
    ? [structureTool(), visionTool()] 
    : [structureTool()],

  schema: {
    types: [project, service],
  },
})