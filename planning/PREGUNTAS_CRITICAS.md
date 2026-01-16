# STIA CRM - Preguntas Críticas para Decisión

Este documento contiene preguntas esenciales que necesitan respuesta antes de proceder con el desarrollo. Las respuestas determinarán el alcance, la arquitectura y las prioridades del proyecto.

---

## ✅ SECCIÓN 1: Alcance y Objetivo del Proyecto

### 1.1 Uso del CRM

**Pregunta**: ¿Este CRM es para uso interno de STIA/BlueSystem o para ofrecer como producto SaaS a múltiples clientes?

- [ ] **Opción A**: Uso interno exclusivo (single-tenant)
  - Más simple de desarrollar
  - No necesita multi-tenancy
  - Personalización específica para STIA

- [ ] **Opción B**: Producto SaaS para múltiples clientes (multi-tenant)
  - Requiere multi-tenancy desde el inicio
  - Más complejo pero escalable
  - White-labeling posible
  - Modelo de negocio de suscripción

**Impacto**: Determina si implementamos multi-tenancy, billing, onboarding de clientes, etc.

**Respuesta**: ________________________________

---

### 1.2 Priorización de Módulos

**Pregunta**: De los 8 módulos principales descritos, ¿hay alguno que sea **absolutamente crítico** vs **nice-to-have** para el MVP?

**Módulos**:
1. Gestión de Contactos y Cuentas (Customer 360°)
2. Sales Pipeline & Oportunidades (Kanban, Forecast)
3. Actividades y Calendario
4. Dashboards y Analytics (Gráficos interactivos)
5. Búsqueda Avanzada y Filtrado
6. Colaboración (Activity Feed, Email, Notificaciones)
7. Seguridad y Administración (Usuarios, Roles, Audit)
8. Reportes (básicos en MVP)

**Indicar prioridad** (1=Crítico, 2=Importante, 3=Nice-to-have):

- Módulo 1: _____
- Módulo 2: _____
- Módulo 3: _____
- Módulo 4: _____
- Módulo 5: _____
- Módulo 6: _____
- Módulo 7: _____
- Módulo 8: _____

**¿Hay algún módulo que podamos dejar para Fase 2?**

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 2: Datos y Migraciones

### 2.1 Datos Existentes

**Pregunta**: ¿Actualmente usan algún CRM o sistema para gestionar contactos/ventas?

- [ ] **Opción A**: No, es completamente nuevo
- [ ] **Opción B**: Sí, usamos: _________________ (nombre del sistema)

**Si es Opción B**:
- ¿Necesitamos migrar datos existentes? [ ] Sí [ ] No
- ¿Cuántos registros aproximadamente?
  - Contactos: _____
  - Cuentas: _____
  - Oportunidades: _____
- ¿En qué formato están? [ ] CSV [ ] Excel [ ] Base de datos [ ] Otro: _____

**Impacto**: Determina si necesitamos herramientas de migración de datos, ETL, limpieza de datos, etc.

**Respuesta**: ________________________________

---

### 2.2 Volumen Esperado

**Pregunta**: ¿Qué volumen de datos esperan manejar inicialmente y a futuro?

**Inicial (primeros 6 meses)**:
- Usuarios del CRM: _____ personas
- Contactos: _____ registros
- Cuentas: _____ registros
- Oportunidades activas: _____ deals
- Actividades por mes: _____ (llamadas, emails, reuniones, etc.)

**A futuro (1-2 años)**:
- Usuarios: _____
- Contactos: _____
- Cuentas: _____

**Impacto**: Determina estrategias de escalabilidad, partitioning de DB, caching, etc.

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 3: Integraciones

### 3.1 Integraciones Críticas

**Pregunta**: ¿Hay sistemas con los que el CRM **DEBE** integrarse desde el inicio?

**Sistemas a considerar**:

- [ ] **Email**: Gmail / Outlook / Otro: _____
  - Bidirectional sync? [ ] Sí [ ] No
  - Solo envío desde CRM? [ ] Sí

- [ ] **Calendario**: Google Calendar / Outlook / Otro: _____
  - Sync automático? [ ] Sí [ ] No

- [ ] **Telefonía/VoIP**: _________________ (proveedor)
  - Click-to-call? [ ] Sí [ ] No
  - Registro automático de llamadas? [ ] Sí [ ] No

- [ ] **Contabilidad**: QuickBooks / Otro: _____

- [ ] **ERP**: SAP Business One / Otro: _____
  - **Nota**: Sé que tienes experiencia con SAP B1, ¿es una integración prioritaria?

- [ ] **Marketing**: Mailchimp / HubSpot / Otro: _____

