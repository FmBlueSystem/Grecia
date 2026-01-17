# 🎯 Guía de Tareas: Frontend Robustness

> **Track:** `frontend-robustness`  
> **Objetivo:** Transformar la UI en una aplicación enterprise-grade con manejo robusto de errores y UX profesional  
> **Total de Tareas:** 71  
> **Tiempo Estimado:** 3-4 semanas de trabajo

---

## 🚀 Quick Wins (Empezar Aquí - 2 horas)

### ✅ 1. Sistema de Notificaciones Toast (30 min)
**Archivos a modificar:**
- `frontend/src/App.tsx`
- `frontend/src/lib/toast.ts` (crear)

**Pasos:**
```tsx
// 1. Verificar que sonner esté instalado
// Ya está en package.json ✓

// 2. Agregar Toaster en App.tsx
import { Toaster } from 'sonner';

<div className="App">
  <Toaster position="top-right" richColors />
  {/* resto del código */}
</div>

// 3. Crear helper en lib/toast.ts
import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  promise: (promise: Promise<any>, messages: {...}) => toast.promise(promise, messages)
};
```

**Beneficio:** Feedback inmediato en todas las operaciones

---

### ✅ 2. Loading Spinner Component (20 min)
**Archivos a crear:**
- `frontend/src/components/LoadingSpinner.tsx`
- `frontend/src/components/ButtonLoading.tsx`

**Código:**
```tsx
// LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// ButtonLoading.tsx
export function ButtonLoading({ loading, children, ...props }) {
  return (
    <button disabled={loading} {...props}>
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

**Beneficio:** Indicadores visuales de carga profesionales

---

### ✅ 3. Validación de Formularios (45 min)
**Archivos a modificar:**
- `frontend/src/components/ContactForm.tsx`
- `frontend/src/lib/schemas.ts` (crear)

**Pasos:**
```tsx
// 1. Crear schema en lib/schemas.ts
import { z } from 'zod';

export const contactSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto').max(50),
  lastName: z.string().min(2, 'Apellido muy corto').max(50),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\+?[0-9\s-()]+$/, 'Teléfono inválido').optional(),
  companyName: z.string().min(2).max(100).optional()
});

// 2. Integrar en ContactForm con React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(contactSchema)
});
```

**Beneficio:** Datos siempre válidos, mejor UX

---

### ✅ 4. Delete Confirmation (30 min)
**Archivos a crear:**
- `frontend/src/components/ConfirmDialog.tsx`

**Código:**
```tsx
export function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-xl p-6 shadow-xl">
              <h3>{title}</h3>
              <p>{message}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={onClose}>Cancelar</button>
                <button onClick={onConfirm} className="bg-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Beneficio:** Prevención de eliminaciones accidentales

---

## 📋 Fase 1: Fundamentos (15 tareas - Prioridad Alta)

### 1.1 Sistema de Notificaciones (6 tareas)
- [x] Instalar sonner (ya instalado)
- [ ] Crear ToastProvider en App.tsx
- [ ] Crear helper toast.ts
- [ ] Aplicar toasts en CRUD de Contacts
- [ ] Aplicar toasts en CRUD de Accounts
- [ ] Aplicar toasts en CRUD de Opportunities

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥🔥 Alto

---

### 1.2 Error Boundaries (4 tareas)
- [ ] Crear componente ErrorBoundary.tsx
- [ ] Crear UI de fallback elegante
- [ ] Envolver App con ErrorBoundary
- [ ] Agregar ErrorBoundary por ruta

**Archivos:**
```
frontend/src/components/ErrorBoundary.tsx
frontend/src/components/ErrorFallback.tsx
```

**Tiempo:** 1-2 horas  
**Impacto:** 🔥🔥🔥 Alto

---

### 1.3 Loading States (5 tareas)
- [ ] Crear LoadingSpinner.tsx
- [ ] Crear ButtonLoading.tsx
- [ ] Agregar loading en formularios
- [ ] Agregar loading en fetch de datos
- [ ] Deshabilitar botones durante operaciones

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥 Medio-Alto

---

## 📋 Fase 2: Validación de Formularios (9 tareas - Prioridad Alta)

