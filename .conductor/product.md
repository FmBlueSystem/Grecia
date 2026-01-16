# Contexto del Proyecto: Grecia (STIA CRM)

> Este archivo es la **Fuente de Verdad** sobre el propósito, dominio y objetivos del proyecto. Cualquier agente de IA o desarrollador debe leer esto primero para entender *qué* estamos construyendo y *por qué*.

## 🎯 Visión del Producto
**Grecia** es un CRM (Customer Relationship Management) moderno y minimalista, diseñado específicamente para **STIA/BlueSystem**.
Inspirado en Microsoft Dynamics CRM pero con una UX superior, se enfoca en la visualización de datos, la gestión ágil de leads y la integración profunda con procesos empresariales (futura integración con SAP Business One).

## 🏢 Dominio del Negocio
*   **Sector**: Tecnología y Servicios Empresariales.
*   **Usuarios Principales**: Equipos de Ventas, Gerentes de Cuenta y Directores Comerciales.
*   **Entidades Core**:
    *   **Cuentas (Accounts)**: Organizaciones/Empresas clientes.
    *   **Contactos (Contacts)**: Personas dentro de las cuentas.
    *   **Oportunidades (Opportunities)**: Posibles ventas con valor monetario, etapa y probabilidad.
    *   **Actividades**: Interacciones (llamadas, emails, reuniones).

## 🌟 Principios de Diseño "Conductor" para este Proyecto
Siguiendo la metodología Conductor, este proyecto se rige por:
1.  **Context-First**: Ninguna línea de código se escribe sin un plan previo en `plan.md`.
2.  **Orchestrator Pattern**: El backend evolucionará hacia una arquitectura donde un "Orquestador Central" coordina agentes especializados (ej. Agente de Ventas, Agente SAP).
3.  **Premium UX**: La estética no es negociable. Debe sentirse "Enterprise Premium".

## 🚀 Estado Actual (MVP)
*   **Versión**: 1.0 (MVP)
*   **Backend**: Node.js/Fastify con DB en memoria (migrando a real).
*   **Frontend**: React 19 + Tailwind v4 + Shadcn/UI.
*   **Fase Actual**: Refactorización de estructura para alinear con metodología Conductor y preparación para integración SAP.