- [ ] **WhatsApp Business**: [ ] Sí [ ] No

- [ ] **Otras integraciones**: ________________________________

**Para cada "Sí", indicar**:
- ¿Es obligatorio en MVP? [ ] Sí [ ] Puede esperar a Fase 2
- ¿Tienen APIs disponibles? [ ] Sí [ ] No [ ] Por investigar
- ¿Tienen credenciales/acceso? [ ] Sí [ ] No

**Impacto**: Cada integración agrega complejidad y tiempo de desarrollo. Priorizar las críticas.

**Respuesta**: ________________________________

---

### 3.2 Integración con SAP Business One

**Pregunta específica**: Dado tu background con SAP B1 e integrations, ¿es prioritario integrar este CRM con SAP B1?

- [ ] Sí, es crítico para MVP
- [ ] Sí, pero puede ser Fase 2
- [ ] No es necesario

**Si es Sí**:
- ¿Qué datos sincronizar? (clientes, oportunidades, facturas, etc.)
- ¿Dirección de sync? [ ] CRM → SAP [ ] SAP → CRM [ ] Bidireccional
- ¿Ya tienen Service Layer de SAP configurado? [ ] Sí [ ] No

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 4: Stack Tecnológico

### 4.1 Preferencias de Tecnología

**Pregunta**: ¿Tienes preferencia fuerte por alguna tecnología específica?

**Backend**:
- [ ] **Fastify** (recomendado - más rápido, moderno)
- [ ] **Express** (más establecido, ecosistema grande)
- [ ] Sin preferencia / lo que recomiendes

**State Management (Frontend)**:
- [ ] **Zustand** (recomendado - simple, menos boilerplate)
- [ ] **Redux Toolkit** (más robusto, más estructura)
- [ ] Sin preferencia

**ORM**:
- [ ] **Prisma** (recomendado - mejor DX, type-safe)
- [ ] **TypeORM** (más flexible para queries complejos)
- [ ] Sin preferencia

**UI Library**:
- [ ] **shadcn/ui** (recomendado - componentes copiables, total control)
- [ ] **Material-UI** (completo pero más pesado)
- [ ] **Ant Design** (componentes empresariales)
- [ ] Sin preferencia

**Respuesta**: ________________________________

---

### 4.2 Multi-Tenancy

**Pregunta**: Si el CRM es para múltiples clientes (SaaS), ¿qué arquitectura prefieres?

- [ ] **Shared database, shared schema** (todos los clientes en misma DB y schema)
  - Pros: Más simple, económico
  - Contras: Menor aislamiento

- [ ] **Shared database, schema per tenant** (DB compartida, schema por cliente)
  - Pros: Balance entre aislamiento y costo
  - Contras: Complejidad media

- [ ] **Database per tenant** (DB separada por cliente)
  - Pros: Máximo aislamiento
  - Contras: Más caro, más complejo de gestionar

- [ ] No aplica (single-tenant)

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 5: Localización y Multi-Idioma

### 5.1 Idiomas

**Pregunta**: ¿El CRM necesita soporte multi-idioma?

- [ ] **Solo Español**
- [ ] **Español + Inglés**
- [ ] **Más idiomas**: _________________ (especificar)

**Impacto**: Determina si implementamos i18n desde el inicio.

**Respuesta**: ________________________________

---

### 5.2 Monedas

**Pregunta**: ¿Necesitan soporte multi-currency?

- [ ] **Solo USD**
- [ ] **USD + CRC (Colones)**
- [ ] **Múltiples monedas**: _________________ (especificar)

**Si multi-currency**:
- ¿Necesitan conversión automática? [ ] Sí [ ] No
- ¿Dónde obtener tasas de cambio? [ ] API pública [ ] Manual [ ] Otro: _____

**Respuesta**: ________________________________

---

### 5.3 Ubicación y Timezone

**Pregunta**: ¿Los usuarios estarán en Costa Rica únicamente o en múltiples países?

- [ ] Solo Costa Rica
- [ ] Múltiples países: _________________ (especificar)

**Impacto**: Determina si manejamos timezones múltiples.

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 6: Infraestructura y Hosting

### 6.1 Preferencia de Cloud Provider

**Pregunta**: ¿Tienen preferencia de proveedor de cloud?

- [ ] **AWS** (Amazon Web Services)
- [ ] **Azure** (Microsoft)
- [ ] **Google Cloud Platform**
- [ ] **DigitalOcean**
- [ ] **Vercel + Railway** (recomendado para MVP - simple y rápido)
- [ ] **On-premise** (servidor propio)
- [ ] Sin preferencia / lo que recomiendes

**Si ya tienen infraestructura**:
- ¿Dónde? _____
- ¿Podemos usarla? [ ] Sí [ ] No

