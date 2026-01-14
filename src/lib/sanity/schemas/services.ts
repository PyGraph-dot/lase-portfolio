import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Services',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Service Name',
      type: 'string', // e.g. "Brand Identity System"
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Visual Design', value: 'design' },
          { title: 'Development', value: 'dev' },
          { title: 'Strategy & Marketing', value: 'strategy' },
          { title: 'Growth & Maintenance', value: 'growth' },
        ],
        layout: 'radio'
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'features',
      title: 'Deliverables List',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. Logo Suite, Typography, Color Palette',
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'icon',
      title: 'Icon / Symbol',
      type: 'image',
      description: 'Upload a small white icon or symbol for this service.'
    }),
  ],
})