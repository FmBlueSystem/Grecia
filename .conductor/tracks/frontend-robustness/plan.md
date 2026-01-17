# Plan: Frontend Robustness & Error Handling

## Status: 🏗️ En Progreso

## 📝 Todo List

### Phase 1: Fundamentos de Robustez (Prioridad Alta)

#### 1.1 Sistema de Notificaciones
- [ ] Instalar `sonner` (ya existe en package.json, verificar)
- [ ] Crear `ToastProvider` en App.tsx o Layout
- [ ] Crear helper `toast.ts` con funciones: success(), error(), loading(), promise()
- [ ] Aplicar toasts en operaciones CRUD de Contacts
- [ ] Aplicar toasts en operaciones CRUD de Accounts
- [ ] Aplicar toasts en operaciones CRUD de Opportunities

#### 1.2 Error Boundaries
- [ ] Crear componente `ErrorBoundary.tsx`
- [ ] Crear UI de fallback con ilustración y botón "Reload"
- [ ] Envolver App principal con ErrorBoundary
- [ ] Agregar ErrorBoundary específico para cada ruta/página

#### 1.3 Loading States
- [ ] Crear componente `LoadingSpinner.tsx` reutilizable
- [ ] Crear componente `ButtonLoading.tsx` (botón con spinner)
- [ ] Agregar loading state en formularios (ContactForm, OpportunityForm)
- [ ] Agregar loading state en fetch de datos (Dashboard, Contacts, Accounts)
- [ ] Deshabilitar botones durante operaciones

### Phase 2: Validación de Formularios (Prioridad Alta)

#### 2.1 Setup de Validación
- [ ] Verificar Zod instalado (ya en package.json)
- [ ] Verificar React Hook Form instalado (ya en package.json)
- [ ] Crear schemas Zod para:
  - [ ] Contact schema
  - [ ] Account schema
  - [ ] Opportunity schema
  - [ ] Lead schema

#### 2.2 Integración en Formularios
- [ ] Migrar ContactForm a React Hook Form + Zod
- [ ] Migrar OpportunityForm a React Hook Form + Zod
- [ ] Agregar validación inline con mensajes de error
- [ ] Agregar indicadores visuales (campo válido/inválido)
- [ ] Prevenir envíos duplicados (disable on submit)

### Phase 3: UI Skeletons & Empty States (Prioridad Media)

#### 3.1 Skeleton Components
- [ ] Crear `TableSkeleton.tsx` (para listas)
- [ ] Crear `CardSkeleton.tsx` (para dashboards)
- [ ] Crear `ChartSkeleton.tsx` (para gráficos)
- [ ] Aplicar en Contacts page
- [ ] Aplicar en Accounts page
- [ ] Aplicar en Dashboard page

#### 3.2 Empty States
- [ ] Crear componente `EmptyState.tsx` genérico
- [ ] Agregar ilustraciones SVG para empty states
- [ ] Implementar en Contacts (cuando no hay contactos)
- [ ] Implementar en Accounts (cuando no hay cuentas)
- [ ] Implementar en Opportunities (cuando no hay oportunidades)
- [ ] Agregar CTA buttons en empty states

### Phase 4: Confirmaciones & Modals (Prioridad Alta)

#### 4.1 Modal de Confirmación
- [ ] Crear componente `ConfirmDialog.tsx` reutilizable
- [ ] Agregar confirmación para "Eliminar Contacto"
- [ ] Agregar confirmación para "Eliminar Cuenta"
- [ ] Agregar confirmación para "Eliminar Oportunidad"
- [ ] Agregar confirmación para "Cerrar Sesión"
- [ ] Agregar confirmación para acciones bulk (si existen)

#### 4.2 Mejorar Modals Existentes
- [ ] Agregar close on ESC key
- [ ] Agregar close on outside click
- [ ] Trap focus dentro del modal
- [ ] Agregar animaciones de entrada/salida suaves

### Phase 5: Manejo de Errores de API (Prioridad Alta)

#### 5.1 Interceptor de Errores
- [ ] Crear `api.ts` con Axios instance configurado
- [ ] Agregar interceptor para manejar errores 401 (redirect a login)
- [ ] Agregar interceptor para manejar errores 403 (sin permisos)
- [ ] Agregar interceptor para manejar errores 500 (mostrar toast)
- [ ] Agregar interceptor para manejar timeout
- [ ] Agregar interceptor para manejar network errors

#### 5.2 Retry Logic
- [ ] Implementar retry automático para network errors (3 intentos)
- [ ] Agregar exponential backoff
- [ ] Agregar botón "Reintentar" en error states
- [ ] Implementar retry manual en UI

### Phase 6: Resiliencia Avanzada (Prioridad Baja)

#### 6.1 Offline Detection
- [ ] Crear hook `useOnlineStatus()`
- [ ] Mostrar banner cuando está offline
- [ ] Deshabilitar acciones que requieren conexión
- [ ] Guardar acciones en localStorage para retry

#### 6.2 Optimistic Updates
- [ ] Implementar optimistic update en crear contacto
- [ ] Implementar optimistic update en editar contacto
- [ ] Implementar rollback si la API falla
- [ ] Agregar loading indicator sutil (no bloqueante)

### Phase 7: Polish & Detalles (Prioridad Media)

#### 7.1 Accesibilidad
- [ ] Agregar `aria-labels` a botones sin texto
- [ ] Agregar `role` attributes a componentes interactivos
- [ ] Verificar navegación con teclado (Tab order)
- [ ] Agregar focus visible en todos los elementos

#### 7.2 Feedback Visual
- [ ] Agregar hover states a todos los botones
- [ ] Agregar active states (click feedback)
- [ ] Agregar disabled states visuales
- [ ] Agregar transitions suaves en cambios de estado

## 🧪 Verification Plan

### Manual Testing
- [ ] Probar flujo completo de crear contacto (success)
- [ ] Probar crear contacto con datos inválidos (validación)
- [ ] Probar crear contacto con API caída (error handling)
- [ ] Probar eliminar contacto con confirmación
- [ ] Probar navegación con internet desconectado
- [ ] Probar ESC key en todos los modals

### Automated Testing (Futuro)
- [ ] Tests de validación de formularios
- [ ] Tests de Error Boundary
- [ ] Tests de toast notifications

## 📊 Progress Tracking

**Fase 1 (Fundamentos):** 0/15 tareas  
**Fase 2 (Validación):** 0/9 tareas  
**Fase 3 (Skeletons):** 0/11 tareas  
**Fase 4 (Confirmaciones):** 0/10 tareas  
**Fase 5 (API Errors):** 0/10 tareas  
**Fase 6 (Resiliencia):** 0/8 tareas  
**Fase 7 (Polish):** 0/8 tareas  

**Total:** 0/71 tareas completadas (0%)

## 🎯 Quick Wins (Para empezar hoy)

1. **Setup Toast System** (30 min)
   - Agregar Toaster en App.tsx
   - Crear primer toast en ContactForm

2. **Loading Spinner** (20 min)
   - Crear componente LoadingSpinner
   - Usarlo en un botón

3. **Form Validation** (45 min)
   - Crear schema Zod para Contact
   - Integrar en ContactForm

4. **Delete Confirmation** (30 min)
   - Crear ConfirmDialog
   - Usar en delete de Contacts

**Total Quick Wins:** ~2 horas = Mejora visual inmediata
