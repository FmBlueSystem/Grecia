import { z } from 'zod';

/**
 * Schema de validación para Leads
 */
export const leadSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase(),
  
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  
  company: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .optional()
    .or(z.literal('')),
  
  jobTitle: z
    .string()
    .max(100, 'El cargo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  source: z.enum([
    'website',
    'referral',
    'email',
    'social',
    'event',
    'other'
  ] as const, {
    message: 'Debe seleccionar una fuente válida'
  }),

  status: z.enum([
    'new',
    'contacted',
    'qualified',
    'unqualified'
  ] as const, {
    message: 'Debe seleccionar un estado válido'
  }),
  
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Traducciones
export const sourceTranslations = {
  website: 'Sitio Web',
  referral: 'Referido',
  email: 'Email',
  social: 'Redes Sociales',
  event: 'Evento',
  other: 'Otro',
} as const;

export const statusTranslations = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  unqualified: 'No Calificado',
} as const;
