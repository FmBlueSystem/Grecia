# Flujo del Sistema - Portal Casos STIA

## 1. Flujo de Navegacion

### 1.1 Login → Dashboard
1. Usuario ingresa credenciales SAP (usuario + contraseña)
2. Sistema autentica contra SAP Service Layer (CompanyDB del pais default)
3. Si OK → JWT cookie HttpOnly → redirige a Dashboard
4. Si falla → mensaje "Credenciales invalidas" → queda en login

### 1.2 Dashboard (Home)
- **Al cargar:** consulta ServiceCalls del pais activo, calcula KPIs
- **KPI Cards clickeables:**
  - "Total Casos" → navega a Todos los Casos (sin filtro)
  - "Abiertos" → navega a Todos los Casos filtrado por Estado=Abierto
  - "En Proceso" → navega a Todos los Casos filtrado por Estado=En Proceso
  - "Resueltos" → navega a Todos los Casos filtrado por Estado=Resuelto
- **Tabla "Casos Recientes":** ultimos 10 casos ordenados por fecha desc
  - Click en numero de caso → navega a Detalle de Caso
- **Boton "+ Nuevo Caso"** → navega a formulario Nuevo Caso

### 1.3 Todos los Casos (Lista)
- **Al cargar:** lista paginada de ServiceCalls (20 por pagina), orden fecha desc
- **Filtros disponibles:**
  - Busqueda libre (por numero, titulo, nombre cliente)
  - Estado (Abierto / En Proceso / Resuelto)
  - Prioridad (Alta / Normal / Baja)
  - Area (Ventas / Soporte / Atencion al Cliente / Calidad / Finanzas / Logistica)
- **Acciones por fila:**
  - Click en numero de caso → Detalle de Caso
- **Boton "+ Nuevo Caso"** → formulario Nuevo Caso

### 1.4 Nuevo Caso (Crear)
- **Campos obligatorios:** Titulo, Cliente (lookup SAP BusinessPartners)
- **Campos opcionales con defaults:**
  - Prioridad → default: Normal
  - Tiempo Estimado → default: 48 horas
  - Estado → fijo: Abierto (no editable al crear)
  - Canal de Ingreso, Tipo de Caso, Area Responsable → dropdowns del Excel
  - Persona Contacto, Telefono → texto libre
  - Persona Responsable → lookup SAP EmployeesInfo
  - Detalles → textarea
- **Al guardar:**
  1. POST ServiceCalls a SAP con UDFs
  2. Si OK → redirige a Detalle del caso recien creado
  3. Si falla → mensaje de error, queda en formulario
- **Cancelar** → regresa a Todos los Casos

### 1.5 Detalle de Caso (Ver)
- **Header:** Numero de caso + Estado (badge color)
- **Flujo de proceso:** Identificar → Investigar → Resolver (visual step indicator basado en Estado)
  - Abierto = paso 1 activo
  - En Proceso = paso 2 activo
  - Resuelto = paso 3 completado
- **Informacion del caso:** todos los campos en modo lectura
- **Timeline de notas:** lista cronologica de actividades (ServiceCallNotes)
  - Cada nota muestra: fecha, texto, usuario que la creo
  - Input para agregar nueva nota (POST al ServiceCall)
- **Acciones:**
  - "Editar" → navega a Editar Caso
  - "Resolver Caso" → cambia Status a Resuelto + fecha cierre = hoy
  - "Volver" → regresa a Todos los Casos
- **Indicador SLA:** si el caso supera el tiempo estimado, mostrar badge rojo "Tiempo Excedido"

### 1.6 Editar Caso
- **Mismos campos que Nuevo Caso** pero pre-cargados con datos actuales
- **Campos editables:** todos excepto Numero de caso y Fecha registro
- **Campo adicional:** Estado (dropdown: Abierto / En Proceso / Resuelto)
  - Si cambia a "Resuelto" → auto-set Fecha Cierre = hoy
- **Al guardar:**
  1. PATCH ServiceCalls en SAP
  2. Si OK → redirige a Detalle del caso
  3. Si falla → mensaje de error
