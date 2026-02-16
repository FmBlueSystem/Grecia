import { useState } from 'react';
import { HelpCircle, X, ArrowRight, AlertTriangle, Lightbulb, Workflow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HelpContent {
  title: string;
  description: string;
  steps?: { label: string; detail: string }[];
  dependencies?: string[];
  sapNotes?: string[];
  tips?: string[];
}

interface HelpPanelProps {
  content: HelpContent;
}

export default function HelpPanel({ content }: HelpPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        title="Ayuda"
      >
        <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{content.title}</h3>
                    <p className="text-indigo-200 text-xs font-medium">Guia de uso</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Description */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">¿Para qué sirve?</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">{content.description}</p>
                </div>

                {/* Workflow Steps */}
                {content.steps && content.steps.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Workflow className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Flujo de trabajo</h4>
                    </div>
                    <div className="space-y-0">
                      {content.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </div>
                            {idx < content.steps!.length - 1 && (
                              <div className="w-0.5 h-full bg-blue-200 my-1" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-bold text-slate-800">{step.label}</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {content.dependencies && content.dependencies.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Depende de</h4>
                    </div>
                    <div className="space-y-2">
                      {content.dependencies.map((dep, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-2.5">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-700">{dep}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SAP Notes */}
                {content.sapNotes && content.sapNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Requisitos en SAP</h4>
                    </div>
                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 space-y-2">
                      {content.sapNotes.map((note, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-orange-400 mt-1 shrink-0">&#9679;</span>
                          <p className="text-sm text-slate-700 leading-relaxed">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {content.tips && content.tips.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tips</h4>
                    </div>
                    <div className="space-y-2">
                      {content.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-400 text-center">
                  Datos sincronizados desde SAP Business One
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
