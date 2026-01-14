import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Portfolio Projects',
  type: 'document',
  fields: [
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
    // THE UPGRADE: Allowing Images INSIDE the text
    defineField({
      name: 'description',
      title: 'Case Study Narrative',
      type: 'array',
      of: [
        { type: 'block' }, // Text paragraphs
        { type: 'image', options: { hotspot: true } } // Images in between text
      ] 
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
    // We keep Gallery for "Extra" shots at the bottom
    defineField({
      name: 'gallery',
      title: 'Project Gallery (Extras)',
      type: 'array',
      of: [{ type: 'image' }],
    }),
  ],
})