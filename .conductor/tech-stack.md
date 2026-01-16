# Stack Tecnológico y Decisiones de Arquitectura

> Este archivo define las tecnologías aprobadas y patrones arquitectónicos. Evita decisiones ad-hoc; si quieres cambiar algo aquí, actualiza este archivo primero.

## 🖥️ Frontend (Cliente)
*   **Framework**: React 19
*   **Build Tool**: Vite 7
*   **Lenguaje**: TypeScript 5 (Strict Mode)
*   **Estilos**:
    *   **Tailwind CSS v4**: Motor principal de estilos.
    *   **Shadcn/UI**: Componentes base (modificados para estética Premium).
    *   **Framer Motion**: Animaciones y transiciones (micro-interacciones obligatorias).
*   **Estado**: Zustand (store global ligero).
*   **Fetching**: TanStack Query (React Query) v5.
*   **Visualización**: Recharts (gráficos interactivos).

## ⚙️ Backend (Servidor & Agentes)
*   **Runtime**: Node.js 20 LTS
*   **Framework**: Fastify 5 (por performance y bajas latencias).
*   **Lenguaje**: TypeScript 5
*   **Base de Datos**:
    *   *Actual (MVP)*: In-memory (transición).
    *   *Target*: PostgreSQL + Prisma ORM.
*   **IA & Orquestación**:
    *   **Modelo Principal**: Google Gemini Pro (vía Vertex AI o AI Studio).
    *   **Patrón**: Orchestrator-Workers (ver `docs/CONDUCTOR_METHODOLOGY.md`).

## 🛠️ Herramientas de Desarrollo y DevOps
*   **Linter**: ESLint (configuración estricta).
*   **Formatter**: Prettier.
*   **Control de Versiones**: Git (Conventional Commits recomendado).
*   **Metodología**: Conductor (Context-Driven Development).

## 📐 Principios de Código
1.  **Type Safety**: `any` está prohibido. Usa Zod para validación de runtime.
2.  **Componentes Puros**: Lógica de negocio separada de la UI (Custom Hooks).
3.  **Mobile-First**: Todo debe funcionar perfecto en móvil.
4.  **A11y**: Accesibilidad WCAG 2.1 AA por defecto.
