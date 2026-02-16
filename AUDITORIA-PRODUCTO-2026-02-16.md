# STIA CRM - Auditoria de Producto & Planes Pendientes

**Fecha:** 16 de Febrero 2026
**Ambiente:** xy.bluesystem.io (AWS EC2)
**Stack:** React 19 + Fastify 5 + Prisma + PostgreSQL + SAP B1 Service Layer
**Paises:** Costa Rica, Guatemala, El Salvador, Honduras, Panama

---

## PARTE 1: Auditoria del Gerente de Ventas

### 1.1 Visibilidad del Equipo (Scorecard)

**Estado actual:** Tabla ranqueada de vendedores con cotizaciones, pedidos, facturacion, ticket promedio, tasa de conversion y tasa de cobro. Grafico de barras comparativo. Deteccion de bajo rendimiento.

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Sin selector de periodo | **P1** | Fijo a 6 meses. Necesita mes/trimestre/ano/custom |
| Sin metas de venta por vendedor | **P1** | Numeros sin contexto. No hay cuotas ni objetivos |
| Sin tendencia temporal | **P1** | No hay mes a mes por vendedor. No se ve mejora/declive |
| Sin metricas de actividad por vendedor | **P2** | No se ven llamadas, reuniones, correos por persona |
| Sin drill-down de vendedor a sus cuentas | **P2** | Clic en fila no hace nada |
| Sin exportar/imprimir | **P2** | No se puede compartir en reunion semanal |

### 1.2 Pipeline (Embudo de Ventas)

**Estado actual:** Kanban drag-and-drop con 5 columnas. Cada tarjeta muestra nombre, cuenta, monto, fecha cierre, probabilidad. Datos de Prisma (no SAP).

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Sin columna "Perdido" | **P0** | No hay CLOSED_LOST. Deals perdidos no se rastrean |
| Sin deteccion de deals estancados | **P0** | No hay indicador visual para deals sin movimiento en X dias |
| Sin filtro por vendedor | **P1** | Se ven todas las oportunidades sin poder filtrar |
| Sin filtro por fecha/monto | **P1** | No se puede acotar por rango de fecha o tamano |
| Sin resumen/totales del pipeline | **P1** | No hay valor total, ponderado ni funnel de conversion |
| Lost Deals es placeholder | **P1** | Pagina muestra "Proximamente" |
| Formulario nueva oportunidad incompleto | **P2** | Boton existe pero no abre formulario |
| Sin conexion a cotizaciones SAP | **P2** | Oportunidades solo en Prisma, sin enlace a SAP |

### 1.3 Forecasting (Pronostico)

**Estado actual:** 4 KPIs (Pipeline Total, Ponderado, Win Rate, Deal Size promedio). Grafico mensual. Tabla por etapa. Datos de Prisma, no SAP.

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Sin ajuste manual del forecast | **P1** | No se puede sobreescribir la proyeccion |
| Sin comparacion contra meta | **P1** | Sin linea de objetivo en el grafico |
| Desconectado de ingresos SAP | **P1** | No incluye facturacion real como base comprometida |
| Sin niveles de confianza | **P2** | Sin best/most likely/worst case |
| Sin forecast por vendedor | **P2** | No se ve quien contribuye al numero |

### 1.4 Cliente 360

**Estado actual:** Vista detallada con KPIs (Revenue 12m, Pedidos, Saldo, Ticket Promedio), tabs de ordenes/facturas/cotizaciones/productos, sidebar con contacto y timeline.

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Sin lista de contactos | **P1** | No se ven los decision-makers de la cuenta |
| Sin credito/terminos de pago | **P1** | No se muestra CreditLimit ni PayTermsGrpCode de SAP |
| Sin casos de soporte | **P2** | No se ven tickets abiertos del cliente |
| Sin grafico de tendencia revenue | **P2** | Solo numero agregado, no mes a mes |
| Dos vistas 360 distintas | **P2** | AccountDetail y SalesManager Client360Tab duplican logica |

### 1.5 Reportes

**Estado actual:** 4 KPIs, donut top clientes, barras revenue mensual, tabla top vendedores. Aging report separado con buckets 0-30/31-60/61-90/90+.

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Sin selector de rango de fechas | **P0** | Hardcoded a 6 meses |
| Sin exportar a PDF/Excel | **P0** | window.print() no es aceptable |
| Sin filtro por vendedor/pais | **P1** | No se puede segmentar |
| Sin comparacion YoY/MoM | **P1** | No hay delta periodo anterior |
| Sin ventas por categoria de producto | **P2** | No hay revenue por familia |
| Sin margen/rentabilidad | **P2** | Solo top-line |

