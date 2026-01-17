/**
 * Schemas de Validación Zod
 * Exportación centralizada de todos los schemas de la aplicación
 */

export { contactSchema, type ContactFormData } from './contact.schema';
export { accountSchema, type AccountFormData } from './account.schema';
export { 
  opportunitySchema, 
  type OpportunityFormData,
  stageTranslations 
} from './opportunity.schema';
export { 
  leadSchema, 
  type LeadFormData,
  sourceTranslations,
  statusTranslations 
} from './lead.schema';
