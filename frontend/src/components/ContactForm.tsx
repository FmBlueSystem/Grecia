import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn, fadeIn } from '../lib/animations';
import { contactSchema, type ContactFormData } from '../lib/schemas';
import { ButtonLoading } from './ButtonLoading';
import { toast } from '../lib/toast';
import { useClickOutside } from '../lib/hooks';
import { useRef } from 'react';

interface Contact extends ContactFormData {
  id?: string;
}

interface ContactFormProps {
  contact?: Contact;
  onClose: () => void;
  onSave: (contact: Contact) => Promise<void>;
}

export default function ContactForm({ contact, onClose, onSave }: ContactFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      jobTitle: '',
      notes: '',
    },
  });

  // Close on outside click (only if not submitting)
  useClickOutside(modalRef, () => {
    if (!isSubmitting) onClose();
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await onSave({ ...data, id: contact?.id });
      toast.success(
        contact ? 'Contacto actualizado' : 'Contacto creado',
        'Los cambios se guardaron exitosamente'
      );
      onClose();
    } catch (error) {
      toast.error(
        'Error al guardar',
        error instanceof Error ? error.message : 'No se pudo guardar el contacto'
      );
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        variants={scaleIn}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {contact ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('firstName')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.firstName
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="Juan"
              />
              {errors.firstName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('lastName')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.lastName
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="Pérez"
              />
              {errors.lastName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="juan@ejemplo.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
              <input
                type="tel"
                {...register('phone')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.phone
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="+506 1234-5678"
              />
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Empresa</label>
              <input
                type="text"
                {...register('companyName')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.companyName
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="ACME Corp"
              />
              {errors.companyName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Puesto</label>
              <input
                type="text"
                {...register('jobTitle')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.jobTitle
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="Director de Ventas"
              />
              {errors.jobTitle && (
                <p className="mt-1.5 text-sm text-red-600">{errors.jobTitle.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
            <textarea
              {...register('notes')}
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                errors.notes
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              placeholder="Información adicional sobre el contacto..."
            />
            {errors.notes && (
              <p className="mt-1.5 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <ButtonLoading
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </ButtonLoading>
            <ButtonLoading
              type="submit"
              variant="primary"
              loading={isSubmitting}
              loadingText="Guardando..."
            >
              {contact ? 'Actualizar' : 'Crear'} Contacto
            </ButtonLoading>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