### 2.1 Setup de Validación (4 tareas)
- [x] Zod instalado
- [x] React Hook Form instalado
- [ ] Crear contactSchema
- [ ] Crear accountSchema
- [ ] Crear opportunitySchema
- [ ] Crear leadSchema

**Archivos a crear:**
```
frontend/src/lib/schemas/
  ├── contact.schema.ts
  ├── account.schema.ts
  ├── opportunity.schema.ts
  └── index.ts
```

**Tiempo:** 1-2 horas  
**Impacto:** 🔥🔥🔥 Alto

---

### 2.2 Integración en Formularios (5 tareas)
- [ ] Migrar ContactForm a React Hook Form
- [ ] Migrar OpportunityForm a React Hook Form
- [ ] Agregar mensajes de error inline
- [ ] Indicadores visuales (válido/inválido)
- [ ] Prevenir envíos duplicados

**Tiempo:** 3-4 horas  
**Impacto:** 🔥🔥🔥 Alto

---

## 📋 Fase 3: Skeletons & Empty States (11 tareas - Prioridad Media)

### 3.1 Skeleton Components (6 tareas)
- [ ] Crear TableSkeleton.tsx
- [ ] Crear CardSkeleton.tsx
- [ ] Crear ChartSkeleton.tsx
- [ ] Aplicar en Contacts page
- [ ] Aplicar en Accounts page
- [ ] Aplicar en Dashboard

**Ejemplo de Skeleton:**
```tsx
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-200 rounded-lg mb-2" />
      ))}
    </div>
  );
}
```

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥 Medio

---

### 3.2 Empty States (5 tareas)
- [ ] Crear componente EmptyState.tsx
- [ ] Agregar ilustraciones SVG
- [ ] Implementar en Contacts
- [ ] Implementar en Accounts
- [ ] Implementar en Opportunities

**Ejemplo:**
```tsx
export function EmptyState({ 
  icon, 
  title, 
  message, 
  action 
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-500">{message}</p>
      {action && <button>{action}</button>}
    </div>
  );
}
```

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥 Medio

---

## 📋 Fase 4: Confirmaciones (10 tareas - Prioridad Alta)

### 4.1 Modal de Confirmación (6 tareas)
- [ ] Crear ConfirmDialog.tsx
- [ ] Agregar confirmación "Eliminar Contacto"
- [ ] Agregar confirmación "Eliminar Cuenta"
- [ ] Agregar confirmación "Eliminar Oportunidad"
- [ ] Agregar confirmación "Cerrar Sesión"
- [ ] Agregar confirmación acciones bulk

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥🔥 Alto (prevención de errores)

---

### 4.2 Mejorar Modals (4 tareas)
- [ ] Close on ESC key
- [ ] Close on outside click
- [ ] Focus trap
- [ ] Animaciones suaves

**Tiempo:** 1-2 horas  
**Impacto:** 🔥 Bajo-Medio

---

## 📋 Fase 5: Manejo de Errores API (10 tareas - Prioridad Alta)

### 5.1 Interceptor de Errores (6 tareas)
- [ ] Crear api.ts con Axios
- [ ] Interceptor 401 → redirect login
- [ ] Interceptor 403 → sin permisos
- [ ] Interceptor 500 → toast error
- [ ] Interceptor timeout
- [ ] Interceptor network error

**Archivo:**
```typescript
// frontend/src/lib/api.ts
import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    if (error.response?.status === 500) {
      toast.error('Error del servidor');
    }
    return Promise.reject(error);
  }
);
```

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥🔥 Alto

---

### 5.2 Retry Logic (4 tareas)
- [ ] Retry automático (3 intentos)
- [ ] Exponential backoff
- [ ] Botón "Reintentar" en UI
- [ ] Retry manual

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥 Medio

---

## 📋 Fase 6: Resiliencia Avanzada (8 tareas - Prioridad Baja)

### 6.1 Offline Detection (4 tareas)
- [ ] Crear hook useOnlineStatus()
- [ ] Mostrar banner offline
- [ ] Deshabilitar acciones
- [ ] Queue en localStorage

**Tiempo:** 3-4 horas  
**Impacto:** 🔥 Bajo (nice to have)

