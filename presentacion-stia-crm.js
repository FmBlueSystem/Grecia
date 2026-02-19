const pptxgen = require("pptxgenjs");
const path = require("path");

const C = {
  navy: "0A0F1A", primary: "0067B2", primaryDark: "004C8A", page: "F8FAFC",
  white: "FFFFFF", textPrimary: "0F172A", textSecondary: "64748B", textMuted: "94A3B8",
  border: "E2E8F0", success: "10B981", error: "EF4444", warning: "F59E0B",
};
const mkSh = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12 });
const IMG = (name) => path.join(__dirname, "screenshots", name + ".png");

async function build() {
  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "BlueSystem.io";
  pres.title = "STIA CRM - Presentación de Diseño";

  // ===== SLIDE 1: COVER =====
  let s1 = pres.addSlide();
  s1.background = { color: C.navy };
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.primary } });
  s1.addShape(pres.shapes.OVAL, { x: 7.5, y: -1, w: 4.5, h: 4.5, fill: { color: C.primary, transparency: 15 } });
  s1.addShape(pres.shapes.OVAL, { x: 8, y: 2.5, w: 3.5, h: 3.5, fill: { color: C.primary, transparency: 8 } });
  s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.2, w: 0.55, h: 0.55, fill: { color: C.primary } });
  s1.addText("S", { x: 0.8, y: 1.2, w: 0.55, h: 0.55, fontSize: 20, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle" });
  s1.addText("STIA CRM", { x: 1.5, y: 1.22, w: 3, h: 0.5, fontSize: 20, fontFace: "Arial", bold: true, color: C.white, margin: 0 });
  s1.addText("Customer Relationship\nManagement", { x: 0.8, y: 2.2, w: 6, h: 1.6, fontSize: 38, fontFace: "Arial", bold: true, color: C.white, margin: 0, lineSpacingMultiple: 1.1 });
  s1.addText("Diseño de Interfaz y Arquitectura Backend", { x: 0.8, y: 3.85, w: 6, h: 0.4, fontSize: 16, fontFace: "Arial", color: C.textMuted, margin: 0 });
  s1.addShape(pres.shapes.LINE, { x: 0.8, y: 4.6, w: 3, h: 0, line: { color: C.primary, width: 2 } });
  s1.addText("Febrero 2026  |  Preparado por BlueSystem.io", { x: 0.8, y: 4.75, w: 5, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.textMuted, margin: 0 });
  s1.addText("Para: Grecia Rosales  |  STIA - Soluciones al Procesar Alimentos", { x: 0.8, y: 5.0, w: 6, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.textSecondary, margin: 0 });

  // ===== SLIDE 2: RESUMEN EJECUTIVO =====
  let s2 = pres.addSlide();
  s2.background = { color: C.page };
  s2.addText("Resumen Ejecutivo", { x: 0.6, y: 0.35, w: 5, h: 0.6, fontSize: 28, fontFace: "Arial", bold: true, color: C.textPrimary, margin: 0 });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.primary } });

  const stats = [
    { num: "18", label: "Pantallas\nDiseñadas", color: C.primary },
    { num: "5", label: "Países\nMulti-tenant", color: "0EA5E9" },
    { num: "12", label: "Endpoints\nAPI REST", color: "6366F1" },
    { num: "100%", label: "Datos Reales\nSAP B1", color: "8B5CF6" },
  ];
  stats.forEach((s, i) => {
    const x = 0.6 + i * 2.3;
    s2.addShape(pres.shapes.RECTANGLE, { x, y: 1.35, w: 2.1, h: 1.5, fill: { color: C.white }, shadow: mkSh() });
    s2.addShape(pres.shapes.RECTANGLE, { x, y: 1.35, w: 2.1, h: 0.06, fill: { color: s.color } });
    s2.addText(s.num, { x: x + 0.15, y: 1.5, w: 1.8, h: 0.6, fontSize: 32, fontFace: "Arial", bold: true, color: s.color, align: "center", margin: 0 });
    s2.addText(s.label, { x: x + 0.15, y: 2.1, w: 1.8, h: 0.55, fontSize: 11, fontFace: "Arial", color: C.textSecondary, align: "center", margin: 0 });
  });

  s2.addText("Plataforma CRM diseñada para el área de Mercadeo y Ventas de STIA, integrando datos reales de SAP Business One Service Layer con una interfaz moderna inspirada en Microsoft Dynamics 365 Sales.", {
    x: 0.6, y: 3.15, w: 8.8, h: 0.6, fontSize: 12.5, fontFace: "Arial", color: C.textSecondary, margin: 0, lineSpacingMultiple: 1.5
  });

  const modules = [
    "Paneles de Ventas (Light/Dark)", "Customer 360 con BPF", "Contactos y Prospectos",
    "Pipeline Kanban con conversión", "Cotizaciones con detalle", "Pedidos con logística",
    "Facturas integradas SAP", "Actividades y calendario", "Catálogo de Productos",
    "Casos de soporte", "Ofertas Perdidas", "Trazabilidad de lotes",
    "Dashboard Logística", "Reportes y Análisis", "Login multi-empresa"
  ];
  s2.addText("Módulos Incluidos:", { x: 0.6, y: 3.85, w: 3, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: C.textPrimary, margin: 0 });
  [modules.slice(0, 5), modules.slice(5, 10), modules.slice(10)].forEach((col, ci) => {
    s2.addText(col.map((m, mi) => ({ text: m, options: { bullet: true, breakLine: mi < col.length - 1, fontSize: 10, color: C.textSecondary } })), { x: 0.6 + ci * 3.1, y: 4.2, w: 3, h: 1.3 });
  });

  // ===== SCREENSHOT SLIDES =====
  // Helper: add a slide with 2 screenshots side by side
  function addScreenshotSlide(title, left, right) {
    const sl = pres.addSlide();
    sl.background = { color: C.page };
    // Title bar
    sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: C.navy } });
    sl.addText(title, { x: 0.5, y: 0.08, w: 9, h: 0.55, fontSize: 18, fontFace: "Arial", bold: true, color: C.white, margin: 0, valign: "middle" });

    // Left image
    sl.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 0.9, w: 4.75, h: 0.04, fill: { color: left.color || C.primary } });
    sl.addImage({ path: IMG(left.file), x: 0.2, y: 0.94, w: 4.75, h: 3.17, rounding: false });
    sl.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 0.94, w: 4.75, h: 3.17, line: { color: C.border, width: 0.75 } });
    sl.addText(left.label, { x: 0.2, y: 4.2, w: 4.75, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: C.textPrimary, align: "center", margin: 0 });
    if (left.desc) sl.addText(left.desc, { x: 0.2, y: 4.55, w: 4.75, h: 0.9, fontSize: 9.5, fontFace: "Arial", color: C.textSecondary, align: "center", margin: 0, lineSpacingMultiple: 1.3 });

    // Right image
    sl.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 0.9, w: 4.75, h: 0.04, fill: { color: right.color || C.primary } });
    sl.addImage({ path: IMG(right.file), x: 5.1, y: 0.94, w: 4.75, h: 3.17, rounding: false });
    sl.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 0.94, w: 4.75, h: 3.17, line: { color: C.border, width: 0.75 } });
    sl.addText(right.label, { x: 5.1, y: 4.2, w: 4.75, h: 0.35, fontSize: 13, fontFace: "Arial", bold: true, color: C.textPrimary, align: "center", margin: 0 });
    if (right.desc) sl.addText(right.desc, { x: 5.1, y: 4.55, w: 4.75, h: 0.9, fontSize: 9.5, fontFace: "Arial", color: C.textSecondary, align: "center", margin: 0, lineSpacingMultiple: 1.3 });
  }

  // Helper: add a slide with 1 large screenshot
  function addSingleScreenshotSlide(title, img) {
    const sl = pres.addSlide();
    sl.background = { color: C.page };
    sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: C.navy } });
    sl.addText(title, { x: 0.5, y: 0.08, w: 9, h: 0.55, fontSize: 18, fontFace: "Arial", bold: true, color: C.white, margin: 0, valign: "middle" });

    sl.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.9, w: 8.8, h: 0.04, fill: { color: img.color || C.primary } });
    sl.addImage({ path: IMG(img.file), x: 0.6, y: 0.94, w: 8.8, h: 3.67 });
    sl.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.94, w: 8.8, h: 3.67, line: { color: C.border, width: 0.75 } });
    sl.addText(img.label, { x: 0.6, y: 4.7, w: 8.8, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: C.textPrimary, align: "center", margin: 0 });
    if (img.desc) sl.addText(img.desc, { x: 0.6, y: 5.05, w: 8.8, h: 0.5, fontSize: 10.5, fontFace: "Arial", color: C.textSecondary, align: "center", margin: 0 });
  }

  // --- SECTION: GALLERY DIVIDER ---
  let div = pres.addSlide();
  div.background = { color: C.navy };
  div.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.primary } });
  div.addShape(pres.shapes.OVAL, { x: 7, y: 1, w: 5, h: 5, fill: { color: C.primary, transparency: 10 } });
  div.addText("Galería de Pantallas", { x: 0.8, y: 1.5, w: 7, h: 1.2, fontSize: 40, fontFace: "Arial", bold: true, color: C.white, margin: 0 });
  div.addText("18 pantallas diseñadas con datos reales de SAP Business One", { x: 0.8, y: 2.8, w: 6, h: 0.5, fontSize: 16, fontFace: "Arial", color: C.textMuted, margin: 0 });
  div.addShape(pres.shapes.LINE, { x: 0.8, y: 3.6, w: 3, h: 0, line: { color: C.primary, width: 2 } });

  // --- Screenshot Slides (2 per slide) ---

  // 1. Login + Dashboard Light
  addScreenshotSlide("Acceso y Panel Principal",
    { file: "01-Login", label: "Login", desc: "Selector de empresa (5 países)\nAutenticación JWT multi-tenant", color: C.primary },
    { file: "02-Dashboard-Light", label: "Dashboard de Ventas (Light)", desc: "KPIs: ₡478.7M ingresos, 342 clientes\nGráficos por país y categoría", color: "0EA5E9" }
  );

  // 2. Dashboard Dark + Customer 360
  addScreenshotSlide("Dashboard Dark y Vista del Cliente",
    { file: "03-Dashboard-Dark", label: "Dashboard de Ventas (Dark)", desc: "Mismos KPIs en modo oscuro\nPreferencia visual del usuario", color: C.navy },
    { file: "04-Customer-360", label: "Customer 360", desc: "Vista completa del cliente con tabs\nBarra de Proceso de Venta (BPF)", color: "6366F1" }
  );

  // 3. Contactos + Prospectos
  addScreenshotSlide("Gestión de Contactos y Prospectos",
    { file: "05-Contactos", label: "Contactos", desc: "342 contactos, 218 activos\nFiltros por país y estado", color: "059669" },
    { file: "06-Prospectos", label: "Prospectos (Leads)", desc: "47 prospectos, conversión 23.4%\nPipeline potencial Q2.1M", color: "D97706" }
  );

  // 4. Pipeline + Cotizaciones
  addScreenshotSlide("Embudo de Ventas y Cotizaciones",
    { file: "07-Pipeline", label: "Pipeline / Embudo", desc: "Kanban: Prospección → Cerrado/Ganado\nBarra de conversión y totales por etapa", color: "8B5CF6" },
    { file: "08-Cotizaciones", label: "Cotizaciones", desc: "24 activas, valor Q4.8M\nTasa de cierre 34.2%, tiempo 18 días", color: C.primary }
  );

  // 5. Detalle Cotización (single - important screen)
  addSingleScreenshotSlide("Detalle de Cotización COT-29171",
    { file: "16-Detalle-Cotizacion", label: "Detalle de Cotización", desc: "BPF de cotización, líneas de producto con precios, totales con impuestos, actividad reciente y notas", color: "6366F1" }
  );

  // 6. Pedidos + Facturas
  addScreenshotSlide("Pedidos y Facturación",
    { file: "09-Pedidos", label: "Pedidos", desc: "18 pedidos, ₡3.2M valor, 96.4% completos\nSeguimiento logístico en 4 etapas", color: "059669" },
    { file: "10-Facturas", label: "Facturas", desc: "Q1.8M pendiente, Q2.4M total\nEstados: Pendiente, Parcial, Pagado", color: "DC2626" }
  );

  // 7. Actividades + Productos
  addScreenshotSlide("Actividades y Catálogo de Productos",
    { file: "11-Actividades", label: "Actividades", desc: "Llamadas, emails, reuniones, tareas\nVista hoy + próximos 7 días", color: "7C3AED" },
    { file: "12-Productos", label: "Productos", desc: "Catálogo con imágenes reales\nEquipos industriales con SKU SAP", color: "2563EB" }
  );

  // 8. Casos + Ofertas Perdidas
  addScreenshotSlide("Soporte y Análisis de Pérdidas",
    { file: "13-Casos", label: "Casos de Soporte", desc: "7 abiertos, 3 en proceso\nTiempo respuesta promedio: 2.4 días", color: "EA580C" },
    { file: "14-Ofertas-Perdidas", label: "Ofertas Perdidas", desc: "44 ofertas, $1.86M valor perdido\nMotivos: Precio 44%, Competencia", color: "BE185D" }
  );

  // 9. Trazabilidad + Logística
  addScreenshotSlide("Trazabilidad y Logística",
    { file: "15-Trazabilidad", label: "Trazabilidad", desc: "Árbol de documentos relacionados\nRegistro de auditoría por usuario", color: "0D9488" },
    { file: "17-Dashboard-Logistica", label: "Dashboard Logística", desc: "Envíos en tránsito, estados, países\nTimeline de entregas recientes", color: C.primary }
  );

  // 10. Reportes (single)
  addSingleScreenshotSlide("Reportes y Análisis",
    { file: "18-Reportes", label: "Reportes y Análisis", desc: "₡5.87B ingresos totales, conversión 34.2%, ventas por país, Top 5 vendedores. Exportar a PDF.", color: "4F46E5" }
  );

  // ===== ARCHITECTURE SECTION DIVIDER =====
  let div2 = pres.addSlide();
  div2.background = { color: C.navy };
  div2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.primary } });
  div2.addShape(pres.shapes.OVAL, { x: 7, y: 1, w: 5, h: 5, fill: { color: C.primary, transparency: 10 } });
  div2.addText("Arquitectura y\nEstado Técnico", { x: 0.8, y: 1.5, w: 7, h: 1.6, fontSize: 40, fontFace: "Arial", bold: true, color: C.white, margin: 0, lineSpacingMultiple: 1.1 });
  div2.addText("Backend, SAP Service Layer e infraestructura", { x: 0.8, y: 3.2, w: 6, h: 0.5, fontSize: 16, fontFace: "Arial", color: C.textMuted, margin: 0 });
  div2.addShape(pres.shapes.LINE, { x: 0.8, y: 4.0, w: 3, h: 0, line: { color: C.primary, width: 2 } });

  // ===== SLIDE: MULTI-PAÍS =====
  let s5 = pres.addSlide();
  s5.background = { color: C.page };
  s5.addText("Arquitectura Multi-País", { x: 0.6, y: 0.35, w: 6, h: 0.6, fontSize: 28, fontFace: "Arial", bold: true, color: C.textPrimary, margin: 0 });
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.primary } });
  s5.addText("Cada país conecta a su propia base de datos SAP Business One, con moneda local y datos independientes.", {
    x: 0.6, y: 1.15, w: 8.8, h: 0.4, fontSize: 12.5, fontFace: "Arial", color: C.textSecondary, margin: 0
  });

  const countries = [
    { code: "CR", name: "Costa Rica", db: "SBO_STIACR_PROD", cur: "CRC (₡)", c: "0067B2" },
    { code: "GT", name: "Guatemala", db: "SBO_GT_STIA_PROD", cur: "GTQ (Q)", c: "0EA5E9" },
    { code: "SV", name: "El Salvador", db: "SBO_SV_STIA_FINAL", cur: "USD ($)", c: "6366F1" },
    { code: "HN", name: "Honduras", db: "SBO_HO_STIA_PROD", cur: "HNL (L)", c: "8B5CF6" },
    { code: "PA", name: "Panamá", db: "SBO_PA_STIA_PROD", cur: "USD ($)", c: "059669" },
  ];
  countries.forEach((ct, i) => {
    const x = 0.35 + i * 1.95;
    s5.addShape(pres.shapes.RECTANGLE, { x, y: 1.75, w: 1.8, h: 2.4, fill: { color: C.white }, shadow: mkSh() });
    s5.addShape(pres.shapes.RECTANGLE, { x, y: 1.75, w: 1.8, h: 0.6, fill: { color: ct.c } });
    s5.addText(ct.code, { x, y: 1.75, w: 1.8, h: 0.6, fontSize: 24, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle" });
    s5.addText(ct.name, { x: x + 0.1, y: 2.5, w: 1.6, h: 0.3, fontSize: 12, fontFace: "Arial", bold: true, color: C.textPrimary, align: "center", margin: 0 });
    s5.addText(ct.cur, { x: x + 0.1, y: 2.8, w: 1.6, h: 0.25, fontSize: 10, fontFace: "Arial", color: C.textSecondary, align: "center", margin: 0 });
    s5.addText(ct.db, { x: x + 0.05, y: 3.2, w: 1.7, h: 0.7, fontSize: 8, fontFace: "Consolas", color: C.textMuted, align: "center", margin: 0 });
  });

  s5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.4, w: 9, h: 0.85, fill: { color: C.white }, shadow: mkSh() });
  s5.addText("Conexión SAP Service Layer", { x: 0.75, y: 4.45, w: 4, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: C.textPrimary, margin: 0 });
  s5.addText("Endpoint: sap-stiacmzdr-sl.skyinone.net:50000/b1s/v1  |  Sesiones automáticas con retry  |  Header: x-company-id", {
    x: 0.75, y: 4.8, w: 8.5, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textSecondary, margin: 0
  });

  // ===== SLIDE: BACKEND STATUS =====
  let s6 = pres.addSlide();
  s6.background = { color: C.page };
  s6.addText("Estado del Backend", { x: 0.6, y: 0.35, w: 6, h: 0.6, fontSize: 28, fontFace: "Arial", bold: true, color: C.textPrimary, margin: 0 });
  s6.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.primary } });

  const hOpts = { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 10, fontFace: "Arial", align: "left", valign: "middle" };
  const cG = (t) => ({ text: t, options: { fontSize: 9.5, fontFace: "Arial", color: "059669", valign: "middle" } });
  const cY = (t) => ({ text: t, options: { fontSize: 9.5, fontFace: "Arial", color: "D97706", valign: "middle" } });
  const cR = (t) => ({ text: t, options: { fontSize: 9.5, fontFace: "Arial", color: "DC2626", valign: "middle" } });
  const cM = (t) => ({ text: t, options: { fontSize: 9.5, fontFace: "Arial", color: C.textMuted, valign: "middle" } });

  const tRows = [
    [{ text: "Módulo", options: hOpts }, { text: "Endpoints API", options: hOpts }, { text: "Base de Datos", options: hOpts }, { text: "SAP Service Layer", options: hOpts }],
    [cG("Auth (Login)"), cG("POST /login, /me, /logout"), cG("Users + JWT"), cM("No requerido")],
    [cG("Cuentas"), cG("CRUD completo"), cG("Account + sapId"), cY("Ref sin sync")],
    [cG("Contactos"), cG("CRUD + soft delete"), cG("Contact model"), cY("Sin sync")],
    [cG("Prospectos"), cG("CRUD + /qualify"), cG("Lead conversión"), cY("Sin sync")],
    [cG("Oportunidades"), cG("CRUD + auto-Order"), cG("Pipeline stages"), cY("Sin sync")],
    [cG("Cotizaciones"), cG("CRUD con items"), cG("Quote + Items"), cR("Falta Quotations")],
    [cG("Pedidos"), cG("CRUD + /logistics"), cG("Order + Items"), cY("Comentado MVP")],
    [cG("Facturas"), cG("CRUD básico"), cG("Invoice model"), cR("Falta Invoices")],
    [cG("Actividades"), cG("CRUD completo"), cG("Activity model"), cR("Falta Activities")],
    [cG("Productos"), cG("Listar + Crear"), cG("Product model"), cR("Falta Items OITM")],
    [cG("Casos"), cG("Listar + Crear"), cG("Case model"), cM("No existe en SAP")],
    [cG("Dashboard"), cG("GET /stats"), cG("Queries agregadas"), cY("KPIs locales")],
  ];
  s6.addTable(tRows, { x: 0.35, y: 1.15, w: 9.3, colW: [1.5, 2.4, 2.2, 3.2], border: { pt: 0.5, color: C.border }, rowH: 0.31 });
  s6.addText([
    { text: "Completado", options: { color: "059669", fontSize: 9, bold: true } },
    { text: "     Parcial", options: { color: "D97706", fontSize: 9, bold: true } },
    { text: "     Falta integrar", options: { color: "DC2626", fontSize: 9, bold: true } },
    { text: "     No aplica", options: { color: C.textMuted, fontSize: 9 } },
  ], { x: 0.5, y: 5.2, w: 9, h: 0.3, margin: 0 });

  // ===== SLIDE: SAP PENDIENTE =====
  let s7 = pres.addSlide();
  s7.background = { color: C.page };
  s7.addText("SAP Service Layer — Pendiente", { x: 0.6, y: 0.35, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial", bold: true, color: C.textPrimary, margin: 0 });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.error } });

  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.3, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: mkSh() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.3, w: 4.4, h: 0.05, fill: { color: C.success } });
  s7.addText("Implementado", { x: 0.7, y: 1.45, w: 3, h: 0.35, fontSize: 16, fontFace: "Arial", bold: true, color: "059669", margin: 0 });
  const impl = [
    "Conexión multi-empresa (5 DBs SAP)", "Gestión sesiones con auto-retry 401",
    "Header x-company-id para tenant", "AxiosInstance con B1SESSION cookie",
    "SSL self-signed certs soportado", "Servicio createOrderFromOpportunity",
    "Account.sapId → BusinessPartner", "Invoice.sapInvoiceId → SAP",
    "Order.sapOrderId → SAP", "Product.code → SAP ItemCode",
  ];
  impl.forEach((item, i) => {
    s7.addText("•  " + item, { x: 0.7, y: 1.9 + i * 0.28, w: 4, h: 0.26, fontSize: 9.5, fontFace: "Arial", color: C.textSecondary, margin: 0 });
  });

  s7.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.3, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: mkSh() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.3, w: 4.4, h: 0.05, fill: { color: C.error } });
  s7.addText("Pendiente de Integrar", { x: 5.3, y: 1.45, w: 3.5, h: 0.35, fontSize: 16, fontFace: "Arial", bold: true, color: "DC2626", margin: 0 });
  const miss = [
    "GET BusinessPartners → Cuentas", "GET Quotations (OCQT) → Cotizaciones",
    "POST Quotations → Crear en SAP", "GET Orders → Sincronizar pedidos",
    "POST Orders → Crear en SAP (activo)", "GET Invoices (OINV) → Facturas",
    "GET Items (OITM) → Productos", "GET Activities (OACT) → Actividades",
    "Sync bidireccional completa", "Filtros por company en queries DB",
  ];
  miss.forEach((item, i) => {
    s7.addText("•  " + item, { x: 5.3, y: 1.9 + i * 0.28, w: 4, h: 0.26, fontSize: 9.5, fontFace: "Arial", color: C.textSecondary, margin: 0 });
  });

  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 5.05, w: 9, h: 0.35, fill: { color: "FEF3C7" } });
  s7.addText("Credenciales SAP en código fuente — mover a .env antes de producción", {
    x: 0.7, y: 5.05, w: 8.6, h: 0.35, fontSize: 10, fontFace: "Arial", color: "92400E", margin: 0
  });

  // ===== SLIDE: STACK =====
  let s8 = pres.addSlide();
  s8.background = { color: C.page };
  s8.addText("Stack Tecnológico", { x: 0.6, y: 0.35, w: 6, h: 0.6, fontSize: 28, fontFace: "Arial", bold: true, color: C.textPrimary, margin: 0 });
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.primary } });

  const stacks = [
    { t: "Frontend", items: ["React 18 + TypeScript", "TailwindCSS", "React Hook Form + Zod", "i18next (ES/EN)", "Zustand store", "React Router v6", "Lucide Icons"], c: C.primary },
    { t: "Backend", items: ["Fastify 4 (Node.js)", "Prisma ORM", "PostgreSQL", "JWT Auth", "Zod validation", "Helmet + CORS", "Pino logging"], c: "6366F1" },
    { t: "Integración", items: ["SAP B1 Service Layer", "REST API (OData)", "Multi-tenant sessions", "Auto-retry on 401", "5 bases SAP", "Axios interceptors", "SSL self-signed"], c: "059669" },
    { t: "Diseño", items: ["Pencil (.pen editor)", "18 pantallas mockup", "Componentes reusables", "Design tokens (vars)", "Datos reales SAP", "Responsive sidebar", "Dark/Light mode"], c: "D97706" },
  ];
  stacks.forEach((s, i) => {
    const x = 0.35 + i * 2.4;
    s8.addShape(pres.shapes.RECTANGLE, { x, y: 1.25, w: 2.25, h: 4.1, fill: { color: C.white }, shadow: mkSh() });
    s8.addShape(pres.shapes.RECTANGLE, { x, y: 1.25, w: 2.25, h: 0.5, fill: { color: s.c } });
    s8.addText(s.t, { x, y: 1.25, w: 2.25, h: 0.5, fontSize: 14, fontFace: "Arial", bold: true, color: C.white, align: "center", valign: "middle" });
    s.items.forEach((item, j) => {
      s8.addText("•  " + item, { x: x + 0.15, y: 1.95 + j * 0.4, w: 1.95, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.textSecondary, margin: 0 });
    });
  });

  // ===== SLIDE: PRÓXIMOS PASOS =====
  let s9 = pres.addSlide();
  s9.background = { color: C.navy };
  s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.primary } });
  s9.addShape(pres.shapes.OVAL, { x: 7.5, y: 3, w: 4, h: 4, fill: { color: C.primary, transparency: 10 } });
  s9.addText("Próximos Pasos", { x: 0.6, y: 0.4, w: 5, h: 0.55, fontSize: 28, fontFace: "Arial", bold: true, color: C.white, margin: 0 });
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.0, w: 1.5, h: 0.04, fill: { color: C.primary } });

  const steps = [
    { p: "Fase 1", t: "Integración SAP Completa", d: "Conectar lectura/escritura de BusinessPartners, Quotations, Orders, Invoices e Items. Sincronización bidireccional.", c: C.primary },
    { p: "Fase 2", t: "Frontend Funcional", d: "Implementar las 18 pantallas en React con datos reales. Formularios, filtros, paginación y navegación completa.", c: "0EA5E9" },
    { p: "Fase 3", t: "Multi-tenant Real", d: "Filtrar datos por empresa en todas las consultas. Dashboard KPIs por país. Selector empresa funcional.", c: "6366F1" },
    { p: "Fase 4", t: "QA y Despliegue", d: "Testing end-to-end, optimización, configuración servidor producción y capacitación de usuarios.", c: "059669" },
  ];
  steps.forEach((step, i) => {
    const y = 1.3 + i * 1.05;
    s9.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.6, h: 0.9, fill: { color: "142238" } });
    s9.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.06, h: 0.9, fill: { color: step.c } });
    s9.addText(step.p, { x: 0.85, y, w: 0.85, h: 0.9, fontSize: 10, fontFace: "Arial", bold: true, color: step.c, valign: "middle", margin: 0 });
    s9.addText(step.t, { x: 1.75, y: y + 0.08, w: 7, h: 0.35, fontSize: 15, fontFace: "Arial", bold: true, color: C.white, margin: 0 });
    s9.addText(step.d, { x: 1.75, y: y + 0.45, w: 7, h: 0.35, fontSize: 10.5, fontFace: "Arial", color: C.textMuted, margin: 0 });
  });

  s9.addShape(pres.shapes.LINE, { x: 0.6, y: 5.0, w: 4, h: 0, line: { color: C.primary, width: 1.5 } });
  s9.addText("BlueSystem.io  |  Freddy Molina  |  freddy@bluesystem.io", { x: 0.6, y: 5.1, w: 6, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textMuted, margin: 0 });

  await pres.writeFile({ fileName: "/Users/freddymolina/Desktop/Stia/Grecia/STIA-CRM-Presentacion.pptx" });
  console.log("OK: STIA-CRM-Presentacion.pptx generada con 18 screenshots");
}

build().catch(console.error);