**Respuesta**: ________________________________

---

### 6.2 Presupuesto de Hosting

**Pregunta**: ¿Hay presupuesto estimado para hosting mensual?

- [ ] < $50/mes (básico)
- [ ] $50-200/mes (estándar)
- [ ] $200-500/mes (profesional)
- [ ] > $500/mes (enterprise)
- [ ] Flexible / por definir

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 7: Seguridad y Compliance

### 7.1 Requerimientos de Seguridad

**Pregunta**: ¿Hay requerimientos específicos de seguridad o compliance?

- [ ] **GDPR** (General Data Protection Regulation - Europa)
- [ ] **CCPA** (California Consumer Privacy Act)
- [ ] **ISO 27001**
- [ ] **SOC 2**
- [ ] **HIPAA** (salud)
- [ ] **PCI DSS** (pagos con tarjeta)
- [ ] Ninguno específico
- [ ] Otros: _____

**Impacto**: Determina medidas de seguridad adicionales, encriptación, audit logs, etc.

**Respuesta**: ________________________________

---

### 7.2 Datos Sensibles

**Pregunta**: ¿Qué tipo de datos sensibles manejarán?

- [ ] **Información Personal Identificable (PII)**: nombres, emails, teléfonos
- [ ] **Información Financiera**: ingresos de clientes, presupuestos
- [ ] **Información de Pago**: tarjetas de crédito, cuentas bancarias
- [ ] **Datos de Salud**: información médica (HIPAA)
- [ ] Solo datos de negocio estándar

**Si manejan info de pago**:
- ¿Procesarán pagos en el CRM? [ ] Sí [ ] No

**Respuesta**: ________________________________

---

### 7.3 Backup y Disaster Recovery

**Pregunta**: ¿Cuál es el nivel de criticidad de los datos?

- [ ] **Crítico**: Necesitamos backups diarios, recovery time <4 horas
- [ ] **Importante**: Backups cada 2-3 días, recovery time <24 horas
- [ ] **Estándar**: Backups semanales, recovery time flexible

**¿Necesitan disaster recovery plan formal?** [ ] Sí [ ] No

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 8: Equipo y Recursos

### 8.1 Equipo de Desarrollo

**Pregunta**: ¿Quién desarrollará el CRM?

- [ ] **Equipo interno**: _____ developers
  - Frontend: _____ personas
  - Backend: _____ personas
  - DevOps: _____ personas
  - QA: _____ personas

- [ ] **Outsourcing/Consultora**
- [ ] **Mixto** (interno + externo)
- [ ] **Solo tú** (Freddy)
- [ ] Por definir

**Respuesta**: ________________________________

---

### 8.2 Diseñador UI/UX

**Pregunta**: ¿Cuentan con diseñador UI/UX?

- [ ] Sí, tenemos diseñador disponible
- [ ] No, esperamos mockups básicos de desarrollo
- [ ] Podemos contratar si es necesario

**Si "Sí"**:
- ¿Puede crear wireframes y prototipos en Figma? [ ] Sí [ ] No

**Respuesta**: ________________________________

---

### 8.3 Product Owner / Stakeholder

**Pregunta**: ¿Quién tomará las decisiones de producto?

- [ ] Tú (Freddy Molina)
- [ ] Otro: _________________ (nombre y rol)
- [ ] Comité / equipo

**Disponibilidad para reuniones de seguimiento**:
- [ ] Diarias (stand-ups)
- [ ] 2-3 veces por semana
- [ ] Semanal
- [ ] Bi-semanal

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 9: Timeline y Presupuesto

### 9.1 Fecha Crítica de Lanzamiento

**Pregunta**: ¿Hay una fecha límite crítica para el lanzamiento?

- [ ] **Flexible**: cuando esté listo y con calidad
- [ ] **Deadline sugerido**: _________________ (fecha)
- [ ] **Deadline fijo (no negociable)**: _________________ (fecha)

**Si hay deadline fijo**:
- ¿Razón? (demo a clientes, evento, compromiso contractual, etc.)
- ¿Podemos reducir alcance si es necesario para cumplir fecha? [ ] Sí [ ] No

**Respuesta**: ________________________________

---

### 9.2 Presupuesto del Proyecto

**Pregunta**: ¿Hay presupuesto estimado para el desarrollo?

- [ ] **Proyecto interno** (sin presupuesto definido)
- [ ] **Cliente externo**: _________________ (monto)
- [ ] **Presupuesto flexible**: depende del alcance
- [ ] **Presupuesto fijo**: $________________ USD

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 10: Customización y Flexibilidad

### 10.1 Campos Personalizados

