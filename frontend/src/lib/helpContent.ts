import type { HelpContent } from '../components/shared/HelpPanel';

const helpByRoute: Record<string, HelpContent> = {

  // ─── DASHBOARD ──────────────────────────────────────
  '/': {
    title: 'Panel Principal',
    description:
      'Vista unificada del negocio con saludo personalizado, sección "Mi Día" con acciones urgentes, y tres perspectivas: Ventas (ingresos, cartera abierta, proporción de documentos), Logística (envíos en tránsito, retrasos) y Servicio (casos abiertos, satisfacción). Los datos se actualizan en tiempo real desde SAP Business One.',
    steps: [
      { label: 'Revisa "Mi Día"', detail: 'La sección "Mi Día" muestra tus cobros pendientes (facturas vencidas), cotizaciones por vencer (próximos 7 días) y agenda de hoy. Haz clic en cualquier item para ir directamente al documento.' },
      { label: 'Revisa los indicadores', detail: 'Las tarjetas superiores muestran Ingresos, Cartera Abierta, Proporción y Actividades. Haz clic en cualquier tarjeta para ver los documentos que la respaldan.' },
      { label: 'Analiza los gráficos', detail: 'Embudo de ventas, ingresos vs objetivo y actividad del equipo. Los gerentes también ven el ranking de mejores vendedores.' },
      { label: 'Proyección de Ventas', detail: 'Estimación basada en las oportunidades del módulo Embudo. Solo aparece si hay oportunidades registradas con monto y probabilidad.' },
    ],
    dependencies: [
      'Las cifras de ingresos provienen de las Facturas registradas en SAP.',
      'La sección "Mi Día" consulta facturas vencidas, cotizaciones próximas a vencer y actividades del día.',
      'La cartera abierta y la proporción dependen de Cotizaciones y Pedidos abiertos en SAP.',
      'La Proyección depende de las Oportunidades registradas en el módulo Embudo del CRM.',
    ],
    sapNotes: [
      'Si los ingresos aparecen en $0, verificar que existan facturas (Invoices) con DocTotal > 0 en SAP.',
      'El indicador "Proporción" muestra el porcentaje de Órdenes vs (Órdenes + Ofertas) abiertas.',
      'Asegúrese de que cada vendedor tenga asignado un SalesPersonCode en SAP para aparecer en el ranking.',
      '"Mi Día" muestra solo documentos asignados al vendedor actual (según SalesPersonCode).',
    ],
    tips: [
      'El saludo personalizado cambia según la hora del día (Buenos días, Buenas tardes, Buenas noches).',
      'Haga clic en cualquier tarjeta de datos para ver el detalle de los documentos.',
      'Haga doble clic en cualquier gráfico para abrir opciones de filtrado por fecha o país.',
      'Los items en "Mi Día" son clickeables y navegan directamente al documento en SAP.',
    ],
  },

  // ─── CUENTAS ────────────────────────────────────────
  '/accounts': {
    title: 'Cuentas (Clientes)',
    description:
      'Listado de todos los socios de negocios (Business Partners) de tipo cliente registrados en SAP. Cada cuenta representa una empresa o persona con la que se tienen relaciones comerciales. La tabla muestra nombre, industria, teléfono y vendedor asignado.',
    steps: [
      { label: 'Buscar una cuenta', detail: 'Use la barra de búsqueda para encontrar clientes por nombre o industria.' },
      { label: 'Ver detalle 360°', detail: 'Haga clic en cualquier fila de la tabla para acceder a la ficha completa: contactos, cotizaciones, pedidos, facturas e historial.' },
      { label: 'Crear cuenta', detail: 'Use el botón "Nueva Cuenta" para registrar un nuevo cliente con nombre, industria, teléfono y sitio web.' },
    ],
    dependencies: [
      'Los datos vienen de BusinessPartners en SAP (CardType = C para clientes).',
      'Los contactos asociados dependen de ContactEmployees vinculados al BP en SAP.',
      'La columna "Vendedor" muestra el nombre completo del vendedor asignado al Business Partner.',
    ],
    sapNotes: [
      'Si una cuenta no aparece, verifique que esté activa (no bloqueada) en SAP con CardType = "cCustomer".',
      'Para que aparezca la industria, complete el campo "Industry" en la ficha del Business Partner en SAP.',
      'Asigne un SalesPersonCode a cada BP para que aparezca vinculado al vendedor correcto.',
    ],
    tips: [
      'Las filas de la tabla son clickeables — haga clic para ir al detalle 360° del cliente.',
      'La columna "Vendedor" muestra el nombre y apellido del vendedor responsable.',
      'Las cuentas sin vendedor asignado no aparecerán en los filtros por vendedor.',
    ],
  },

  // ─── CONTACTOS ──────────────────────────────────────
  '/contacts': {
    title: 'Contactos',
    description:
      'Personas de contacto asociadas a las cuentas (clientes). Cada contacto pertenece a un Business Partner en SAP y puede tener email, teléfono, cargo y más. Los teléfonos y correos son clickeables para iniciar llamadas o emails directamente.',
    steps: [
      { label: 'Buscar contacto', detail: 'Busque por nombre, email o empresa asociada.' },
      { label: 'Llamar o escribir', detail: 'Haga clic en el teléfono para iniciar una llamada (tel:) o en el email para abrir su cliente de correo (mailto:).' },
      { label: 'Ver socio de negocios', detail: 'La columna "Socio de Negocios" muestra la empresa a la que pertenece cada contacto.' },
    ],
    dependencies: [
      'Cada contacto está vinculado a un Business Partner (cuenta) en SAP.',
      'Si la cuenta no existe en SAP, el contacto no aparecerá.',
    ],
    sapNotes: [
      'Los contactos provienen de ContactEmployees dentro de cada Business Partner en SAP.',
      'CRÍTICO: Muchos contactos en SAP tienen el campo Name vacío. Completar Name, E_MailL y Position mejora la utilidad del CRM.',
      'Si un contacto aparece como "Sin nombre", actualice FirstName y LastName en SAP > BP > pestaña Contact Persons.',
      'Completar el campo Position (cargo) ayuda a identificar al decisor de compra.',
    ],
    tips: [
      'Los teléfonos son links clickeables — al hacer clic se abre la app de llamadas del dispositivo.',
      'Los emails también son clickeables — abren el cliente de correo predeterminado.',
      'El campo "Cargo" es crucial para saber a quién dirigir propuestas comerciales.',
    ],
  },

  // ─── PROSPECTOS ─────────────────────────────────────
  '/leads': {
    title: 'Prospectos (Leads)',
    description:
      'Potenciales clientes que aún no se han convertido en oportunidades de venta. Los prospectos se gestionan localmente en el CRM (no en SAP) y representan el primer paso del embudo comercial.',
    steps: [
      { label: 'Crear prospecto', detail: 'Registre un nuevo lead con nombre, empresa, email y fuente de origen.' },
      { label: 'Calificar', detail: 'Asigne una calificación (Hot, Warm, Cold) según el interés del prospecto.' },
      { label: 'Convertir a oportunidad', detail: 'Cuando el prospecto muestra interés real, conviértalo en una oportunidad en el Embudo.' },
    ],
    dependencies: [
      'Los prospectos se almacenan en la base de datos local del CRM (PostgreSQL), no en SAP.',
      'Al convertir un prospecto, se crea una Oportunidad en el módulo Embudo.',
    ],
    sapNotes: [
      'Los prospectos NO dependen de SAP. Son registros internos del CRM.',
      'Al convertir un prospecto en cliente, se recomienda crear también el Business Partner en SAP.',
      'Si necesita importar leads masivamente, contacte al administrador.',
    ],
    tips: [
      'Mantenga el campo "Fuente" actualizado para medir qué canales generan más leads.',
      'Los prospectos "Hot" deberían convertirse en oportunidades en menos de 7 días.',
      'Use las notas para registrar cada interacción con el prospecto.',
    ],
  },

  // ─── EMBUDO (PIPELINE) ─────────────────────────────
  '/pipeline': {
    title: 'Embudo de Ventas',
    description:
      'Tablero Kanban que muestra las oportunidades de venta organizadas por etapa: Calificación, Propuesta, Negociación y Cierre. Arrastre las tarjetas entre columnas para actualizar el avance de cada oportunidad.',
    steps: [
      { label: 'Crear oportunidad', detail: 'Use el botón "+" para registrar una nueva oportunidad con nombre, monto estimado y fecha de cierre.' },
      { label: 'Avanzar por etapas', detail: 'Arrastre la tarjeta de una columna a otra conforme avanza la negociación.' },
      { label: 'Cerrar como ganada o perdida', detail: 'Cuando se concreta la venta, márquela como "Ganada". Si se pierde, márquela como "Perdida" con el motivo.' },
      { label: 'Revisar en el Panel', detail: 'Las oportunidades alimentan la Proyección y los indicadores del Panel Principal.' },
    ],
    dependencies: [
      'Las oportunidades se almacenan localmente en el CRM (PostgreSQL).',
      'La Proyección del Panel se calcula a partir de las oportunidades de este módulo.',
      'Para ver datos en la Proyección, debe haber oportunidades con monto y probabilidad asignados.',
    ],
    sapNotes: [
      'El Embudo NO depende de SAP. Las oportunidades son registros internos del CRM.',
      'Si desea vincular una oportunidad a un cliente SAP, seleccione la cuenta al crearla.',
      'Las ofertas y órdenes en SAP son independientes del Embudo. Este módulo es para la gestión del proceso de ventas.',
    ],
    tips: [
      'Complete siempre el monto estimado y la probabilidad para que la Proyección sea precisa.',
      'Revise semanalmente las oportunidades "estancadas" (sin movimiento por más de 14 días).',
      'El valor "Cartera Ponderada" del Panel multiplica cada monto por su probabilidad.',
    ],
  },

  // ─── COTIZACIONES ───────────────────────────────────
  '/quotes': {
    title: 'Ofertas de Venta',
    description:
      'Ofertas emitidas a clientes desde SAP Business One. Representan propuestas comerciales formales con productos, cantidades y precios. Incluye filtros por estado (Abiertas/Cerradas) y por rango de fecha (Este Mes, Último Trimestre, Este Año).',
    steps: [
      { label: 'Filtrar ofertas', detail: 'Use los dos selectores: "Estado" (Todos/Abiertas/Cerradas) y "Fecha" (Todas/Este Mes/Último Trimestre/Este Año) para acotar la lista.' },
      { label: 'Buscar por texto', detail: 'La barra de búsqueda filtra por número de documento, nombre del cliente o vendedor.' },
      { label: 'Ver detalle', detail: 'Haga clic en una oferta para ver líneas de productos, montos y estado.' },
    ],
    dependencies: [
      'Las ofertas provienen de Quotations en SAP Business One.',
      'Los filtros envían consultas OData directamente a SAP para traer solo los documentos que coincidan.',
      'La conversión a orden se realiza en SAP usando "Copiar a > Orden".',
    ],
    sapNotes: [
      'Las ofertas se crean y editan SOLO en SAP. El CRM las muestra en modo lectura.',
      'Si una oferta no aparece, verifique que fue creada en la compañía SAP seleccionada.',
      'El estado "Cerrada" (bost_Close) indica que la oferta fue copiada a Orden o cancelada.',
      'Complete siempre el campo SalesPersonCode en la oferta para que se vincule al vendedor.',
    ],
    tips: [
      'Use el filtro "Abiertas" para ver solo ofertas pendientes de respuesta.',
      'Combine filtro de estado + fecha para encontrar ofertas de un periodo específico.',
      'El flujo ideal es: Oferta > Orden > Factura (todo en SAP con "Copiar a").',
    ],
  },

  // ─── PEDIDOS ────────────────────────────────────────
  '/orders': {
    title: 'Órdenes de Venta',
    description:
      'Órdenes confirmadas por clientes. Se generan en SAP, normalmente a partir de una oferta aprobada. Incluyen búsqueda y seguimiento logístico: Procesando, Facturado, Salió Puerto, Llegó Puerto y Entregado.',
    steps: [
      { label: 'Buscar órdenes', detail: 'Use la barra de búsqueda para filtrar por número de orden, nombre del cliente o número de tracking.' },
      { label: 'Rastrear envío', detail: 'Cada orden tiene un indicador visual de 5 etapas logísticas para saber su estado de entrega.' },
      { label: 'Ver detalle', detail: 'Haga clic en una orden para ver líneas de productos, montos y seguimiento completo.' },
    ],
    dependencies: [
      'Las órdenes provienen de Orders en SAP Business One.',
      'Normalmente se generan desde una Oferta usando "Copiar a > Orden" en SAP.',
      'El estado logístico depende de campos UDF configurados en SAP (si están disponibles).',
    ],
    sapNotes: [
      'Las órdenes se crean y editan SOLO en SAP. El CRM las muestra en modo lectura.',
      'Si todas las órdenes aparecen como "Procesando", es porque SAP no tiene los campos UDF de logística configurados.',
      'Asegúrese de que cada orden tenga SalesPersonCode para vincular al vendedor.',
      'El flujo de documentos en SAP es: Oferta > Orden > Entrega > Factura.',
    ],
    tips: [
      'La búsqueda filtra por número de orden, nombre del cliente y número de tracking.',
      'El stepper visual de 5 pasos muestra el progreso logístico de cada orden.',
      'Órdenes sin factura asociada pueden indicar entregas pendientes.',
    ],
  },

  // ─── FACTURAS ───────────────────────────────────────
  '/invoices': {
    title: 'Facturación',
    description:
      'Facturas emitidas a clientes desde SAP Business One. Muestra el estado de pago (Pagado, Pendiente, Vencido) y métricas globales de cobro calculadas sobre todas las facturas del mes, no solo la página visible.',
    steps: [
      { label: 'Revisar indicadores globales', detail: 'Las tarjetas superiores muestran el total cobrado, pendiente y vencido del mes calculados sobre TODAS las facturas en SAP, no solo las visibles en la página actual.' },
      { label: 'Buscar y filtrar', detail: 'Use la búsqueda por número, cliente, y el selector de estado (Todos/Pagado/Pendiente/Vencido).' },
      { label: 'Ver detalle', detail: 'Haga clic en una factura para ver líneas, montos y pagos aplicados.' },
    ],
    dependencies: [
      'Las facturas provienen de Invoices en SAP Business One.',
      'Los indicadores se calculan con un endpoint dedicado (/invoices/stats) que consulta todas las facturas del mes.',
      'El estado de pago depende de los pagos registrados (IncomingPayments) en SAP.',
    ],
    sapNotes: [
      'Las facturas se crean SOLO en SAP. El CRM las muestra en modo lectura.',
      'El estado "Pagado" se determina comparando PaidToDate vs DocTotal.',
      '"Vencido" significa que la fecha de vencimiento (DocDueDate) ya pasó y no se ha pagado el total.',
      'Para que las cifras sean correctas, registre pagos parciales en SAP > Incoming Payments.',
    ],
    tips: [
      'Los indicadores son globales — reflejan el total del mes, no solo la página actual.',
      'Use el filtro "Vencido" para priorizar cobranza de facturas atrasadas.',
      'El flujo completo es: Oferta > Orden > Factura > Pago.',
    ],
  },

  // ─── ACTIVIDADES ────────────────────────────────────
  '/activities': {
    title: 'Actividades',
    description:
      'Registro de llamadas, reuniones, tareas y correos realizados por el equipo comercial. Incluye filtros por tipo de actividad (Llamadas, Correos, Reuniones, Tareas) y la opción de ocultar/mostrar actividades completadas.',
    steps: [
      { label: 'Filtrar por tipo', detail: 'Use los botones Todas, Llamadas, Correos, Reuniones o Tareas para ver solo un tipo de actividad.' },
      { label: 'Ocultar completadas', detail: 'Use el botón "Ocultar completadas" para enfocarse solo en las actividades pendientes.' },
      { label: 'Marcar como completada', detail: 'Haga clic en el círculo a la izquierda de cada actividad para marcarla como completada o pendiente.' },
      { label: 'Crear actividad', detail: 'Use el botón "Nueva Actividad" para registrar llamadas, reuniones o tareas.' },
    ],
    dependencies: [
      'Las actividades provienen del módulo Activities de SAP Business One.',
      'Cada actividad se vincula a un Business Partner (cliente) mediante CardCode.',
      'Las actividades también alimentan la sección "Agenda de Hoy" en el Dashboard.',
    ],
    sapNotes: [
      'IMPORTANTE: Este es el módulo con mayor brecha de datos. Actualmente SAP tiene muy pocas actividades registradas.',
      'Para que esta pantalla muestre información útil, los vendedores deben registrar sus interacciones en SAP > Activities.',
      'Cada actividad debe tener: tipo (Call/Meeting/Task), asunto (Subject), fecha y el BP asociado.',
      'Sin actividades registradas, el indicador "Actividades" del Panel Principal siempre mostrará 0.',
    ],
    tips: [
      'Los filtros por tipo permiten enfocarse en un tipo específico de actividad (ej. solo Llamadas).',
      'Las actividades vencidas se muestran en rojo para facilitar la priorización.',
      'Las actividades también aparecen en el Calendario y en la sección "Mi Día" del Dashboard.',
    ],
  },

  // ─── PRODUCTOS ──────────────────────────────────────
  '/products': {
    title: 'Catálogo de Productos',
    description:
      'Listado de todos los productos (Items) registrados en SAP Business One. Muestra código, nombre, precio, stock disponible y categoría.',
    steps: [
      { label: 'Buscar producto', detail: 'Use la búsqueda por código o nombre del producto.' },
      { label: 'Ver información', detail: 'Cada producto muestra su precio de venta, stock actual y grupo.' },
      { label: 'Consultar en cotizaciones', detail: 'Los productos aquí listados son los que aparecen al crear ofertas y órdenes en SAP.' },
    ],
    dependencies: [
      'Los productos provienen de Items en SAP Business One.',
      'Los precios dependen de la lista de precios configurada en SAP.',
    ],
    sapNotes: [
      'Si un producto aparece solo con el código (sin nombre), complete el campo ItemName en SAP > Inventory > Item Master Data.',
      'Los productos con precio $0.00 necesitan tener configurada una lista de precios en SAP.',
      'Aproximadamente 30% de los productos actuales tienen precio $0. Esto se corrige en SAP > Price Lists.',
      'Los productos se gestionan SOLO en SAP. El CRM los muestra en modo lectura.',
    ],
    tips: [
      'Productos sin precio no deberían usarse en cotizaciones para evitar errores.',
      'El campo "Stock" muestra la cantidad disponible en bodega según SAP.',
    ],
  },

  // ─── PANEL GERENCIAL ────────────────────────────────
  '/sales-manager': {
    title: 'Panel Gerencial',
    description:
      'Herramienta exclusiva para gerentes de ventas. Permite ver la ficha completa de cualquier cliente, el rendimiento del equipo de vendedores y alertas del equipo comercial.',
    steps: [
      { label: 'Buscar cliente', detail: 'En la pestaña "Ficha 360°", busque un cliente por nombre para ver su historial completo.' },
      { label: 'Rendimiento del Equipo', detail: 'La pestaña "Rendimiento del Equipo" muestra las ventas y actividad de cada vendedor.' },
      { label: 'Alertas', detail: 'Revise alertas como ofertas sin respuesta o facturas vencidas.' },
    ],
    dependencies: [
      'Todos los datos provienen de SAP: facturas, órdenes, ofertas y actividades.',
      'El reporte de rendimiento requiere que cada documento tenga SalesPersonCode asignado.',
    ],
    sapNotes: [
      'Si un vendedor aparece con $0 en ventas, verifique que su SalesPersonCode esté asignado correctamente en SAP.',
      'La ficha 360° muestra el consolidado de TODOS los documentos del cliente en SAP.',
      'Las alertas dependen de que los datos estén completos: fechas de vencimiento, estados, etc.',
    ],
    tips: [
      'Use este panel en reuniones semanales de ventas para revisar el rendimiento del equipo.',
      'Esta sección solo es visible para usuarios con rol Admin o Gerente.',
    ],
  },

  // ─── LOGÍSTICA ──────────────────────────────────────
  '/logistics': {
    title: 'Operaciones Logísticas',
    description:
      'Panel de seguimiento logístico que muestra pedidos en tránsito, tiempos de entrega, pedidos en puerto y alertas de retraso. Permite al equipo comercial dar seguimiento a envíos sin necesidad de consultar SAP directamente.',
    steps: [
      { label: 'Revisar indicadores', detail: 'Las tarjetas superiores muestran pedidos en tránsito, tiempo promedio de entrega, pedidos en puerto y alertas.' },
      { label: 'Gráfico por etapa', detail: 'El gráfico de barras muestra cuántos pedidos hay en cada etapa: Procesando, Facturado, Salió Puerto, Llegó Puerto, Entregado.' },
      { label: 'Pedidos con retraso', detail: 'La sección inferior lista pedidos que exceden el tiempo estimado de entrega.' },
    ],
    dependencies: [
      'Los datos provienen de Orders en SAP Business One.',
      'Las etapas logísticas dependen de campos UDF (User Defined Fields) en SAP.',
    ],
    sapNotes: [
      'Si todos los pedidos aparecen como "Procesando", es porque SAP no tiene configurados los campos UDF de logística.',
      'Para activar el seguimiento completo, solicite a su administrador SAP crear los campos: U_LogisticsStatus, U_TrackingNumber, U_ShipDate.',
      'Los tiempos de entrega se calculan desde la fecha del pedido (DocDate) hasta la fecha actual.',
    ],
    tips: [
      'Esta sección es visible para usuarios con rol Admin o Gerente.',
      'Use las alertas de retraso para comunicarse proactivamente con el cliente.',
    ],
  },

  // ─── ANTIGÜEDAD ─────────────────────────────────────
  '/aging': {
    title: 'Antigüedad de Saldos',
    description:
      'Análisis de cartera por antigüedad. Muestra las facturas abiertas agrupadas por rangos de días: Corriente, 1-30, 31-60, 61-90 y más de 90 días. Esencial para gestión de cobranza.',
    steps: [
      { label: 'Revisar totales', detail: 'Las tarjetas superiores muestran el monto total por cada rango de antigüedad.' },
      { label: 'Identificar vencidos', detail: 'Enfóquese en los rangos de 61-90 y +90 días para priorizar cobranza.' },
      { label: 'Ver detalle por cliente', detail: 'La tabla muestra el desglose por vendedor y cliente con montos específicos.' },
    ],
    dependencies: [
      'Los datos provienen de Invoices con saldo pendiente en SAP (PaidToDate < DocTotal).',
      'El cálculo se basa en la fecha de vencimiento (DocDueDate) de cada factura.',
    ],
    sapNotes: [
      'Para que los saldos sean correctos, registre todos los pagos recibidos en SAP > Incoming Payments.',
      'Si un cliente aparece con saldo vencido pero ya pagó, verifique que el pago se haya aplicado a la factura correcta en SAP.',
      'Los montos se muestran en la moneda local de cada compañía.',
    ],
    tips: [
      'Exporte el reporte para usarlo en reuniones de cobranza.',
      'Los clientes con saldos +90 días deberían tener un plan de cobranza activo.',
    ],
  },

  // ─── REPORTES ───────────────────────────────────────
  '/reports': {
    title: 'Reportes',
    description:
      'Análisis de rendimiento comercial de los últimos 6 meses. Muestra indicadores clave, mejores clientes por ingreso, mejores vendedores, tasa de conversión e ingresos por mes.',
    steps: [
      { label: 'Revisar indicadores generales', detail: 'Ingresos facturados, cotizaciones emitidas, tasa de conversión y ticket promedio.' },
      { label: 'Analizar top clientes', detail: 'El gráfico de dona muestra los clientes que más ingresos generan.' },
      { label: 'Revisar vendedores', detail: 'La tabla de Top Vendedores muestra ingresos facturados y pedidos por persona.' },
      { label: 'Tendencia mensual', detail: 'El gráfico de barras muestra la evolución de ingresos por mes.' },
    ],
    dependencies: [
      'Ingresos: provienen de Invoices en SAP (últimos 6 meses).',
      'Ofertas: provienen de Quotations en SAP.',
      'Órdenes: provienen de Orders en SAP.',
      'La tasa de conversión compara ofertas cerradas vs total de ofertas.',
    ],
    sapNotes: [
      'Los datos abarcan los últimos 6 meses desde la fecha actual.',
      'Si un vendedor no aparece en el ranking, verifique que tenga SalesPersonCode asignado en sus documentos.',
      'La tasa de conversión se calcula como: Ofertas con estado "Cerrada" / Total de Ofertas.',
      'Para que el ticket promedio sea representativo, todas las órdenes deben tener DocTotal correcto.',
    ],
    tips: [
      'Use este reporte en reuniones mensuales de resultados.',
      'Compare la tasa de conversión mes a mes para medir mejoras en el proceso de ventas.',
    ],
  },

  // ─── CALENDARIO ────────────────────────────────────
  '/calendar': {
    title: 'Calendario',
    description:
      'Vista de calendario mensual con todas las actividades registradas en SAP. Muestra llamadas, reuniones, tareas y visitas organizadas por fecha con código de color por tipo.',
    steps: [
      { label: 'Navegar por meses', detail: 'Use las flechas para cambiar de mes y ver actividades pasadas o futuras.' },
      { label: 'Revisar eventos del día', detail: 'En el panel lateral derecho aparecen los eventos de hoy con hora y tipo.' },
      { label: 'Revisar estadísticas', detail: 'Las tarjetas superiores muestran actividades de Hoy, Esta Semana y Pendientes.' },
    ],
    dependencies: [
      'Las actividades provienen de SAP Business One (módulo Activities).',
      'Se cargan hasta 200 actividades para mostrar en el calendario.',
      'Los colores representan el tipo: azul (Llamada), azul oscuro (Reunión), verde (Tarea), rojo (Visita).',
    ],
    sapNotes: [
      'Si el calendario aparece vacío, es porque no hay actividades registradas en SAP para el vendedor actual.',
      'Para que aparezcan actividades, regístrelas en SAP > Activities con fecha (ActivityDate) y tipo.',
      'Las actividades sin fecha no aparecerán en el calendario.',
    ],
    tips: [
      'Las Acciones Rápidas en el panel derecho permiten agendar reuniones o crear tareas rápidamente.',
      'El calendario usa datos reales de SAP — cada cambio en SAP se refleja aquí automáticamente.',
      'Use esta vista para planificar su semana de trabajo.',
    ],
  },

  // ─── CONFIGURACIÓN ──────────────────────────────────
  '/settings': {
    title: 'Configuración',
    description:
      'Gestione su perfil personal, preferencias del sistema y configuración de la empresa. Aquí puede actualizar su información, cambiar contraseña y ajustar notificaciones.',
    steps: [
      { label: 'Perfil', detail: 'Actualice su nombre, email, teléfono y foto de perfil.' },
      { label: 'Empresa', detail: 'Vea la información de la compañía activa.' },
      { label: 'Usuarios', detail: 'Administre los usuarios del CRM (solo Admin).' },
      { label: 'Integraciones', detail: 'Revise el estado de la conexión con SAP Business One.' },
    ],
    tips: [
      'Los datos del perfil se muestran en la barra superior y en las actividades que registre.',
      'El rol determina qué secciones del menú puede ver (Admin > Gerente > Vendedor).',
    ],
  },
};

const defaultHelp: HelpContent = {
  title: 'Ayuda',
  description:
    'Bienvenido a STIA CRM. Navegue por las secciones del menú lateral para acceder a las diferentes funcionalidades del sistema. Los datos se sincronizan en tiempo real desde SAP Business One.',
  tips: [
    'Use la barra de búsqueda global (⌘K) para encontrar clientes, ofertas u órdenes rápidamente.',
    'El menú lateral muestra las secciones según su rol de usuario.',
    'Cambie de país usando el selector en la barra superior o el sidebar.',
  ],
};

export function getHelpContent(pathname: string): HelpContent {
  // Exact match first
  if (helpByRoute[pathname]) return helpByRoute[pathname];

  // Base route match for detail pages (e.g., /accounts/123 → /accounts)
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  if (base !== pathname && helpByRoute[base]) return helpByRoute[base];

  // Default help for unmapped pages
  return defaultHelp;
}
