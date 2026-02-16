# STIA CRM - Estado del Diseño (Feb 2026)

## Resumen
CRM para STIA (Soluciones al Procesar Alimentos) diseñado en Pencil (.pen).
26 pantallas completadas con datos reales de SAP Business One Service Layer.
Multi-país: Costa Rica, Guatemala, El Salvador, Honduras, Panamá.

## Archivo de Diseño
- **Editor:** Pencil (acceso via MCP tools)
- **Archivo:** stia-crm.pen
- **Para abrir:** usar `mcp__pencil__open_document` con el path del archivo

## Pantallas (26 total)

### Grid de posiciones en el canvas
| Posición | x:0 | x:1540 | x:3080 | x:4620 | x:6160 | x:7700 |
|----------|-----|--------|--------|--------|--------|--------|
| y:0 | Dashboard Light | Customer 360 | Login | Casos | Ofertas Perdidas | Trazabilidad |
| y:1060 | Dashboard Dark | Contactos | Prospectos | Dash Logística | Cuentas | Calendario |
| y:2120 | Pipeline | Cotizaciones | Pedidos | Detalle Cotización | Det. Pedido | Det. Factura |
| y:3180 | Facturas | Actividades | Productos | Reportes | Det. Caso | Dash Servicio |
| y:4240 | Configuración | Notificaciones | | | | |

### IDs de pantallas
| Pantalla | ID | Descripción |
|----------|-----|-------------|
| Dashboard Light | mszza | Panel de ventas con KPIs, gráficos por país y categoría |
| Dashboard Dark | a3aaG | Versión dark mode del panel de ventas |
| Customer 360 | fRLqI | Vista completa del cliente con tabs, BPF de venta activo |
| Login | 7N9fe | Pantalla de login con branding STIA |
| Contactos | jK1mb | Lista de contactos con KPIs, filtros por país, estados |
| Prospectos | mydtL | Gestión de clientes potenciales |
| Pipeline | jZU1W | Kanban de oportunidades (4 columnas + conversión) |
| Cotizaciones | xaZjy | Lista de cotizaciones con estados |
| Detalle Cotización | GXIZC | COT-29171, BPF de cotización, líneas, totales |
| Pedidos | 6kY1S | Lista de pedidos con seguimiento |
| Facturas | xh0LW | Lista de facturas |
| Actividades | gAHCe | Gestión de actividades y tareas |
| Productos | cXjiR | Catálogo con imágenes stock de equipos industriales |
| Casos | IoAQJ | Gestión de casos de soporte |
| Ofertas Perdidas | SPEqW | Análisis de ofertas perdidas |
| Trazabilidad | lekBG | Seguimiento de productos/lotes |
| Dash Logística | oaq4L | Dashboard de envíos, estados, países |
| Reportes | VCcoo | Reportes con KPIs, ventas por país y vendedor |
| Cuentas | Zm1GF | Lista de cuentas con KPIs (87 total), tabla con empresas por país |
| Calendario | isOvs | Vista mensual Feb 2026, eventos de actividades, KPIs del día/semana |
| Detalle Pedido | 9idUc | PED-14523, BPF 5 etapas (En Producción), líneas, timeline |
| Detalle Factura | RmrXJ | FAC-28734, BPF 4 etapas (Pagada), líneas, pagos recibidos |
| Detalle Caso | VOPUZ | CAS-5892, prioridad alta, SLA warning, timeline interacciones |
| Dashboard Servicio | cKcOs | KPIs soporte (24 casos, 94.2% SLA), donut categorías, tendencia semanal |
| Configuración | oEiNq | Tabs (Perfil/Empresa/Usuarios/Integraciones), formulario, seguridad, avatar |
| Notificaciones | aoBwW | Lista con secciones Hoy/Ayer, filtros por categoría, 7 notificaciones |

## Componente Reutilizable: Navegación
- **ID:** ZwCF4 (en Dashboard Light, reusable: true)
- **Estructura estándar (3 secciones, 13 items):**
  ```
  PRINCIPAL: Panel, Cuentas, Contactos, Prospectos, Embudo
  COMERCIAL: Cotizaciones, Pedidos, Facturas, Actividades, Productos
  GESTIÓN: Casos, Trazabilidad, Logística
  ```
- Todas las 16 pantallas (excepto Login) usan copias de este componente
- Cada pantalla tiene el item correspondiente resaltado como activo