- **Cancelar** → regresa a Detalle del caso

### 1.7 Estadisticas
- **Filtros globales:** Rango de fechas (default: ultimos 30 dias) + Pais (default: pais activo, opcion "Todos")
- **Al cambiar filtro:** recalcula todos los charts

### 1.8 SLA & Alertas
- **Al cargar:** consulta todos los casos Abiertos y En Proceso, calcula tiempo transcurrido vs tiempo estimado
- **Filtro:** Pais (default: pais activo)
- **Tabla:** solo casos que superaron o estan por superar el SLA

### 1.9 Country Selector (Global)
- Presente en todas las pantallas del portal (header)
- **Al cambiar pais:**
  1. Login a nueva CompanyDB en SAP Service Layer
  2. Guardar sesion en pool
  3. Recargar datos de la pantalla actual con el nuevo pais
  4. No requiere re-login del usuario

---

## 2. Especificacion de Reportes

### 2.1 Dashboard - KPI Cards

| KPI | Calculo | Fuente |
|-----|---------|--------|
| Total Casos | COUNT(*) ServiceCalls del pais activo | ServiceCalls?$filter=&$count=true |
| Abiertos | COUNT(*) WHERE Status = 'Abierto' | ServiceCalls?$filter=Status eq -3 |
| En Proceso | COUNT(*) WHERE Status = 'En Proceso' | ServiceCalls?$filter=Status eq -2 |
| Resueltos | COUNT(*) WHERE Status = 'Resuelto' | ServiceCalls?$filter=Status eq -1 |

**Nota:** Los codigos de Status en SAP ServiceCalls son: -3 (Open/Abierto), -2 (Pending/En Proceso), -1 (Closed/Resuelto). Se mapean a los nombres en español.

### 2.2 Dashboard - Tabla Casos Recientes

