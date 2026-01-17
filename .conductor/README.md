# 🎯 Gemini Conductor - Guía para Desarrolladores

Bienvenido al proyecto **Grecia (STIA CRM)**. Este proyecto sigue la **metodología Gemini Conductor** para desarrollo de software dirigido por IA.

## 📚 Documentación Core (LEE ESTO PRIMERO)

Antes de escribir cualquier línea de código, **DEBES** leer estos archivos en orden:

1. **`product.md`** - Visión del producto, dominio del negocio, objetivos
2. **`tech-stack.md`** - Tecnologías aprobadas, decisiones arquitectónicas
3. **`product-guidelines.md`** - Convenciones de código, estándares
4. **`workflow.md`** - Proceso de desarrollo, reglas para agentes
5. **`CONDUCTOR_METHODOLOGY.md`** - Principios fundamentales de Conductor

## 🛤️ Sistema de Tracks

Todo el trabajo se organiza en **Tracks** (unidades de trabajo aisladas).

### ¿Qué es un Track?

Un track es una unidad de trabajo enfocada que contiene:
- **`spec.md`** - Especificación (QUÉ y POR QUÉ)
- **`plan.md`** - Plan de ejecución (CÓMO y checkboxes de progreso)

### Tracks Disponibles

Ver archivo **`tracks.md`** para el registro completo de tracks con sus estados.

### ¿Cómo trabajar con Tracks?

#### Opción A: Continuar un Track Existente
```bash
# 1. Ver tracks disponibles
cat .conductor/tracks.md

# 2. Leer el spec y plan del track elegido
cat .conductor/tracks/[track-id]/spec.md
cat .conductor/tracks/[track-id]/plan.md

# 3. Trabajar en las tareas pendientes [ ]
# 4. Marcar como completadas [x] cuando termines
# 5. Actualizar el status si es necesario
```

#### Opción B: Crear un Nuevo Track
```bash
# 1. Crear directorio
mkdir -p .conductor/tracks/[nuevo-track-id]

# 2. Crear spec.md con:
#    - Context
#    - Requirements
#    - Goals

# 3. Crear plan.md con:
#    - Status
#    - Todo List (checkboxes)
#    - Verification Plan

# 4. Registrar en tracks.md

# 5. Comenzar a trabajar
```

## 🔧 Scripts Útiles

### Verificar Sincronización
```bash
# Ejecutar script de verificación
.conductor/scripts/sync-plans.sh

# Debe mostrar: ✅ Proyecto 100% sincronizado con Conductor
```

Este script verifica:
- ✅ Estructura Conductor completa
- ✅ Todos los tracks tienen spec.md y plan.md
- ✅ Archivos .env.example existen
- ✅ Código backend/frontend organizado

## 🚫 Reglas Estrictas

### ❌ PROHIBIDO

1. **Escribir código sin un track activo**
   - Siempre debe haber un `plan.md` que documente lo que estás haciendo

2. **Usar `any` en TypeScript**
   - Strict mode activado, usa tipos explícitos o Zod

3. **Saltar el Context-First**
   - No codifiques sin leer `product.md`, `tech-stack.md`, etc.

4. **Commits sin contexto**
   - Usa Conventional Commits: `feat(module): description`

### ✅ OBLIGATORIO

1. **Actualizar plans en tiempo real**
   - Marca [x] cuando completes una tarea

2. **Mantener tracks.md sincronizado**
   - Actualiza el status cuando cambies de fase

3. **Tests para código nuevo** (próximamente)
   - TDD cuando el track de testing esté activo

4. **Documentar decisiones importantes**
   - Si cambias arquitectura, actualiza `tech-stack.md`

## 📊 Estado Actual del Proyecto

**Última actualización:** 17 de Enero 2026

### Tracks Completados ✅
- `conductor-reconciliation` - Alineación y auditoría

### Tracks En Progreso 🏗️
- `visual-ux-overhaul` (70%)
- `backend-core-features` (85%)
- `backend-crm-implementation` (70%)

### Tracks Pendientes 📋
- `frontend-i18n`

**Compliance Conductor:** 100% ✅

## 🎯 Próximas Prioridades

1. Completar `visual-ux-overhaul` (glassmorphism, A11y)
2. Iniciar `frontend-i18n` (i18next, ES/EN)
3. Crear track de testing (`testing-foundation`)

## 📖 Recursos Adicionales

- **Reporte de Status:** `status-report.md` - Análisis completo de alineación
- **Plan de Trabajo Master:** `../planning/PLAN_DE_TRABAJO.md` - Roadmap de 14 semanas
- **README Principal:** `../README.md` - Documentación del usuario

## 🆘 ¿Necesitas Ayuda?

### Preguntas Frecuentes

**P: ¿Puedo empezar a codificar directamente?**  
R: NO. Primero lee Context → Elige/Crea Track → Luego codifica.

**P: ¿Qué hago si encuentro código sin track?**  
R: Crea un track de "reconciliación" o documéntalo en el track más cercano.

**P: ¿Cómo sé si estoy siguiendo Conductor correctamente?**  
R: Ejecuta `.conductor/scripts/sync-plans.sh` - debe dar 100%.

**P: ¿Puedo cambiar el tech stack?**  
R: Sí, pero PRIMERO actualiza `tech-stack.md` y discute con el equipo.

## 📝 Contacto

**Project Lead:** Freddy Molina  
**Empresa:** BlueSystem / STIA  
**Metodología:** Gemini Conductor

---

**Recuerda:** Context-First → Plan-Driven → Agentic-Ready

¡Buen código! 🚀
