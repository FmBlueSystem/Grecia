import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn, fadeIn } from '../lib/animations';

interface Opportunity {
  id?: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  closeDate: string;
  accountName: string;
  contactName: string;
}

interface OpportunityFormProps {
  opportunity?: Opportunity;
  onClose: () => void;
  onSave: (opportunity: Opportunity) => Promise<void>;
}

export default function OpportunityForm({
  opportunity,
  onClose,
  onSave,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<Opportunity>(
    opportunity || {
      name: '',
      amount: 0,
      currency: 'USD',
      stage: 'Qualification',
      probability: 0,
      closeDate: '',
      accountName: '',
      contactName: '',
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const stages = [
    { value: 'Qualification', label: 'Calificación', probability: 10 },
    { value: 'Needs Analysis', label: 'Análisis de Necesidades', probability: 25 },
    { value: 'Proposal', label: 'Propuesta', probability: 50 },
    { value: 'Negotiation', label: 'Negociación', probability: 75 },
    { value: 'Closed Won', label: 'Ganada', probability: 100 },
    { value: 'Closed Lost', label: 'Perdida', probability: 0 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'stage') {
      const stage = stages.find((s) => s.value === value);
      setFormData({
        ...formData,
        stage: value,
        probability: stage?.probability || 0,
      });
    } else if (name === 'amount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else if (name === 'probability') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.accountName || !formData.closeDate) {
      setError('Nombre, cuenta y fecha de cierre son requeridos');
      return;
    }

    if (formData.amount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar oportunidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        variants={scaleIn}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {opportunity ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-primary-dark rounded-lg p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Oportunidad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="ej. Implementación CRM - Q1 2026"
                required
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nombre de la empresa"
                required
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto Principal
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nombre del contacto"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="CRC">CRC</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etapa <span className="text-red-500">*</span>
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                {stages.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Probability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probabilidad (%)
              </label>
              <input
                type="number"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Close Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Cierre Estimada <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="closeDate"
                value={formData.closeDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumen</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Valor Ponderado:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {formData.currency}{' '}
                  {((formData.amount * formData.probability) / 100).toLocaleString('es-CR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Etapa:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {stages.find((s) => s.value === formData.stage)?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
