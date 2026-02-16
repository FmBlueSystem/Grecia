import type { HelpContent } from '../components/shared/HelpPanel';

const helpByRoute: Record<string, HelpContent> = {

  // ─── DASHBOARD ──────────────────────────────────────
  '/': {
    title: 'Dashboard Ejecutivo',
    description:
      'Vista unificada del negocio con tres perspectivas: Ventas (ingresos, pipeline, conversión), Logística (envíos en tránsito, retrasos) y Servicio (casos abiertos, satisfacción). Los datos se actualizan en tiempo real desde SAP Business One.',
    steps: [
      { label: 'Selecciona la pestaña', detail: 'Escoge entre Ventas, Logística o Servicio según lo que necesites consultar.' },
      { label: 'Revisa los KPIs', detail: 'Las tarjetas superiores muestran los indicadores clave del mes actual.' },
      { label: 'Analiza los gráficos', detail: 'Embudo de ventas, ingresos vs objetivo, actividad del equipo y mejores vendedores.' },
      { label: 'Forecast de Ventas', detail: 'Proyección basada en el pipeline de oportunidades (requiere datos en el módulo Embudo).' },
    ],
    dependencies: [
      'Las cifras de ingresos provienen de las Facturas registradas en SAP.',
      'El pipeline y la conversión dependen de Cotizaciones y Pedidos en SAP.',
      'El Forecast depende de las Oportunidades registradas en el módulo Embudo del CRM.',
    ],
    sapNotes: [
      'Si los ingresos aparecen en $0, verificar que existan facturas (Invoices) con DocTotal > 0 en SAP.',
      'El indicador de "Conversión" compara Órdenes abiertas vs (Órdenes + Cotizaciones abiertas).',
      'Asegúrese de que cada vendedor tenga asignado un SalesPersonCode en SAP para aparecer en el ranking.',
    ],
    tips: [
      'Haga doble clic en cualquier gráfico para abrir opciones de filtrado por fecha o país.',
      'El botón "Exportar Reporte" genera un PDF con todos los KPIs visibles.',
    ],
  },

  // ─── CUENTAS ────────────────────────────────────────
  '/accounts': {
    title: 'Cuentas (Clientes)',
    description:
      'Listado de todos los socios de negocios (Business Partners) de tipo cliente registrados en SAP. Cada cuenta representa una empresa o persona con la que se tienen relaciones comerciales.',
    steps: [
      { label: 'Buscar una cuenta', detail: 'Use la barra de búsqueda para encontrar clientes por nombre, código o industria.' },
      { label: 'Filtrar por tipo', detail: 'Puede filtrar entre todos, clientes activos o prospectos.' },
      { label: 'Ver detalle 360°', detail: 'Haga clic en una cuenta para ver su ficha completa: contactos, cotizaciones, pedidos, facturas e historial.' },
    ],
    dependencies: [
      'Los datos vienen de BusinessPartners en SAP (CardType = C para clientes).',
      'Los contactos asociados dependen de ContactEmployees vinculados al BP en SAP.',
    ],
    sapNotes: [
      'Si una cuenta no aparece, verifique que esté activa (no bloqueada) en SAP con CardType = "cCustomer".',
      'Para que aparezca la industria, complete el campo "Industry" en la ficha del Business Partner en SAP.',
      'Si el teléfono o email están vacíos, actualice Phone1 y EmailAddress en la ficha del BP.',
      'Asigne un SalesPersonCode a cada BP para que aparezca vinculado al vendedor correcto.',
    ],
    tips: [
      'Desde el detalle de una cuenta puede ver toda su historia comercial en un solo lugar.',
      'Las cuentas sin vendedor asignado no aparecerán en los filtros por vendedor.',
    ],
  },

  // ─── CONTACTOS ──────────────────────────────────────
  '/contacts': {
    title: 'Contactos',
    description:
      'Personas de contacto asociadas a las cuentas (clientes). Cada contacto pertenece a un Business Partner en SAP y puede tener email, teléfono, cargo y más.',
    steps: [
      { label: 'Buscar contacto', detail: 'Busque por nombre, email o empresa asociada.' },
      { label: 'Ver información', detail: 'Cada tarjeta muestra nombre, cargo, email y la cuenta a la que pertenece.' },
      { label: 'Acceder a la cuenta', detail: 'Desde el contacto puede navegar a la cuenta (empresa) asociada.' },
    ],
    dependencies: [
      'Cada contacto está vinculado a un Business Partner (cuenta) en SAP.',
      'Si la cuenta no existe en SAP, el contacto no aparecerá.',
    ],
    sapNotes: [
      'Los contactos provienen de ContactEmployees dentro de cada Business Partner en SAP.',
      'CRÍTICO: Muchos contactos en SAP tienen el campo Name vacío o con valores genéricos. Completar Name, E_MailL y Position mejora significativamente la utilidad del CRM.',
      'Si un contacto aparece como "Sin nombre", actualice FirstName y LastName en SAP > BP > pestaña Contact Persons.',
      'Completar el campo Position (cargo) ayuda a identificar al decisor de compra.',
    ],
    tips: [
      'Un contacto con email permite enviar cotizaciones y comunicaciones directamente.',
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
    title: 'Embudo de Ventas (Pipeline)',
    description:
      'Tablero Kanban que muestra las oportunidades de venta organizadas por etapa: Calificación, Propuesta, Negociación y Cierre. Arrastre las tarjetas entre columnas para actualizar el avance de cada oportunidad.',
    steps: [
      { label: 'Crear oportunidad', detail: 'Use el botón "+" para registrar una nueva oportunidad con nombre, monto estimado y fecha de cierre.' },
      { label: 'Avanzar por etapas', detail: 'Arrastre la tarjeta de una columna a otra conforme avanza la negociación.' },
      { label: 'Cerrar como ganada o perdida', detail: 'Cuando se concreta la venta, márquela como "Ganada". Si se pierde, márquela como "Perdida" con el motivo.' },
      { label: 'Revisar en el Dashboard', detail: 'Las oportunidades alimentan el Forecast y los KPIs del Dashboard.' },
    ],
    dependencies: [
      'Las oportunidades se almacenan localmente en el CRM (PostgreSQL).',
      'El Forecast del Dashboard se calcula a partir de las oportunidades de este módulo.',
      'Para ver datos en el Forecast, debe haber oportunidades con monto y probabilidad asignados.',
    ],
    sapNotes: [
      'El Embudo NO depende de SAP. Las oportunidades son registros internos del CRM.',
      'Si desea vincular una oportunidad a un cliente SAP, seleccione la cuenta al crearla.',
      'Las cotizaciones y pedidos en SAP son independientes del Embudo. Este módulo es para la gestión de pipeline de ventas.',
    ],
    tips: [
      'Complete siempre el monto estimado y la probabilidad para que el Forecast sea preciso.',
      'Revise semanalmente las oportunidades "estancadas" (sin movimiento por más de 14 días).',
      'El valor "Pipeline Ponderado" del Dashboard multiplica cada monto por su probabilidad.',
    ],
  },

  // ─── COTIZACIONES ───────────────────────────────────
  '/quotes': {
    title: 'Cotizaciones (Ofertas)',
    description:
      'Cotizaciones emitidas a clientes desde SAP Business One. Representan propuestas comerciales formales con productos, cantidades y precios. Desde una cotización se puede generar un pedido.',
    steps: [
      { label: 'Buscar cotización', detail: 'Use la búsqueda por número, cliente o estado (Abierta/Cerrada).' },
      { label: 'Ver detalle', detail: 'Haga clic en una cotización para ver líneas de productos, montos y estado.' },
      { label: 'Seguimiento', detail: 'Las cotizaciones abiertas representan oportunidades activas. Las cerradas ya fueron convertidas a pedido o canceladas.' },
    ],
    dependencies: [
      'Las cotizaciones provienen de Quotations en SAP Business One.',
      'Para que una cotización tenga cliente, debe existir el Business Partner en SAP.',
      'La conversión a pedido se realiza en SAP usando "Copiar a > Pedido".',
    ],
    sapNotes: [
      'Las cotizaciones se crean y editan SOLO en SAP. El CRM las muestra en modo lectura.',
      'Si una cotización no aparece, verifique que fue creada en la compañía SAP seleccionada (Costa Rica, Guatemala, etc.).',
      'El estado "Cerrada" (bost_Close) indica que la cotización fue copiada a Pedido o cancelada.',
      'Complete siempre el campo SalesPersonCode en la cotización para que se vincule al vendedor.',
    ],
    tips: [
      'Use el filtro de estado para ver solo cotizaciones pendientes de respuesta.',
      'La tasa de conversión del Dashboard compara cotizaciones cerradas vs total.',
      'El flujo ideal es: Cotización > Pedido > Factura (todo en SAP con "Copiar a").',
    ],
  },

  // ─── PEDIDOS ────────────────────────────────────────
  '/orders': {
    title: 'Pedidos (Órdenes de Venta)',
    description:
      'Pedidos confirmados por clientes. Se generan en SAP, normalmente a partir de una cotización aprobada. Incluyen seguimiento logístico: Procesando, Facturado, Salió Puerto, Llegó Puerto y Entregado.',
    steps: [
      { label: 'Ver pedidos activos', detail: 'La lista muestra todos los pedidos ordenados por fecha. Use filtros por estado.' },
      { label: 'Rastrear envío', detail: 'Cada pedido tiene un indicador de etapa logística para saber su estado de entrega.' },
      { label: 'Ver detalle', detail: 'Haga clic en un pedido para ver líneas de productos, montos y seguimiento.' },
    ],
    dependencies: [
      'Los pedidos provienen de Orders en SAP Business One.',
      'Normalmente se generan desde una Cotización usando "Copiar a > Pedido" en SAP.',
      'El estado logístico depende de campos UDF configurados en SAP (si están disponibles).',
    ],
    sapNotes: [
      'Los pedidos se crean y editan SOLO en SAP. El CRM los muestra en modo lectura.',
      'Si todos los pedidos aparecen como "Procesando", es porque SAP no tiene los campos UDF de logística configurados. Contacte al administrador de SAP para crear: U_LogisticsStatus, U_TrackingNumber.',
      'Asegúrese de que cada pedido tenga SalesPersonCode para vincular al vendedor.',
      'El flujo de documentos en SAP es: Cotización > Pedido > Entrega > Factura.',
    ],
    tips: [
      'El indicador logístico permite al equipo comercial dar seguimiento sin consultar SAP directamente.',
      'Pedidos sin factura asociada pueden indicar entregas pendientes.',
    ],
  },

  // ─── FACTURAS ───────────────────────────────────────
  '/invoices': {
    title: 'Facturación',
    description:
      'Facturas emitidas a clientes desde SAP Business One. Muestra el estado de pago (Pagado, Pendiente, Vencido) y métricas de cobro del periodo.',
    steps: [
      { label: 'Revisar KPIs', detail: 'Las tarjetas superiores muestran total cobrado, pendiente y vencido del mes.' },
      { label: 'Buscar factura', detail: 'Use la búsqueda por número, cliente o filtre por estado de pago.' },
      { label: 'Ver detalle', detail: 'Haga clic en una factura para ver líneas, montos y pagos aplicados.' },
    ],
    dependencies: [
      'Las facturas provienen de Invoices en SAP Business One.',
      'Se generan normalmente desde un Pedido usando "Copiar a > Factura" en SAP.',
      'El estado de pago depende de los pagos registrados (IncomingPayments) en SAP.',
    ],
    sapNotes: [
      'Las facturas se crean SOLO en SAP. El CRM las muestra en modo lectura.',
      'El estado "Pagado" se determina comparando PaidToDate vs DocTotal.',
      '"Vencido" significa que la fecha de vencimiento (DocDueDate) ya pasó y no se ha pagado el total.',
      'Para que las cifras del Dashboard sean correctas, registre pagos parciales en SAP > Incoming Payments.',
    ],
    tips: [
      'Use el filtro "Vencido" para priorizar cobranza de facturas atrasadas.',
      'Las facturas alimentan los KPIs de "Ingresos" del Dashboard.',
      'El flujo completo es: Cotización > Pedido > Factura > Pago.',
    ],
  },

  // ─── ACTIVIDADES ────────────────────────────────────
  '/activities': {
    title: 'Actividades',
    description:
      'Registro de llamadas, reuniones, tareas y correos realizados por el equipo comercial. Las actividades son esenciales para medir la productividad del equipo y dar seguimiento a clientes.',
    steps: [
      { label: 'Ver actividades', detail: 'La lista muestra las actividades más recientes con tipo, asunto y fecha.' },
      { label: 'Filtrar por tipo', detail: 'Filtre por Llamada, Reunión, Tarea o Correo según necesite.' },
      { label: 'Crear actividad', detail: 'Registre nuevas actividades para mantener el historial de interacciones con clientes.' },
    ],
    dependencies: [
      'Las actividades provienen del módulo Activities de SAP Business One.',
      'Cada actividad se vincula a un Business Partner (cliente) mediante CardCode.',
    ],
    sapNotes: [
      'IMPORTANTE: Este es el módulo con mayor brecha de datos. Actualmente SAP tiene muy pocas actividades registradas.',
      'Para que esta pantalla muestre información útil, los vendedores deben registrar sus llamadas, reuniones y tareas en SAP > Activities.',
      'Cada actividad debe tener: tipo (Call/Meeting/Task), asunto (Subject), fecha y el BP asociado.',
      'Sin actividades registradas, el KPI "Actividades" del Dashboard siempre mostrará 0.',
    ],
    tips: [
      'Registre al menos las llamadas y reuniones con clientes importantes.',
      'Las actividades alimentan los gráficos de "Actividad del Equipo" en el Dashboard.',
      'Una buena práctica es registrar actividades al final de cada día.',
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
      { label: 'Consultar en cotizaciones', detail: 'Los productos aquí listados son los que aparecen al crear cotizaciones y pedidos en SAP.' },
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
      'Herramienta exclusiva para gerentes de ventas. Permite ver la ficha 360° de cualquier cliente, el scorecard de vendedores y alertas del equipo comercial.',
    steps: [
      { label: 'Buscar cliente', detail: 'En la pestaña "Ficha 360°", busque un cliente por nombre para ver su historial completo.' },
      { label: 'Scorecard', detail: 'La pestaña "Scorecard Vendedores" muestra el rendimiento individual de cada vendedor.' },
      { label: 'Alertas', detail: 'Revise alertas como cotizaciones sin respuesta o facturas vencidas.' },
    ],
    dependencies: [
      'Todos los datos provienen de SAP: facturas, pedidos, cotizaciones y actividades.',
      'El scorecard requiere que cada documento tenga SalesPersonCode asignado.',
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
      { label: 'Revisar KPIs', detail: 'Las tarjetas superiores muestran pedidos en tránsito, tiempo promedio de entrega, pedidos en puerto y alertas.' },
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
      'Análisis de rendimiento comercial de los últimos 6 meses. Muestra KPIs, top clientes por ingreso, top vendedores, tasa de conversión e ingresos por mes.',
    steps: [
      { label: 'Revisar KPIs generales', detail: 'Ingresos facturados, cotizaciones emitidas, tasa de conversión y ticket promedio.' },
      { label: 'Analizar top clientes', detail: 'El gráfico de dona muestra los clientes que más ingresos generan.' },
      { label: 'Revisar vendedores', detail: 'La tabla de Top Vendedores muestra ingresos facturados y pedidos por persona.' },
      { label: 'Tendencia mensual', detail: 'El gráfico de barras muestra la evolución de ingresos por mes.' },
    ],
    dependencies: [
      'Ingresos: provienen de Invoices en SAP (últimos 6 meses).',
      'Cotizaciones: provienen de Quotations en SAP.',
      'Pedidos: provienen de Orders en SAP.',
      'La tasa de conversión compara cotizaciones cerradas vs total de cotizaciones.',
    ],
    sapNotes: [
      'Los datos abarcan los últimos 6 meses desde la fecha actual.',
      'Si un vendedor no aparece en el ranking, verifique que tenga SalesPersonCode asignado en sus documentos.',
      'La tasa de conversión se calcula como: Cotizaciones con estado "Cerrada" / Total de Cotizaciones.',
      'Para que el ticket promedio sea representativo, todos los pedidos deben tener DocTotal correcto.',
    ],
    tips: [
      'Use este reporte en reuniones mensuales de resultados.',
      'Compare la tasa de conversión mes a mes para medir mejoras en el proceso de ventas.',
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

export function getHelpContent(pathname: string): HelpContent | null {
  // Exact match first
  if (helpByRoute[pathname]) return helpByRoute[pathname];

  // Skip detail pages (e.g., /accounts/123) and "coming soon" pages
  return null;
}