| Columna | Dato | Orden |
|---------|------|-------|
| Numero | ServiceCallID con prefijo pais (CAS-CR####) | - |
| Titulo | Subject | - |
| Cliente | CustomerName (de BusinessPartner) | - |
| Prioridad | Priority (badge: Alta=rojo, Normal=amarillo, Baja=verde) | - |
| Estado | Status (badge: Abierto=azul, En Proceso=amarillo, Resuelto=verde) | - |
| Responsable | TechnicianName (de EmployeesInfo) | - |

**Query:** ServiceCalls?$orderby=CreateDate desc&$top=10&$expand=BusinessPartner,Technician

### 2.3 Graficos del Sistema (referencia CRM - PDF pagina 10)

Los siguientes graficos se replican del sistema CRM de referencia al portal.
Selector global: **Pais** + **Rango de fechas**

---

#### 2.3.1 Casos activos por agente (PDF pag. 9)
- **Tipo:** Barras verticales
- **Eje X:** Propietario (TechnicianName de EmployeesInfo)
- **Eje Y:** Recuento de casos (COUNT)
- **Filtro:** Solo casos con Status = Abierto o En Proceso
- **Referencia visual:** PDF pagina 9 - barra azul por agente

#### 2.3.2 Casos por cuenta
- **Tipo:** Barras verticales
- **Eje X:** Cliente (CustomerName de BusinessPartner)
- **Eje Y:** Recuento de casos
- **Filtro:** Todos los casos del periodo

#### 2.3.3 Casos por estado
- **Tipo:** Pie/Donut chart
- **Segmentos:** Activo (#0067B2), En curso (#F59E0B), Resuelto (#16A34A), Cancelado (#94A3B8)
- **Valor:** COUNT por cada Status
- **Nota:** En el CRM de referencia los estados son: Activo, En curso, Problema resuelto, Cancelado (PDF pag. 1)

#### 2.3.4 Casos por estado de SLA en una semana
- **Tipo:** Barras agrupadas
- **Eje X:** Dias de la semana (Lun a Dom)
- **Eje Y:** Recuento de casos
- **Agrupacion:** Estado del SLA (Dentro de SLA / Fuera de SLA)
- **Calculo SLA:** (hoy - CreateDate) vs U_TiempoEst convertido a horas

#### 2.3.5 Casos por origen (por dia)
- **Tipo:** Barras apiladas o lineas
- **Eje X:** Dias del periodo seleccionado
- **Eje Y:** Recuento de casos creados
- **Series/Colores:** Por Canal de ingreso (Telefono, Correo, Web, WhatsApp, Redes Sociales, Fax)
- **Fuente:** U_Canal / ServiceCallOrigin

#### 2.3.6 Casos por prioridad
- **Tipo:** Barras verticales o Pie
- **Segmentos:** Alta (#DC2626), Normal (#D97706), Baja (#16A34A)
- **Valor:** COUNT por cada Priority

#### 2.3.7 Casos por prioridad (por dia)
- **Tipo:** Lineas o barras apiladas
- **Eje X:** Dias del periodo
- **Eje Y:** Recuento de casos creados
- **Series:** Alta, Normal, Baja (3 lineas/colores)

#### 2.3.8 Casos por prioridad (por propietario)
- **Tipo:** Barras apiladas (stacked bar)
- **Eje X:** Propietario (TechnicianName)
- **Eje Y:** Recuento de casos
- **Segmentos apilados:** Alta (#DC2626), Normal (#D97706), Baja (#16A34A)
- **Lectura:** Para cada responsable, cuantos casos tiene de cada prioridad
- **Ejemplo:** Si "Nancy Salazar" tiene 5 Alta + 8 Normal + 2 Baja, su barra muestra 15 total con 3 colores

#### 2.3.9 Combinacion de casos (por origen)
- **Tipo:** Pie chart
- **Segmentos:** Cada Canal de ingreso (Telefono, Correo, Web, WhatsApp, etc.)
- **Valor:** COUNT por cada U_Canal

#### 2.3.10 Combinacion de casos (por prioridad)
- **Tipo:** Pie chart
- **Segmentos:** Alta, Normal, Baja
- **Valor:** COUNT por cada Priority

#### 2.3.11 Combinacion de casos (por tipo)
- **Tipo:** Pie chart
- **Segmentos:** Cada Tipo de caso (Consulta, Reclamo, Garantia, Servicio de campo, etc.)
- **Valor:** COUNT por cada U_TipoCaso

---

**Nota sobre reportes excluidos de V1:**
Los siguientes reportes del CRM de referencia NO se implementan porque requieren datos que no manejamos en SAP ServiceCalls:
- Casos por producto (no usamos catalogo de productos)
- Casos resueltos con articulos de KB (no usamos knowledge base)
- Combinacion de casos por unidad de negocio (un solo negocio por DB)
- Combinacion de casos por tipo de incidente (usamos U_TipoCaso en su lugar)
- Marcador de servicio (metrica especifica del CRM de referencia)
- Satisfaccion por casos resueltos (no hay encuestas en V1)
- Temas de casos (no usamos temas/topics)

### 2.7 SLA & Alertas - KPI Cards

| KPI | Calculo | Color |
|-----|---------|-------|
| Casos Vencidos | COUNT de casos (Abierto o En Proceso) donde (hoy - CreateDate) > U_TiempoEst | Rojo #DC2626 |
| Por Vencer (24h) | COUNT de casos donde tiempo restante < 24 horas y aun no vencido | Amarillo #D97706 |
| Cumplimiento SLA | (Casos resueltos dentro del tiempo / Total resueltos) * 100 | Verde #16A34A |

**Conversion U_TiempoEst a horas:**
- "24 horas" = 24h
- "48 horas" = 48h
- "72 horas" = 72h
- "1 semana" = 168h
- "2 semanas" = 336h
- "1 mes" = 720h

### 2.8 SLA & Alertas - Tabla de Casos con Alerta

| Columna | Dato |
|---------|------|
| Caso | ServiceCallID con prefijo pais |
| Titulo | Subject |
| Cliente | CustomerName |
| SLA | U_TiempoEst (valor original: "24h", "48h", etc.) |
| Excedido | (hoy - CreateDate) - U_TiempoEst en horas, con signo "+" |
| Alerta | Badge: "Critico" (excedido > 24h, rojo) o "Advertencia" (excedido 0-24h, amarillo) |

**Color de fila:**
- Critico (excedido > 24h): fondo #FEF2F2 (rojo suave)
- Advertencia (excedido 0-24h): fondo #FFFBEB (amarillo suave)

**Orden:** Mayor excedido primero (mas criticos arriba)
**Solo muestra:** Casos con Status Abierto o En Proceso que superaron su SLA

---

## 3. Reglas de Negocio

### 3.1 Estados y Transiciones
```
Abierto ──▶ En Proceso ──▶ Resuelto
   │                          ▲
   └──────────────────────────┘
   (puede saltar directo a Resuelto)
```
- No se puede reabrir un caso Resuelto
- Al cambiar a Resuelto: Fecha Cierre = fecha actual automatico

### 3.2 Numeracion de Casos
- Formato: CAS-{PAIS}{ID_SAP_PADDED}
- Ejemplo: CAS-CR0143, CAS-GT0089, CAS-SV0012
- El ID viene de ServiceCallID de SAP (auto-incremental)
- El prefijo pais se agrega en frontend basado en el pais activo

### 3.3 Alertas SLA
- Se calcula en tiempo real al cargar la pagina
- Tiempo transcurrido = NOW() - CreateDate (en horas)
- Tiempo SLA = conversion de U_TiempoEst a horas
- Excedido = Tiempo transcurrido - Tiempo SLA
- Si Excedido > 0 y Status != Resuelto → caso aparece en alertas
- Nivel: Critico si Excedido > 24h, Advertencia si Excedido 0-24h

### 3.4 Lookups SAP
- **BusinessPartners:** busqueda por CardCode o CardName, mostrar CardName + Phone1
- **EmployeesInfo:** busqueda por FirstName o LastName, mostrar nombre completo + Department
- Ambos lookups filtran por la CompanyDB del pais activo

### 3.5 Multi-pais
- Cada pais = una CompanyDB separada en SAP
- Los datos NO se cruzan entre paises (cada pais es independiente)
- La unica excepcion: la pantalla de Estadisticas puede mostrar "Todos los paises" (consolida queries a las 5 DBs)
- El pais activo se guarda en cookie/localStorage y persiste entre sesiones

### 3.6 Permisos
- V1: todos los usuarios autenticados pueden hacer todo (CRUD + reportes)
- El usuario SAP "Consultas" tiene acceso de lectura/escritura a ServiceCalls
- No hay roles diferenciados en V1 (se agrega en V2 si se requiere)

### 3.7 Timeline de Notas
- Cada ServiceCall puede tener N notas (ServiceCallActivities)
- Al agregar nota: POST con texto + usuario actual + timestamp
- Las notas no se pueden editar ni eliminar despues de creadas
- Se muestran en orden cronologico descendente (mas reciente arriba)
- Notas internas (solo equipo) vs externas (visibles al cliente)

---

## 4. Sistema de Parametros y Automatizaciones

### 4.1 Tabla de Configuracion

Tabla `casos.settings` en PostgreSQL con key-value (jsonb). Cache en memoria con TTL de 60 segundos.

| Parametro | Tipo | Default | Descripcion |
|---|---|---|---|
| `portal_base_url` | text | https://casos.stia.net | URL base usada en links de emails |
| `smtp_host` | text | smtp.gmail.com | Servidor SMTP para notificaciones |
| `smtp_port` | number | 587 | Puerto SMTP |
| `smtp_user` | text | (vacio) | Usuario SMTP - si vacio, no se envian emails |
| `smtp_pass` | password | (vacio) | Contrasena SMTP |
| `smtp_from` | text | STIA Casos <casos@stia.com> | Remitente de emails |
| `auto_email_on_create` | boolean | true | Email de confirmacion al cliente al crear caso |
| `auto_email_on_assign` | boolean | true | Email al tecnico cuando se le asigna un caso |
| `auto_email_on_status_change` | boolean | true | Email al cliente cuando cambia el estado |
| `auto_email_on_resolve` | boolean | true | Email al cliente + creacion de encuesta CSAT al resolver |
| `auto_email_on_external_note` | boolean | true | Email al cliente cuando se agrega nota externa |
| `auto_escalation_enabled` | boolean | true | Habilita/deshabilita el cron de escalamiento SLA |
| `escalation_interval_minutes` | number | 30 | Intervalo en minutos del cron de escalamiento |

### 4.2 Acceso

- **API:** `GET /api/settings` y `PATCH /api/settings` - solo rol admin
- **UI:** Menu lateral > Configuracion (solo visible para admin)
- **Cambios auditados:** cada modificacion queda en `casos.change_logs`

### 4.3 Flujos Automatizados

Los flujos se ejecutan de forma asincrona (no bloquean la respuesta al usuario). Cada uno verifica su parametro `isEnabled()` antes de ejecutar.

#### 4.3.1 Al crear caso (POST /api/casos)
```
[Usuario crea caso]
  ├─ isEnabled("auto_email_on_create") → Email confirmacion al cliente (contactEmail)
  └─ isEnabled("auto_email_on_assign") → Email al tecnico (SAP EmployeesInfo.eMail)
```

#### 4.3.2 Al actualizar caso (PATCH /api/casos/:id)
```
[Usuario edita caso]
  ├─ Si cambia technicianCode:
  │   └─ isEnabled("auto_email_on_assign") → Email al nuevo tecnico
  │
  └─ Si cambia status:
      ├─ status → Resuelto (-1):
      │   └─ isEnabled("auto_email_on_resolve")
      │       ├─ Crear registro csat_surveys con token crypto
      │       └─ Email al cliente con link a encuesta CSAT
      │
      └─ status → otro (ej. En Proceso):
          └─ isEnabled("auto_email_on_status_change") → Email al cliente
```

#### 4.3.3 Al agregar nota (POST /api/casos/:id/notes)
```
[Usuario agrega nota]
  └─ Si is_internal = false (nota externa):
      └─ isEnabled("auto_email_on_external_note")
          → Busca contactEmail del caso (SAP)
          → Email al cliente con contenido de la nota
```

#### 4.3.4 Escalamiento SLA (POST /api/escalation/check)
```
[Cron cada 30 min]
  └─ isEnabled("auto_escalation_enabled")
      → Para cada pais (CR, SV, GT, HO, PA):
          → Consulta casos abiertos/en proceso con U_TiempoEst
          → Si SLA >= 75%: sendSlaWarningEmail a supervisores (dedup 4h)
          → Si SLA >= 100%: sendSlaExceededEmail a supervisores (dedup 4h)
```

### 4.4 Templates de Email

| Template | Evento | Destinatario | Color header |
|---|---|---|---|
| sendCaseCreatedEmail | Caso creado | Cliente | Azul #0067B2 |
| sendCaseAssignedEmail | Tecnico asignado | Tecnico | Azul #0067B2 |
| sendStatusChangeEmail | Cambio de estado | Cliente | Dinamico por estado |
| sendCaseResolvedEmail | Caso resuelto | Cliente | Verde #16A34A |
| sendExternalNoteEmail | Nota externa | Cliente | Azul #0067B2 |
| sendSlaWarningEmail | SLA al 75% | Supervisores | Amarillo #F59E0B |
| sendSlaExceededEmail | SLA excedido | Supervisores | Rojo #DC2626 |
| sendPasswordResetEmail | Olvide contrasena | Usuario | Azul #0067B2 |

### 4.5 Cron del Servidor

```bash
# Crontab en ubuntu@3.212.155.164
*/30 * * * * curl -s -X POST http://localhost:3002/api/escalation/check \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  >> /data/casos/logs/escalation.log 2>&1
```

- `CRON_SECRET` definido en `/data/casos/.env.local`
- Logs en `/data/casos/logs/escalation.log`

### 4.6 Prioridad de Configuracion SMTP

```
1. casos.settings (DB) ← preferente, editable desde UI
2. .env.local (archivo) ← fallback si DB esta vacio
3. Defaults hardcoded ← smtp.gmail.com:587
```

Si `smtp_user` esta vacio en ambas fuentes, los emails se omiten silenciosamente (log a consola).