### 1.6 Alertas & Notificaciones

**Estado actual:** MyDaySection con datos reales (facturas vencidas, cotizaciones por vencer, actividades del dia). NotificationsPage es 100% mock data.

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Notificaciones son falsas | **P0** | NotificationsPage usa datos hardcoded. Sin backend real |
| Sin alertas push/real-time | **P0** | Solo se ven alertas al navegar a la pagina |
| Sin preferencias de notificacion | **P1** | No hay config de que alertar y por que canal |
| Umbrales hardcoded | **P2** | conversion < 25% y collection < 50% fijos en codigo |

### 1.7 Flujo Cotizacion-a-Pedido

**Estado actual:** BPF en QuoteDetail y OrderDetail. Linked documents bidireccionales. Creacion de cotizacion funcional con SAP.

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Sin metricas de conversion agregadas | **P1** | Solo se ve por documento individual |
| Sin boton "Copiar a Pedido" | **P1** | No hay CopyTo desde el CRM |
| Sin tracking tiempo-a-conversion | **P2** | No se mide dias promedio quote->order |
| Sin captura de razon de perdida | **P2** | BPF no tiene paso "Rechazada" con motivo |

### 1.8 Actividades

**Estado actual:** Lista plana con filtro por tipo (Call/Email/Meeting/Task), toggle completadas, creacion de actividades. Datos de Prisma local.

| Gap | Prioridad | Detalle |
|-----|-----------|---------|
| Sin metricas de actividad por vendedor | **P0** | No se puede ver esfuerzo del equipo |
| Sin vincular cuenta/contacto en creacion | **P1** | Formulario no tiene selector de cliente |
| Sin sync a SAP Activities | **P1** | Actividades solo en Prisma, no en SAP |
| Sin metas de actividad | **P2** | Sin "20 llamadas/semana por vendedor" |
| Sin filtro por propietario | **P2** | Gerente ve todas pero no puede filtrar por persona |

---

## PARTE 2: Auditoria del Dueno/CEO

### 2.1 Dashboard Ejecutivo

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Sin vista ejecutiva consolidada | **ALTO** | CEO ve Ventas O Logistica O Servicio, nunca todo junto |
| Sin comparacion YoY | **ALTO** | Solo % cambio mes anterior |
| Sin gestion de metas | **ALTO** | Target es auto-calculado como promedio 6 meses |
| Dashboard Logistica es fake | **ALTO** | LogisticsDashboard.tsx tiene KPIs 100% hardcoded |
| SLA Servicio hardcoded | **MEDIO** | "98% SLA Cumplido" es un numero estatico |

### 2.2 Visibilidad Multi-Pais

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Sin company switcher visible | **ALTO** | No hay selector de empresa en la navegacion principal |
| Filtro de pais no funciona | **ALTO** | Boton "Aplicar Filtros" solo cierra el modal |
| Sin comparacion cross-country | **ALTO** | No se pueden ver los 5 paises lado a lado |
| Moneda siempre USD | **ALTO** | Guatemala=GTQ, Honduras=HNL pero todo muestra USD |
| Panama es placeholder | **MEDIO** | Base de datos pendiente de confirmar |

### 2.3 Revenue & Rentabilidad

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Cero datos de rentabilidad | **CRITICO** | No se consulta GrossProfit ni ItemCost de SAP. Solo DocTotal |
| Sin margen por producto | **CRITICO** | Product mapping no incluye campos de costo |
| Sin analisis de margen por cliente | **ALTO** | No se sabe que clientes son rentables |
| Sin alertas de margen bajo | **ALTO** | Deals con descuento excesivo pasan sin aviso |

### 2.4 Salud del Cliente

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Sin tendencia revenue por cliente | **MEDIO** | Solo total agregado, no curva mensual |
| Sin score de riesgo de churn | **MEDIO** | "Dias sin contacto" existe pero sin modelo de riesgo |
| Sin segmentacion ABC | **MEDIO** | No hay clasificacion por contribucion de revenue |
| Sin analisis de cohorte | **BAJO** | No se rastrea comportamiento por periodo de adquisicion |

### 2.5 Productividad del Equipo

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Sin correlacion actividad-revenue | **MEDIO** | Se ven actividades y revenue pero no la relacion |
| Sin comparacion temporal | **MEDIO** | Scorecard fijo a 6 meses sin cambio de periodo |
| Sin cuotas individuales | **MEDIO** | No se puede medir % de meta alcanzado |
| Sin velocidad del pipeline | **MEDIO** | No se mide dias promedio por etapa |

