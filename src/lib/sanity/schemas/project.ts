import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Portfolio Projects',
  type: 'document',
  fields: [
    // --- BASIC INFO ---
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Brand Identity', value: 'Brand Identity' },
          { title: 'Flyer/Poster', value: 'Flyer' },
          { title: 'Web Development', value: 'Web Dev' },
        ],
        layout: 'radio'
      },
    }),
    defineField({
      name: 'scope',
      title: 'Scope of Work',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'tagline',
      title: 'One-Line Pitch',
      type: 'string',
    }),
    defineField({
        name: 'primaryColor',
        title: 'Brand Hex Color',
        type: 'string',
    }),
    defineField({
        name: 'mainImage',
        title: 'Cover Image (Hero)',
        type: 'image',
        options: { hotspot: true },
    }),

    // --- CONVERSION LAYER 1: THE TRANSFORMATION (Before/After) ---
    defineField({
        name: 'problemStatement',
        title: 'The "Before" State (Problem)',
        description: 'Describe the chaos or lack of identity before you stepped in.',
        type: 'text',
        rows: 3,
    }),
    defineField({
        name: 'beforeImage',
        title: 'The "Before" Image (Old Logo/Screenshot)',
        type: 'image',
    }),

    // --- CONVERSION LAYER 2: THE STRATEGIC PIVOT ---
    defineField({
        name: 'challengePivot',
        title: 'The Strategic Pivot',
        description: 'What went wrong? What was the hard decision? (The "Aha" moment)',
        type: 'text',
        rows: 4,
    }),

    // --- MAIN NARRATIVE ---
    defineField({
      name: 'description',
      title: 'Case Study Narrative',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } }
      ] 
    }),

    // --- CONVERSION LAYER 3: TECHNICAL EDGE (SEO/WEB) ---
    defineField({
        name: 'techStack',
        title: 'Technical/SEO Impact',
        description: 'How did this help their SEO, Load Speed, or Scalability?',
        type: 'text',
        rows: 3,
    }),

    // --- CONVERSION LAYER 4: SOCIAL MEDIA CAMPAIGN (NEW!) ---
    defineField({
        name: 'socials',
        title: 'Social Media Campaign',
        description: 'Upload square/portrait flyers here for the Social Grid display.',
        type: 'array',
        of: [{ type: 'image' }],
        options: { layout: 'grid' }
    }),

    // --- CONVERSION LAYER 5: THE VERDICT ---
    defineField({
        name: 'testimonial',
        title: 'Client Testimonial',
        type: 'object',
        fields: [
            {name: 'quote', type: 'text', title: 'Quote'},
            {name: 'author', type: 'string', title: 'Author Name'},
            {name: 'role', type: 'string', title: 'Role/Title'},
        ]
    }),

    // --- EXTRAS ---
    defineField({
      name: 'gallery',
      title: 'Project Gallery (Extras)',
      type: 'array',
      of: [{ type: 'image' }],
    }),
  ],
})