---

### 6.2 Optimistic Updates (4 tareas)
- [ ] Optimistic create contacto
- [ ] Optimistic edit contacto
- [ ] Rollback si falla
- [ ] Loading sutil

**Tiempo:** 3-4 horas  
**Impacto:** 🔥 Bajo (nice to have)

---

## 📋 Fase 7: Polish (8 tareas - Prioridad Media)

### 7.1 Accesibilidad (4 tareas)
- [ ] aria-labels en botones
- [ ] role attributes
- [ ] Navegación con teclado
- [ ] Focus visible

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥 Medio (importante para enterprise)

---

### 7.2 Feedback Visual (4 tareas)
- [ ] Hover states
- [ ] Active states
- [ ] Disabled states
- [ ] Transitions suaves

**Tiempo:** 2-3 horas  
**Impacto:** 🔥🔥 Medio

---

## 📊 Resumen de Esfuerzo

| Fase | Tareas | Tiempo Estimado | Prioridad | Impacto |
|:-----|:-------|:----------------|:----------|:--------|
| **Quick Wins** | 4 | 2 horas | 🔥🔥🔥 | Inmediato |
| **Fase 1** | 15 | 5-8 horas | 🔥🔥🔥 | Alto |
| **Fase 2** | 9 | 4-6 horas | 🔥🔥🔥 | Alto |
| **Fase 3** | 11 | 4-6 horas | 🔥🔥 | Medio |
| **Fase 4** | 10 | 3-5 horas | 🔥🔥🔥 | Alto |
| **Fase 5** | 10 | 4-6 horas | 🔥🔥🔥 | Alto |
| **Fase 6** | 8 | 6-8 horas | 🔥 | Bajo |
| **Fase 7** | 8 | 4-6 horas | 🔥🔥 | Medio |
| **TOTAL** | **71** | **32-47 horas** | - | - |

---

## 🎯 Roadmap Recomendado

### Semana 1: Quick Wins + Fase 1 + Fase 2
- Día 1: Quick Wins (toasts, spinners, validación básica)
- Día 2-3: Fase 1 completa (error boundaries, loading states)
- Día 4-5: Fase 2 completa (validación de todos los formularios)

**Resultado:** Aplicación con feedback profesional y validaciones

---

### Semana 2: Fase 3 + Fase 4
- Día 1-2: Skeletons en todas las páginas
- Día 3-4: Empty states con ilustraciones
- Día 5: Confirmaciones para acciones críticas

**Resultado:** UX pulida y profesional

---

### Semana 3: Fase 5 + Testing
- Día 1-3: Interceptores y manejo de errores de API
- Día 4-5: Retry logic y testing manual

**Resultado:** Aplicación resiliente

---

### Semana 4: Fase 6 + Fase 7 + Polish
- Día 1-2: Offline detection (opcional)
- Día 3-4: Accesibilidad y feedback visual
- Día 5: Testing final y ajustes

**Resultado:** Aplicación enterprise-ready

---

## ✅ Checklist de Validación

Al finalizar, la aplicación debe cumplir:

- [ ] ✅ Todas las operaciones tienen toast notification
- [ ] ✅ Todos los formularios tienen validación
- [ ] ✅ Todas las listas tienen skeleton loading
- [ ] ✅ Todas las acciones destructivas tienen confirmación
- [ ] ✅ Todos los errores de API se manejan correctamente
- [ ] ✅ Todos los botones tienen estados de loading
- [ ] ✅ Todos los estados empty tienen ilustración
- [ ] ✅ Error Boundary funcional en toda la app
- [ ] ✅ Navegación con teclado funciona
- [ ] ✅ No hay console.errors en producción

---

## 📚 Recursos Útiles

- **Sonner (Toasts):** https://sonner.emilkowal.ski/
- **React Hook Form:** https://react-hook-form.com/
- **Zod:** https://zod.dev/
- **Framer Motion:** https://www.framer.com/motion/
- **Axios:** https://axios-http.com/

---

**¿Listo para empezar?** 🚀

Recomendación: Comienza con los **Quick Wins** para tener resultados visibles en 2 horas.