### 2.6 Cash Flow / Cobranza

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Sin DSO (Days Sales Outstanding) | **MEDIO** | El diseno lo menciona pero el codigo no lo calcula |
| Sin tendencia de aging | **MEDIO** | Solo snapshot puntual, sin historico |
| Sin proyeccion de flujo de caja | **MEDIO** | No se ven ingresos esperados por fecha |
| Sin asignacion de cobrador | **MEDIO** | Facturas vencidas sin responsable de gestion |

### 2.7 Rendimiento de Producto

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Sin analytics de producto a nivel global | **ALTO** | Solo se ve top productos por cliente individual |
| Sin margen por producto | **ALTO** | Cero campos de costo en consultas SAP |
| Sin agrupacion por categoria | **MEDIO** | ItemsGroupCode se almacena pero no se resuelve |
| Sin alertas de stock bajo | **MEDIO** | Stock se muestra pero no hay umbrales |
| Botones no funcionales | **BAJO** | "Sincronizar SAP" y "Nuevo Producto" sin onClick |

### 2.8 Adopcion & Uso

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Zero tracking de uso | **ALTO** | No hay registro de logins, page views ni sesiones |
| Sin lastLoginAt | **ALTO** | No se sabe si el equipo usa el CRM |
| Sin metricas por feature | **MEDIO** | No se sabe que paginas se usan vs ignoran |
| Sin scorecard de adopcion | **MEDIO** | No hay metrica de actividades registradas por persona |

### 2.9 Acceso Movil

| Gap | Impacto | Detalle |
|-----|---------|---------|
| No es PWA real | **MEDIO** | manifest.json existe pero sin service worker |
| Navegacion problematica en movil | **MEDIO** | Scroll horizontal para 9+ items de nav |
| Sin offline | **MEDIO** | Vendedores sin conectividad no pueden ver datos |

### 2.10 Calidad de Datos & SAP

| Gap | Impacto | Detalle |
|-----|---------|---------|
| Sin monitoreo de completitud | **MEDIO** | No se sabe cuantos clientes les falta telefono/email |
| Contact count siempre 0 | **MEDIO** | mapAccount hardcodea _count: { contacts: 0 } |
| Traceability es placeholder | **MEDIO** | Pagina dice "Proximamente" |
| Lost Deals es placeholder | **MEDIO** | Pagina dice "Proximamente" |
| Cache de SalesPersons sin TTL | **BAJO** | Requiere restart si se agregan vendedores en SAP |

---

## PARTE 3: Planes y Documentos Pendientes

### 3.1 BATALLA-CRM-MEJORAS.md
**Estado:** PENDIENTE - 15 gaps mayores identificados
- 5 pantallas con datos 100% falsos
- Vendedores no pueden crear cotizaciones
- Sin margen/precios en productos
- Sin trazabilidad Quote->Order->Invoice
- Sin metas de venta
- Plan de 3 sprints (6 semanas)
- Madurez actual: 4.5/10 -> Meta: 9.5/10

### 3.2 INFORME-GAPS-SAP.md
**Estado:** PENDIENTE - 23 gaps de datos en SAP
- Activities: 15% completitud (solo 3 registros CR)
- BusinessPartners: 40% (Industria vacia, SalesPersonCode sin asignar)
- ContactEmployees: 25% (nombres genericos)
- Items: 50% (30% con precio $0)
- Esfuerzo: 40-70 horas de limpieza de datos (sin codigo)

### 3.3 AUDIT-REPORT.md (Seguridad)
**Estado:** BLOQUEADO - 3 issues criticos
1. **Multi-company data isolation FALTANTE** - Todos ven todos los datos
2. **RBAC no implementado** - Cualquier usuario autenticado puede hacer todo
3. **Zero cobertura de tests** - Backend 0, Frontend 0
- Plan de regularizacion: 3 semanas

### 3.4 PLAN_DE_TRABAJO.md
**Estado:** PENDIENTE - Roadmap de 14 semanas
- Semanas 1-2: Diseno y planificacion
- Semana 3: Setup y fundaciones
- Semanas 4-9: Desarrollo core
- Semanas 10-11: Features avanzados
- Semanas 12-13: Testing y polish
- Semana 14: Deploy y documentacion

### 3.5 PREGUNTAS_CRITICAS.md
**Estado:** SIN RESPONDER - 12 secciones de decisiones
- Single-tenant vs Multi-tenant SaaS?
- Priorizacion de modulos?
- Datos a migrar?
- Integraciones requeridas?
- Compliance (GDPR, ISO)?
- Timeline y presupuesto?

