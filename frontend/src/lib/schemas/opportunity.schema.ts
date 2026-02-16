import { z } from 'zod';

/**
 * Schema de validación para Oportunidades
 */
export const opportunitySchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  accountId: z
    .string()
    .min(1, 'Debe seleccionar una cuenta'),
  
  contactId: z
    .string()
    .optional(),
  
  amount: z
    .number()
    .min(0, 'El monto no puede ser negativo')
    .max(999999999, 'El monto es demasiado alto'),
  
  probability: z
    .number()
    .min(0, 'La probabilidad debe ser entre 0 y 100')
    .max(100, 'La probabilidad debe ser entre 0 y 100')
    .int('La probabilidad debe ser un número entero'),
  
  stage: z.enum([
    'prospecting',
    'qualification',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
  ] as const, {
    message: 'Debe seleccionar una etapa válida'
  }),
  
  expectedCloseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (formato: YYYY-MM-DD)')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'La fecha de cierre debe ser hoy o en el futuro'),
  
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  nextStep: z
    .string()
    .max(200, 'El próximo paso no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
});

export type OpportunityFormData = z.infer<typeof opportunitySchema>;

// Traducciones de etapas
export const stageTranslations = {
  prospecting: 'Prospección',
  qualification: 'Calificación',
  proposal: 'Propuesta',
  negotiation: 'Negociación',
  closed_won: 'Ganada',
  closed_lost: 'Perdida',
} as const;
