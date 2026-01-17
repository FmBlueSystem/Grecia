import { z } from 'zod';

/**
 * Schema de validación para Cuentas (Accounts)
 */
export const accountSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre de la cuenta debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  industry: z
    .string()
    .min(2, 'La industria debe tener al menos 2 caracteres')
    .optional()
    .or(z.literal('')),
  
  revenue: z
    .number()
    .min(0, 'Los ingresos no pueden ser negativos')
    .optional()
    .or(z.nan()),
  
  employees: z
    .number()
    .int('El número de empleados debe ser entero')
    .min(1, 'Debe haber al menos 1 empleado')
    .optional()
    .or(z.nan()),
  
  website: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  
  billingAddress: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  shippingAddress: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type AccountFormData = z.infer<typeof accountSchema>;