### 3.6 .conductor/status-report.md
**Estado:** Tracks activos
- conductor-reconciliation: 100% completado
- backend-core-features: 85% (tests pendientes)
- backend-crm-implementation: 70% (kanban, workflows, SAP sync)
- visual-ux-overhaul: 70% (glassmorphism, a11y)
- frontend-i18n: 0% (listo para iniciar)

---

## PARTE 4: Mejoras Implementadas en esta Sesion (P0-P3)

### Completado Hoy

| # | Item | Pagina | Estado |
|---|------|--------|--------|
| P0.1 | Seccion "Mi Dia" con datos SAP reales | Dashboard | DONE |
| P0.2 | Filas de cuentas clickeables | Accounts | DONE |
| P1.1 | Stats globales de facturacion | Invoices | DONE |
| P1.2 | Filtros funcionales (status + fecha) con OData | Quotes | DONE |
| P1.3 | Calendario con datos SAP reales | Calendar | DONE |
| P1.4 | Columnas renombradas + vendedor visible | Accounts | DONE |
| P2.1 | Busqueda funcional en pedidos | Orders | DONE |
| P2.2 | Click-to-call/mailto en contactos | Contacts | DONE |
| P2.3 | Filtros funcionales en actividades | Activities | DONE |
| P3.1 | Saludo personalizado por hora del dia | Dashboard | DONE |
| -- | Ayuda actualizada para todas las paginas | Help System | DONE |
| -- | Fix defensivo avatar owner vacio | Accounts | DONE |

---

## PARTE 5: Top 10 Prioridades Recomendadas (Siguiente Sprint)

| # | Prioridad | Area | Issue | Esfuerzo |
|---|-----------|------|-------|----------|
| 1 | **P0** | Seguridad | RBAC + Data Isolation (AUDIT-REPORT blockers) | Grande |
| 2 | **P0** | Rentabilidad | Agregar GrossProfit/ItemCost de SAP | Mediano |
| 3 | **P0** | Alertas | NotificationsPage usa mock data. Sin sistema real | Grande |
| 4 | **P0** | Reportes | Sin selector de rango de fechas en ningun reporte | Pequeno |
| 5 | **P0** | Reportes | Sin exportar real. window.print() no sirve | Mediano |
| 6 | **P0** | Pipeline | Sin CLOSED_LOST ni deteccion de deals estancados | Mediano |
| 7 | **P0** | Actividades | Sin metricas de actividad por vendedor | Mediano |
| 8 | **P1** | Multi-Pais | Company switcher + comparacion cross-country | Grande |
| 9 | **P1** | Equipo | Metas de venta por vendedor + periodo selector | Mediano |
| 10 | **P1** | Cotizaciones | Boton "Copiar a Pedido" (CopyTo SAP) | Mediano |

---

## Matriz de Madurez

| Area | Madurez | Observacion |
|------|---------|-------------|
| Dashboard Ventas | 7/10 | MyDay real, Forecast real, falta metas |
| Dashboard Logistica | 1/10 | 100% fake data |
| Dashboard Servicio | 3/10 | SLA hardcoded |
| Cuentas | 7/10 | Click, vendedor, 360 real |
| Contactos | 6/10 | Click-to-call, falta linkage |
| Cotizaciones | 8/10 | Creacion SAP real, filtros, BPF |
| Pedidos | 6/10 | Busqueda funcional, stepper |
| Facturas | 7/10 | Stats globales, aging real |
| Actividades | 5/10 | Filtros funcionales, sin SAP sync |
| Pipeline | 4/10 | Kanban funcional, sin CLOSED_LOST |
| Forecast | 5/10 | Datos Prisma, desconectado SAP |
| Reportes | 4/10 | Sin date range, sin export |
| Notificaciones | 1/10 | 100% mock data |
| Productos | 3/10 | Catalogo basico, sin analytics |
| Calendario | 7/10 | Datos SAP reales |
| Configuracion | 4/10 | UI existe, sin backend |
| Seguridad (RBAC) | 2/10 | Roles existen, no se aplican |
| Multi-Pais | 3/10 | Backend preparado, UI no funcional |
| Testing | 0/10 | Zero tests |
| Adopcion/Metricas | 0/10 | Zero tracking |

**Score General: 4.4/10**

---

*Generado automaticamente por auditoria de producto STIA CRM*
*Agentes: Gerente de Ventas + Dueno/CEO + Explorador de Planes*