**Pregunta**: ¿Qué tan importante es que los usuarios finales puedan crear campos personalizados?

- [ ] **Crítico**: Necesitamos que los usuarios puedan añadir campos custom sin desarrollo
- [ ] **Importante**: Sería útil pero puede ser Fase 2
- [ ] **No prioritario**: Los campos estándar son suficientes

**Impacto**: Determina si implementamos sistema de custom fields dinámicos.

**Respuesta**: ________________________________

---

### 10.2 Workflows Personalizados

**Pregunta**: ¿Necesitan que los usuarios puedan crear workflows/automatizaciones custom?

- [ ] Sí, con workflow builder visual
- [ ] Sí, pero pueden ser workflows predefinidos configurables
- [ ] No, workflows fijos son suficientes

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 11: Framework vs Custom

### 11.1 Aproximación de Desarrollo

**Pregunta**: ¿Cuál aproximación prefieres?

- [ ] **Opción A**: Desarrollo 100% custom (recomendado)
  - Pros: Máximo control, código limpio, fácil de mantener
  - Contras: Más tiempo inicial (12-16 semanas)

- [ ] **Opción B**: Partir de framework CRM open-source (EspoCRM, Twenty)
  - Pros: Más rápido (6-10 semanas), features básicas ya hechas
  - Contras: Menos flexibilidad, curva de aprendizaje del framework

- [ ] **Opción C**: Low-code platform (Retool, Bubble, Budibase)
  - Pros: Muy rápido (3-5 semanas), sin mucho código
  - Contras: Vendor lock-in, limitaciones, costos recurrentes

**Mi recomendación para tu caso**: **Opción A** (desarrollo custom)
- Tienes el expertise técnico
- Control total para integración SAP futura
- Base sólida para SaaS si es el objetivo

**Respuesta**: ________________________________

---

## ✅ SECCIÓN 12: Prioridades y Trade-offs

### 12.1 Qué es más importante

**Pregunta**: Si tuvieras que elegir, ¿qué es más importante?

**Priorizar** (1=Más importante, 5=Menos importante):

- _____ **Time to Market**: Lanzar rápido aunque sea con menos features
- _____ **Feature Completeness**: Tener todas las funcionalidades, aunque tome más tiempo
- _____ **Code Quality**: Código limpio, bien testeado, mantenible
- _____ **UX/Design**: Experiencia de usuario pulida y hermosa
- _____ **Performance**: Sistema ultra-rápido y optimizado

**Respuesta**: ________________________________

---

## 📊 RESUMEN DE DECISIONES CRÍTICAS

Una vez respondidas todas las preguntas, aquí está el resumen de las decisiones más importantes:

### Decisión 1: Alcance
- [ ] Single-tenant (uso interno)
- [ ] Multi-tenant (SaaS para clientes)

### Decisión 2: Aproximación
- [ ] Desarrollo 100% custom
- [ ] Framework open-source
- [ ] Low-code platform

### Decisión 3: Integraciones MVP
- Email: [ ] Sí [ ] No
- Calendario: [ ] Sí [ ] No
- SAP B1: [ ] Sí [ ] No
- Otras: ________________________________

### Decisión 4: Stack
- Backend: ________________
- Frontend State: ________________
- ORM: ________________
- UI Library: ________________

### Decisión 5: Hosting
- Provider: ________________
- Presupuesto mensual: ________________

### Decisión 6: Timeline
- Deadline: ________________
- Flexible: [ ] Sí [ ] No

---

## 📅 PRÓXIMOS PASOS

Una vez respondidas estas preguntas:

1. **Yo (Claude)** ajustaré el plan de trabajo según las respuestas
2. **Refinaremos** el alcance del MVP
3. **Priorizaremos** features críticas vs nice-to-have
4. **Estimaremos** timeline realista basado en equipo y recursos
5. **Iniciaremos** Fase 1 con diseño y wireframes

---

## 📧 Cómo Responder

Puedes responder de estas formas:

1. **Editar este archivo** directamente con tus respuestas
2. **Crear un nuevo archivo** `RESPUESTAS.md` con las respuestas
3. **Agendar una reunión** de 1-2 horas para discutir en vivo
4. **Enviar por email** las respuestas

**Tiempo estimado para responder**: 30-60 minutos

---

**Última actualización**: 2026-01-15
**Versión**: 1.0

---

**Nota**: No hay respuestas "correctas" o "incorrectas". Cada decisión tiene trade-offs. El objetivo es entender tus necesidades y prioridades para diseñar la mejor solución.

**¡Gracias por tu tiempo! Una vez tengamos las respuestas, podemos proceder con confianza al desarrollo. 🚀**
