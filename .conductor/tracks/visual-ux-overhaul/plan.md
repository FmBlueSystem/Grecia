# Plan de Ejecución: Visual & UX Overhaul

## Status: 🏗️ En Progreso (Implementación Parcial)

Este archivo rastrea el trabajo activo siguiendo la metodología Conductor.
Para el plan maestro a largo plazo, ver `planning/PLAN_DE_TRABAJO.md`.

## 🛤️ Track: Visual & UX Overhaul (Premium Aesthetic)
**Objetivo**: Transformar la interfaz en una experiencia "Premium" y "State-of-the-Art" siguiendo las reglas de `CONVENTIONS.md`.

### Fase 1: Fundamentos Visuales
- [x] **Global Styles (`index.css`)**:
    - [x] Definir paleta de colores sofisticada (Deep Blue, Slate, White).
    - [x] Configurar tipografía moderna (Inter/System fonts).
    - [x] Crear utilidades básicas de Tailwind v4.
    - [ ] Crear utilidades de "Glassmorphism" y sombras suaves premium.
- [x] **Sistema de Animaciones**:
    - [x] Instalar Framer Motion.
    - [x] Crear `src/utils/animations.ts` con variantes básicas.
    - [ ] Crear `src/lib/animations.ts` con variantes estándar completas (FadeIn, SlideUp, Stagger).
    - [ ] Imponer uso de `AnimatePresence` en transiciones de páginas.

### Fase 2: Componentes Core
- [x] **Layout Principal**: 
    - [x] Implementar Sidebar básico.
    - [x] Implementar Header.
    - [ ] Rediseñar Sidebar y Header (flotantes, translúcidos, glassmorphism).
- [x] **Dashboard**: 
    - [x] Implementar KPIs básicos.
    - [x] Implementar Gráficos con Recharts.
    - [ ] Reimplementar KPIs y Gráficos con estética mejorada (sombras suaves, bordes premium).
- [x] **Login**: 
    - [x] Crear página de login funcional.
    - [x] Agregar animaciones básicas.
    - [ ] Crear experiencia de entrada inmersiva (partículas, gradientes avanzados).

### Fase 3: Componentes Adicionales Implementados
- [x] **Formularios Modales**:
    - [x] ContactForm con validación.
    - [x] OpportunityForm con validación.
- [x] **Páginas CRM**:
    - [x] Contacts (lista y gestión).
    - [x] Accounts (cuentas).
    - [x] Pipeline (oportunidades).
    - [x] Leads (gestión de leads).
    - [x] Activities (actividades).
    - [x] Products, Quotes, Orders, Invoices.
- [x] **Dashboards Especializados**:
    - [x] Sales Dashboard.
    - [x] Service Dashboard.
    - [x] Logistics Dashboard.

### Fase 4: Mejoras Pendientes (Premium UX)
- [ ] **Glassmorphism**: Aplicar efectos de cristal translúcido en componentes principales.
- [ ] **Micro-interacciones**: Hover states avanzados, transitions suaves.
- [ ] **Mobile-First Polish**: Verificar y mejorar experiencia móvil.
- [ ] **Accessibility (A11y)**: Auditoría WCAG 2.1 AA.
- [ ] **Sistema de Animaciones Completo**: Estandarizar todas las transiciones.
- [ ] **Dark Mode**: Implementar tema oscuro (opcional).

### Fase 5: Arquitectura Backend (En espera de otro track)
- [ ] Diseño del Orquestador (Pausado por prioridad UI).

## 📊 Estado Real
**Implementación: ~70% completado**
- ✅ UI funcional y responsiva
- ✅ Animaciones básicas implementadas
- ✅ Componentes principales creados
- ⚠️ Falta: Glassmorphism, polish premium, A11y audit
