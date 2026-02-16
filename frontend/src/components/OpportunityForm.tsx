import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn, fadeIn } from '../lib/animations';
import { opportunitySchema, type OpportunityFormData, stageTranslations } from '../lib/schemas';
import { ButtonLoading } from './ButtonLoading';
import { toast } from '../lib/toast';
import { useClickOutside } from '../lib/hooks';
import { useRef } from 'react';

interface Opportunity extends OpportunityFormData {
  id?: string;
}

interface OpportunityFormProps {
  opportunity?: Opportunity;
  onClose: () => void;
  onSave: (opportunity: Opportunity) => Promise<void>;
}

const stages: Array<{ value: OpportunityFormData['stage']; probability: number }> = [
  { value: 'prospecting', probability: 10 },
  { value: 'qualification', probability: 25 },
  { value: 'proposal', probability: 50 },
  { value: 'negotiation', probability: 75 },
  { value: 'closed_won', probability: 100 },
  { value: 'closed_lost', probability: 0 },
];

export default function OpportunityForm({ opportunity, onClose, onSave }: OpportunityFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: opportunity || {
      name: '',
      accountId: '',
      contactId: '',
      amount: 0,
      probability: 10,
      stage: 'prospecting',
      expectedCloseDate: '',
      description: '',
      nextStep: '',
    },
  });

  useClickOutside(modalRef, () => {
    if (!isSubmitting) onClose();
  });

  // Auto-update probability when stage changes
  const _selectedStage = watch('stage');
  const handleStageChange = (stage: OpportunityFormData['stage']) => {
    const stageData = stages.find(s => s.value === stage);
    if (stageData) {
      setValue('probability', stageData.probability);
    }
  };

  const onSubmit = async (data: OpportunityFormData) => {
    try {
      await onSave({ ...data, id: opportunity?.id });
      toast.success(
        opportunity ? 'Oportunidad actualizada' : 'Oportunidad creada',
        'Los cambios se guardaron exitosamente'
      );
      onClose();
    } catch (error) {
      toast.error(
        'Error al guardar',
        error instanceof Error ? error.message : 'No se pudo guardar la oportunidad'
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
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {opportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de la Oportunidad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-2.5 border rounded-lg transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="Venta de Software CRM"
              />
              {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cuenta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('accountId')}
                className={`w-full px-4 py-2.5 border rounded-lg ${
                  errors.accountId ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="ID de la cuenta"
              />
              {errors.accountId && <p className="mt-1.5 text-sm text-red-600">{errors.accountId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className={`w-full px-4 py-2.5 border rounded-lg ${
                  errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="100000"
              />
              {errors.amount && <p className="mt-1.5 text-sm text-red-600">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Etapa <span className="text-red-500">*</span>
              </label>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleStageChange(e.target.value as OpportunityFormData['stage']);
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg ${
                      errors.stage ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    {Object.entries(stageTranslations).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.stage && <p className="mt-1.5 text-sm text-red-600">{errors.stage.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Probabilidad (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('probability', { valueAsNumber: true })}
                className={`w-full px-4 py-2.5 border rounded-lg ${
                  errors.probability ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                min="0"
                max="100"
              />
              {errors.probability && <p className="mt-1.5 text-sm text-red-600">{errors.probability.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de Cierre Estimada <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('expectedCloseDate')}
                className={`w-full px-4 py-2.5 border rounded-lg ${
                  errors.expectedCloseDate ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.expectedCloseDate && (
                <p className="mt-1.5 text-sm text-red-600">{errors.expectedCloseDate.message}</p>
              )}
            </div>
          </div>

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
              {opportunity ? 'Actualizar' : 'Crear'} Oportunidad
            </ButtonLoading>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