### IDs de items de navegación (en el componente fuente ZwCF4)
| Item | Frame ID | Icon ID | Text ID |
|------|----------|---------|---------|
| Panel | jVd7I | svRsh | kyod6 |
| Cuentas | 1yk0h | WnYrt | JXewn |
| Contactos | 2zjCJ | TlxVQ | xASmv |
| Prospectos | 3OMxD | ohY7W | hHFsR |
| Embudo | DLUdr | 5ppx4 | J29Uu |
| Cotizaciones | KcCa2 | 7CxAx | zzsyI |
| Pedidos | QMkjk | w4gQP | UGxx1 |
| Facturas | VcIId | BPIVG | sJnBs |
| Actividades | 3rDye | NXANF | ktaCO |
| Productos | GxFJ5 | w3P7R | ERAXE |
| Casos | E02fO | zcj8T | 1O0qU |
| Trazabilidad | oskBi | SABeQ | yvpnD |
| Logística | udnCD | piH1f | PeGG1 |

## Variables de Diseño
```
--primary: #0067B2
--bg-sidebar: #0A0F1A
--bg-page: #F8FAFC
--bg-card: #FFFFFF
--text-primary: #0F172A
--text-secondary: #64748B
--text-muted: #94A3B8
--text-sidebar: #8899AA
--border: #E2E8F0
--success: #10B981
--error: #EF4444
--warning: #F59E0B
--bg-sidebar-active: #0067B2
--bg-sidebar-hover: #142238
--border-sidebar: #1A2D47
--font-display: Inter
```

## Pantallas Nuevas (Ronda 2 — 8 de 8)
1. **Cuentas** - Lista de empresas con KPIs, tabla con datos de 5 países
2. **Calendario** - Vista mensual con eventos de actividades CRM
3. **Detalle Pedido** - BPF 5 etapas, líneas de producto, totales, timeline
4. **Detalle Factura** - BPF 4 etapas completadas, pagos recibidos
5. **Detalle Caso** - SLA warning, timeline de interacciones, info del caso
6. **Dashboard Servicio** - KPIs de soporte, gráfico donut, tendencia semanal, tabla casos
7. **Configuración** - Perfil con formulario, seguridad 2FA, avatar, preferencias toggles
8. **Notificaciones** - Lista categorizada con estados leído/no leído, filtros

## Mejoras Implementadas (10 de 10)
1. **Detalle Cotización** - Pantalla nueva con BPF, líneas de producto, totales
2. **Contactos mejorados** - KPIs (342 total, 218 activos), filtros por país, columna Estado
3. **Imágenes en Productos** - Stock images para 5 tarjetas de productos
4. **BPF en Customer 360** - Barra de proceso de venta activo (5 etapas)
5. **Dashboard Logística** - Pantalla nueva con envíos, estados, timeline
6. **Dashboards unificados** - Light y Dark muestran mismos KPIs y categorías
7. **Sidebar estandarizado** - 16 pantallas con navegación idéntica (componente)
8. **Notificaciones** - Campana con badge en 15 top bars
9. **Pipeline mejorado** - Barra conversión, totales por columna, 2 tarjetas nuevas
10. **Pantalla Reportes** - KPIs, ventas por país, top 5 vendedores

## Cómo Reanudar el Trabajo
1. Abrir el archivo .pen: `mcp__pencil__open_document("stia-crm.pen")`
2. Ver estado del editor: `mcp__pencil__get_editor_state({include_schema: false})`
3. Listar pantallas: `mcp__pencil__batch_get({filePath: "stia-crm.pen"})`
4. Para modificar una pantalla, leer su ID de la tabla arriba y usar batch_get/batch_design
5. Para agregar pantallas nuevas, usar find_empty_space_on_canvas y seguir el patrón 1440x960

## Conexión SAP
- URL: https://sap-stiacmzdr-sl.skyinone.net:50000/b1s/v1
- 5 bases de datos: CR, GT, SV, HN, PA
- Servicio en: backend/src/services/sap.service.ts
- Config empresas: backend/src/config/companies.ts

## Cliente
- **Grecia Rosales** (marketing@stia.net) - Área de Mercadeo y Ventas
- Referencia: demo de Microsoft Dynamics 365 Sales (Altec)
- Módulos solicitados: Paneles, Actividades, Cuentas, Contactos, Clientes potenciales, Oportunidades, Ofertas, Pedidos (con logística), Facturas, Productos, Casos
