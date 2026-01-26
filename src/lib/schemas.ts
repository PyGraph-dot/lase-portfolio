// src/lib/schemas.ts
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(50),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Please provide more details").max(1000),
  // Honeypot field (hidden from users, filled by bots)
  website: z.string().optional() 
})

export type ContactFormData = z.infer<typeof contactSchema>