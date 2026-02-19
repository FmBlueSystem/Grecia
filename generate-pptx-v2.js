const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "STIA - BlueSystem";
pres.title = "STIA CRM - Sistema de Gestion Empresarial";

const C = {
  dark: "0F172A",
  darkAlt: "1E1B4B",
  primary: "4338CA",
  primaryLight: "6366F1",
  primaryBg: "EEF2FF",
  white: "FFFFFF",
  offWhite: "F8FAFC",
  text: "1E293B",
  textMuted: "64748B",
  accent: "10B981",
  accentBg: "ECFDF5",
  amber: "F59E0B",
  amberBg: "FFFBEB",
  red: "EF4444",
};

const FONT_H = "Arial Black";
const FONT_B = "Arial";

const basePath = "/Users/freddymolina/Desktop/Stia/Grecia/";

const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.12 });

// ========== SLIDE 1: TITLE ==========
const s1 = pres.addSlide();
s1.background = { color: C.dark };

s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 5.625,
  fill: { color: C.darkAlt, transparency: 40 },
});

s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 4.8, w: 10, h: 0.06,
  fill: { color: C.primaryLight },
});

s1.addText("STIA CRM", {
  x: 0.8, y: 1.0, w: 8.4, h: 1.2,
  fontSize: 54, fontFace: FONT_H, color: C.white, bold: true,
  charSpacing: 4, margin: 0,
});

s1.addText("Sistema de Gestion Empresarial", {
  x: 0.8, y: 2.1, w: 8.4, h: 0.6,
  fontSize: 22, fontFace: FONT_B, color: C.primaryLight, margin: 0,
});

s1.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 2.9, w: 2.5, h: 0.04,
  fill: { color: C.primaryLight },
});

s1.addText("Plataforma CRM multi-compania con integracion SAP Business One", {
  x: 0.8, y: 3.2, w: 6, h: 0.5,
  fontSize: 14, fontFace: FONT_B, color: "94A3B8", margin: 0,
});

s1.addText("EN PRODUCCION", {
  x: 7.5, y: 3.15, w: 1.8, h: 0.4,
  fontSize: 11, fontFace: FONT_H, color: C.accent, bold: true,
  align: "center", valign: "middle",
  shape: pres.shapes.ROUNDED_RECTANGLE,
  fill: { color: "064E3B" }, rectRadius: 0.05,
});

s1.addText([
  { text: "Grecia Rosales  |  STIA - Soluciones al Procesar Alimentos", options: { fontSize: 11, color: "94A3B8" } },
], { x: 0.8, y: 4.95, w: 8, h: 0.4, fontFace: FONT_B, margin: 0 });

s1.addText("Febrero 2026", {
  x: 7.5, y: 4.95, w: 2, h: 0.4,
  fontSize: 11, fontFace: FONT_B, color: "64748B", align: "right", margin: 0,
});

// ========== SLIDE 2: EL PROBLEMA ==========
const s2 = pres.addSlide();
s2.background = { color: C.offWhite };

s2.addText("El Desafio", {
  x: 0.8, y: 0.4, w: 8, h: 0.7,
  fontSize: 36, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});

s2.addText("Equipos de ventas sin visibilidad unificada de clientes", {
  x: 0.8, y: 1.1, w: 8, h: 0.4,
  fontSize: 14, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

const problems = [
  { icon: "1", title: "Datos Fragmentados", desc: "Informacion de clientes, cotizaciones y pedidos dispersa entre Excel, email y SAP" },
  { icon: "2", title: "Sin Visibilidad Gerencial", desc: "Gerentes no pueden ver pipeline, conversion ni rendimiento del equipo en tiempo real" },
  { icon: "3", title: "Busqueda Ineficiente", desc: "Vendedores pierden tiempo buscando informacion de clientes en multiples sistemas" },
  { icon: "4", title: "Sin Proyecciones", desc: "No hay forecasting de ventas basado en datos reales del pipeline" },
];

problems.forEach((p, i) => {
  const row = Math.floor(i / 2);
  const col = i % 2;
  const px = 0.8 + col * 4.4;
  const py = 1.8 + row * 1.6;

  s2.addShape(pres.shapes.RECTANGLE, {
    x: px, y: py, w: 4, h: 1.3,
    fill: { color: C.white }, shadow: makeShadow(),
  });

  s2.addShape(pres.shapes.RECTANGLE, {
    x: px, y: py, w: 0.06, h: 1.3,
    fill: { color: C.red },
  });

  s2.addText(p.icon, {
    x: px + 0.25, y: py + 0.2, w: 0.45, h: 0.45,
    fontSize: 16, fontFace: FONT_H, color: C.white, bold: true,
    align: "center", valign: "middle",
    shape: pres.shapes.OVAL, fill: { color: C.red },
  });

  s2.addText(p.title, {
    x: px + 0.85, y: py + 0.2, w: 2.9, h: 0.35,
    fontSize: 14, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
  });

  s2.addText(p.desc, {
    x: px + 0.85, y: py + 0.55, w: 2.9, h: 0.6,
    fontSize: 10, fontFace: FONT_B, color: C.textMuted, margin: 0,
  });
});

// ========== SLIDE 3: LA SOLUCION ==========
const s3 = pres.addSlide();
s3.background = { color: C.dark };

s3.addText("STIA CRM: La Solucion", {
  x: 0.8, y: 0.35, w: 8, h: 0.7,
  fontSize: 34, fontFace: FONT_H, color: C.white, bold: true, margin: 0,
});

s3.addText("Plataforma unificada conectada a SAP B1 en tiempo real", {
  x: 0.8, y: 1.0, w: 8, h: 0.4,
  fontSize: 14, fontFace: FONT_B, color: "94A3B8", margin: 0,
});

const stats = [
  { value: "26+", label: "Pantallas", color: C.primaryLight },
  { value: "5", label: "Paises", color: C.accent },
  { value: "12", label: "Endpoints SAP", color: C.amber },
  { value: "3", label: "Roles", color: "EC4899" },
];

stats.forEach((st, i) => {
  const sx = 0.8 + i * 2.25;
  s3.addShape(pres.shapes.RECTANGLE, {
    x: sx, y: 1.6, w: 2, h: 1.2,
    fill: { color: "1E293B" }, shadow: makeShadow(),
  });
  s3.addText(st.value, {
    x: sx, y: 1.7, w: 2, h: 0.65,
    fontSize: 36, fontFace: FONT_H, color: st.color, bold: true, align: "center", margin: 0,
  });
  s3.addText(st.label, {
    x: sx, y: 2.35, w: 2, h: 0.35,
    fontSize: 12, fontFace: FONT_B, color: "94A3B8", align: "center", margin: 0,
  });
});

const modules = [
  ["Dashboard Comercial", "KPIs en tiempo real, graficos interactivos"],
  ["Cuentas y Contactos", "Sincronizados desde SAP Business Partners"],
  ["Cotizaciones y Pedidos", "Documentos SAP con detalle y navegacion"],
  ["Facturas y Cobros", "Estado de cobro, vencidos, historial"],
  ["Pipeline y Prospectos", "Embudo de ventas con drag & drop"],
  ["Forecasting", "Proyecciones basadas en pipeline real"],
  ["Busqueda Global", "Cmd+K para buscar en todas las entidades"],
  ["Reportes", "Analisis por vendedor, cliente y periodo"],
];

modules.forEach((m, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const mx = 0.8 + col * 4.5;
  const my = 3.1 + row * 0.58;

  s3.addText(m[0], {
    x: mx, y: my, w: 1.8, h: 0.4,
    fontSize: 10, fontFace: FONT_H, color: C.primaryLight, bold: true, margin: 0,
  });
  s3.addText(m[1], {
    x: mx + 1.9, y: my, w: 2.5, h: 0.4,
    fontSize: 9, fontFace: FONT_B, color: "94A3B8", margin: 0,
  });
});

// ========== SLIDE 4: LOGIN ==========
const s4 = pres.addSlide();
s4.background = { color: C.offWhite };

s4.addText("Acceso por Roles", {
  x: 0.6, y: 0.3, w: 4, h: 0.55,
  fontSize: 28, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s4.addText("3 perfiles con permisos diferenciados", {
  x: 0.6, y: 0.8, w: 4, h: 0.35,
  fontSize: 12, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

s4.addImage({
  path: basePath + "pptx-01-login.png",
  x: 4.5, y: 0.3, w: 5.2, h: 5.0,
  shadow: makeShadow(),
});

const roles = [
  { role: "Admin", user: "Freddy Molina", scope: "Todas las companias y datos", color: C.primary },
  { role: "Gerente", user: "Mariana Solis", scope: "Datos de su pais (Costa Rica)", color: C.accent },
  { role: "Vendedor", user: "Mario Marin", scope: "Solo sus propios clientes", color: C.amber },
];

roles.forEach((r, i) => {
  const ry = 1.4 + i * 1.25;
  s4.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: ry, w: 3.6, h: 1.0,
    fill: { color: C.white }, shadow: makeShadow(),
  });
  s4.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: ry, w: 0.06, h: 1.0,
    fill: { color: r.color },
  });
  s4.addText(r.role, {
    x: 0.85, y: ry + 0.1, w: 3, h: 0.3,
    fontSize: 14, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
  });
  s4.addText(r.user, {
    x: 0.85, y: ry + 0.38, w: 3, h: 0.25,
    fontSize: 10, fontFace: FONT_B, color: C.primaryLight, margin: 0,
  });
  s4.addText(r.scope, {
    x: 0.85, y: ry + 0.62, w: 3, h: 0.25,
    fontSize: 9, fontFace: FONT_B, color: C.textMuted, margin: 0,
  });
});

// ========== SLIDE 5: VENDEDOR DASHBOARD ==========
const s5 = pres.addSlide();
s5.background = { color: C.offWhite };

s5.addText("Vista Vendedor: Dashboard", {
  x: 0.6, y: 0.25, w: 6, h: 0.55,
  fontSize: 26, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s5.addText("Mario Marin  |  Datos propios en tiempo real desde SAP", {
  x: 0.6, y: 0.75, w: 7, h: 0.3,
  fontSize: 11, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

s5.addImage({
  path: basePath + "pptx-02-vendedor-dashboard.png",
  x: 0.4, y: 1.2, w: 9.2, h: 4.3,
  shadow: makeShadow(),
});

// Callout KPIs
const callouts5 = [
  { value: "$13.9M", label: "Ingresos propios", x: 7.2, y: 0.2, color: C.primary },
  { value: "50%", label: "Conversion", x: 8.6, y: 0.2, color: C.accent },
];
callouts5.forEach(c => {
  s5.addShape(pres.shapes.RECTANGLE, {
    x: c.x, y: c.y, w: 1.2, h: 0.8,
    fill: { color: C.white }, shadow: makeShadow(),
  });
  s5.addText(c.value, {
    x: c.x, y: c.y + 0.05, w: 1.2, h: 0.4,
    fontSize: 16, fontFace: FONT_H, color: c.color, bold: true, align: "center", margin: 0,
  });
  s5.addText(c.label, {
    x: c.x, y: c.y + 0.45, w: 1.2, h: 0.3,
    fontSize: 8, fontFace: FONT_B, color: C.textMuted, align: "center", margin: 0,
  });
});

// ========== SLIDE 6: VENDEDOR COTIZACIONES ==========
const s6 = pres.addSlide();
s6.background = { color: C.offWhite };

s6.addText("Vista Vendedor: Cotizaciones SAP", {
  x: 0.6, y: 0.25, w: 6, h: 0.55,
  fontSize: 26, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s6.addText("Documentos reales desde SAP Business One  |  Mario Marin", {
  x: 0.6, y: 0.75, w: 7, h: 0.3,
  fontSize: 11, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

s6.addImage({
  path: basePath + "pptx-03-vendedor-cotizaciones.png",
  x: 0.4, y: 1.2, w: 9.2, h: 4.3,
  shadow: makeShadow(),
});

// Highlight box
s6.addShape(pres.shapes.RECTANGLE, {
  x: 6.8, y: 1.25, w: 2.7, h: 1.0,
  fill: { color: C.primaryBg, transparency: 20 },
  shadow: makeShadow(),
});
s6.addText([
  { text: "Clientes Reales SAP", options: { fontSize: 9, bold: true, color: C.primary, breakLine: true } },
  { text: "MEGA SUPER $5.6M", options: { fontSize: 8, color: C.text, breakLine: true } },
  { text: "MARJAVA $5.4M", options: { fontSize: 8, color: C.text, breakLine: true } },
  { text: "AUTO DELI $1.7M", options: { fontSize: 8, color: C.text } },
], { x: 6.9, y: 1.3, w: 2.5, h: 0.9, fontFace: FONT_B, margin: 0 });

// ========== SLIDE 7: BUSQUEDA GLOBAL ==========
const s7 = pres.addSlide();
s7.background = { color: C.offWhite };

s7.addText("Busqueda Global: Cmd+K", {
  x: 0.6, y: 0.25, w: 6, h: 0.55,
  fontSize: 26, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s7.addText("Busqueda unificada en todas las entidades SAP", {
  x: 0.6, y: 0.75, w: 7, h: 0.3,
  fontSize: 11, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

s7.addImage({
  path: basePath + "pptx-04-vendedor-busqueda.png",
  x: 0.4, y: 1.2, w: 9.2, h: 4.3,
  shadow: makeShadow(),
});

// Feature callouts on right
s7.addShape(pres.shapes.RECTANGLE, {
  x: 7.0, y: 1.25, w: 2.7, h: 1.8,
  fill: { color: C.white, transparency: 10 },
  shadow: makeShadow(),
});
s7.addText([
  { text: "Funcionalidades", options: { fontSize: 10, bold: true, color: C.primary, breakLine: true } },
  { text: " ", options: { fontSize: 4, breakLine: true } },
  { text: "Cuentas SAP", options: { fontSize: 9, bold: true, color: C.text, breakLine: true } },
  { text: "Cotizaciones", options: { fontSize: 9, bold: true, color: C.text, breakLine: true } },
  { text: "Pedidos", options: { fontSize: 9, bold: true, color: C.text, breakLine: true } },
  { text: "Contactos", options: { fontSize: 9, bold: true, color: C.text, breakLine: true } },
  { text: " ", options: { fontSize: 4, breakLine: true } },
  { text: "Resultados agrupados", options: { fontSize: 8, color: C.textMuted, breakLine: true } },
  { text: "Navegacion por teclado", options: { fontSize: 8, color: C.textMuted } },
], { x: 7.1, y: 1.3, w: 2.5, h: 1.7, fontFace: FONT_B, margin: 0 });

// ========== SLIDE 8: GERENTE REPORTES ==========
const s8 = pres.addSlide();
s8.background = { color: C.offWhite };

s8.addText("Vista Gerente: Reportes", {
  x: 0.6, y: 0.25, w: 6, h: 0.55,
  fontSize: 26, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s8.addText("Mariana Solis  |  Metricas del equipo de Costa Rica", {
  x: 0.6, y: 0.75, w: 7, h: 0.3,
  fontSize: 11, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

s8.addImage({
  path: basePath + "pptx-05-gerente-reportes.png",
  x: 0.4, y: 1.2, w: 9.2, h: 4.3,
  shadow: makeShadow(),
});

// KPI highlights
const kpis8 = [
  { value: "$6.2M", label: "Ingresos equipo", color: C.primary },
  { value: "55%", label: "Conversion", color: C.accent },
  { value: "$478K", label: "Ticket promedio", color: C.amber },
];
kpis8.forEach((k, i) => {
  const kx = 0.6 + i * 1.5;
  s8.addShape(pres.shapes.RECTANGLE, {
    x: kx, y: 0.2, w: 1.3, h: 0.7,
    fill: { color: C.white }, shadow: makeShadow(),
  });
  s8.addText(k.value, {
    x: kx, y: 0.22, w: 1.3, h: 0.35,
    fontSize: 14, fontFace: FONT_H, color: k.color, bold: true, align: "center", margin: 0,
  });
  s8.addText(k.label, {
    x: kx, y: 0.55, w: 1.3, h: 0.3,
    fontSize: 7, fontFace: FONT_B, color: C.textMuted, align: "center", margin: 0,
  });
});

// ========== SLIDE 9: CUENTAS SAP ==========
const s9 = pres.addSlide();
s9.background = { color: C.offWhite };

s9.addText("Cuentas SAP en Tiempo Real", {
  x: 0.6, y: 0.25, w: 6, h: 0.55,
  fontSize: 26, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s9.addText("Business Partners sincronizados directamente desde SAP B1 Service Layer", {
  x: 0.6, y: 0.75, w: 8, h: 0.3,
  fontSize: 11, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

s9.addImage({
  path: basePath + "verify-18-prod-cuentas.png",
  x: 0.4, y: 1.2, w: 9.2, h: 4.3,
  shadow: makeShadow(),
});

// ========== SLIDE 10: FACTURAS ==========
const s10 = pres.addSlide();
s10.background = { color: C.offWhite };

s10.addText("Facturacion y Estado de Cobro", {
  x: 0.6, y: 0.25, w: 6, h: 0.55,
  fontSize: 26, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s10.addText("Facturas SAP con estado de pago, vencimientos y KPIs de cobranza", {
  x: 0.6, y: 0.75, w: 8, h: 0.3,
  fontSize: 11, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

s10.addImage({
  path: basePath + "verify-19-prod-facturas.png",
  x: 0.4, y: 1.2, w: 9.2, h: 4.3,
  shadow: makeShadow(),
});

// KPI highlights facturas
const kpis10 = [
  { value: "$739K", label: "Cobrado", color: C.accent },
  { value: "$2.0M", label: "Pendiente", color: C.amber },
  { value: "$678K", label: "Vencido", color: C.red },
];
kpis10.forEach((k, i) => {
  const kx = 6.5 + i * 1.2;
  s10.addShape(pres.shapes.RECTANGLE, {
    x: kx, y: 0.15, w: 1.1, h: 0.75,
    fill: { color: C.white }, shadow: makeShadow(),
  });
  s10.addText(k.value, {
    x: kx, y: 0.18, w: 1.1, h: 0.38,
    fontSize: 14, fontFace: FONT_H, color: k.color, bold: true, align: "center", margin: 0,
  });
  s10.addText(k.label, {
    x: kx, y: 0.55, w: 1.1, h: 0.3,
    fontSize: 7, fontFace: FONT_B, color: C.textMuted, align: "center", margin: 0,
  });
});

// ========== SLIDE 11: ROLES Y PERMISOS ==========
const s11 = pres.addSlide();
s11.background = { color: C.offWhite };

s11.addText("Sistema de Roles y Permisos", {
  x: 0.8, y: 0.3, w: 8, h: 0.6,
  fontSize: 30, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s11.addText("Cada rol ve exactamente los datos que necesita", {
  x: 0.8, y: 0.85, w: 8, h: 0.35,
  fontSize: 12, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

const roleCards = [
  {
    title: "Vendedor",
    user: "Mario Marin",
    color: C.amber,
    modules: ["Dashboard (OWN)", "Cuentas propias", "Cotizaciones", "Pedidos", "Actividades"],
    scope: "Solo ve sus propios datos",
  },
  {
    title: "Gerente",
    user: "Mariana Solis",
    color: C.accent,
    modules: ["Todo de Vendedor +", "Reportes de equipo", "Pipeline completo", "Forecast", "Configuracion"],
    scope: "Ve datos de su pais",
  },
  {
    title: "Admin",
    user: "Freddy Molina",
    color: C.primary,
    modules: ["Todo de Gerente +", "Multi-compania", "Gestion de usuarios", "Todas las companias", "Trazabilidad"],
    scope: "Ve todos los datos",
  },
];

roleCards.forEach((rc, i) => {
  const rx = 0.5 + i * 3.15;

  s11.addShape(pres.shapes.RECTANGLE, {
    x: rx, y: 1.4, w: 2.9, h: 3.8,
    fill: { color: C.white }, shadow: makeShadow(),
  });

  // Top bar color
  s11.addShape(pres.shapes.RECTANGLE, {
    x: rx, y: 1.4, w: 2.9, h: 0.08,
    fill: { color: rc.color },
  });

  s11.addText(rc.title, {
    x: rx + 0.3, y: 1.65, w: 2.3, h: 0.4,
    fontSize: 20, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
  });

  s11.addText(rc.user, {
    x: rx + 0.3, y: 2.05, w: 2.3, h: 0.3,
    fontSize: 10, fontFace: FONT_B, color: rc.color, margin: 0,
  });

  s11.addText(rc.scope, {
    x: rx + 0.3, y: 2.4, w: 2.3, h: 0.3,
    fontSize: 9, fontFace: FONT_B, color: C.textMuted, italic: true, margin: 0,
  });

  s11.addShape(pres.shapes.LINE, {
    x: rx + 0.3, y: 2.75, w: 2.3, h: 0,
    line: { color: "E2E8F0", width: 1 },
  });

  const bulletText = rc.modules.map((m, mi) => ({
    text: m,
    options: { bullet: true, breakLine: mi < rc.modules.length - 1, fontSize: 10, color: C.text },
  }));
  s11.addText(bulletText, {
    x: rx + 0.3, y: 2.85, w: 2.4, h: 2.2,
    fontFace: FONT_B, paraSpaceAfter: 4, margin: 0,
  });
});

// ========== SLIDE 12: ARQUITECTURA ==========
const s12 = pres.addSlide();
s12.background = { color: C.dark };

s12.addText("Arquitectura Tecnica", {
  x: 0.8, y: 0.3, w: 8, h: 0.6,
  fontSize: 30, fontFace: FONT_H, color: C.white, bold: true, margin: 0,
});

// Frontend box
s12.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.2, w: 2.8, h: 3.6,
  fill: { color: "1E293B" }, shadow: makeShadow(),
});
s12.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.2, w: 2.8, h: 0.06,
  fill: { color: C.primaryLight },
});
s12.addText("FRONTEND", {
  x: 0.7, y: 1.4, w: 2.4, h: 0.35,
  fontSize: 12, fontFace: FONT_H, color: C.primaryLight, bold: true, margin: 0,
});
s12.addText([
  { text: "React 18 + TypeScript", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "Tailwind CSS", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "Framer Motion", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "Recharts", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "Zustand (state)", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "React Router v6", options: { fontSize: 10, color: C.white } },
], { x: 0.7, y: 1.9, w: 2.4, h: 2.5, fontFace: FONT_B, paraSpaceAfter: 6, margin: 0 });

// Backend box
s12.addShape(pres.shapes.RECTANGLE, {
  x: 3.6, y: 1.2, w: 2.8, h: 3.6,
  fill: { color: "1E293B" }, shadow: makeShadow(),
});
s12.addShape(pres.shapes.RECTANGLE, {
  x: 3.6, y: 1.2, w: 2.8, h: 0.06,
  fill: { color: C.accent },
});
s12.addText("BACKEND", {
  x: 3.8, y: 1.4, w: 2.4, h: 0.35,
  fontSize: 12, fontFace: FONT_H, color: C.accent, bold: true, margin: 0,
});
s12.addText([
  { text: "Node.js + Express", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "TypeScript", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "Prisma ORM", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "PostgreSQL", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "JWT Auth", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "SAP Service Layer", options: { fontSize: 10, color: C.white } },
], { x: 3.8, y: 1.9, w: 2.4, h: 2.5, fontFace: FONT_B, paraSpaceAfter: 6, margin: 0 });

// Infrastructure box
s12.addShape(pres.shapes.RECTANGLE, {
  x: 6.7, y: 1.2, w: 2.8, h: 3.6,
  fill: { color: "1E293B" }, shadow: makeShadow(),
});
s12.addShape(pres.shapes.RECTANGLE, {
  x: 6.7, y: 1.2, w: 2.8, h: 0.06,
  fill: { color: C.amber },
});
s12.addText("INFRAESTRUCTURA", {
  x: 6.9, y: 1.4, w: 2.4, h: 0.35,
  fontSize: 12, fontFace: FONT_H, color: C.amber, bold: true, margin: 0,
});
s12.addText([
  { text: "AWS EC2", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "Nginx reverse proxy", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "PM2 process manager", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "SSL/HTTPS", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "xy.bluesystem.io", options: { breakLine: true, fontSize: 10, color: C.white } },
  { text: "Multi-tenant ready", options: { fontSize: 10, color: C.white } },
], { x: 6.9, y: 1.9, w: 2.4, h: 2.5, fontFace: FONT_B, paraSpaceAfter: 6, margin: 0 });

// Bottom bar
s12.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 5.0, w: 9, h: 0.06,
  fill: { color: C.primaryLight, transparency: 40 },
});
s12.addText("Datos en tiempo real via SAP B1 Service Layer (OData v4)", {
  x: 0.5, y: 5.1, w: 9, h: 0.35,
  fontSize: 11, fontFace: FONT_B, color: "94A3B8", align: "center", margin: 0,
});

// ========== SLIDE 13: SAP INTEGRATION ==========
const s13 = pres.addSlide();
s13.background = { color: C.offWhite };

s13.addText("Integracion SAP Business One", {
  x: 0.8, y: 0.3, w: 8, h: 0.6,
  fontSize: 30, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});
s13.addText("Conexion directa a SAP B1 Service Layer  |  12 endpoints activos", {
  x: 0.8, y: 0.85, w: 8, h: 0.35,
  fontSize: 12, fontFace: FONT_B, color: C.textMuted, margin: 0,
});

const sapEndpoints = [
  { entity: "BusinessPartners", crm: "Cuentas", status: "LIVE" },
  { entity: "ContactEmployees", crm: "Contactos", status: "LIVE" },
  { entity: "Quotations", crm: "Cotizaciones", status: "LIVE" },
  { entity: "Orders", crm: "Pedidos", status: "LIVE" },
  { entity: "Invoices", crm: "Facturas", status: "LIVE" },
  { entity: "Items", crm: "Productos", status: "LIVE" },
  { entity: "SalesPersons", crm: "Vendedores", status: "LIVE" },
  { entity: "Activities", crm: "Actividades", status: "LIVE" },
  { entity: "EmployeesInfo", crm: "Empleados", status: "LIVE" },
  { entity: "Batches", crm: "Lotes/Trazabilidad", status: "LIVE" },
  { entity: "Dashboard", crm: "KPIs y Charts", status: "LIVE" },
  { entity: "Search", crm: "Busqueda Global", status: "LIVE" },
];

// Table header
s13.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.35, w: 8.4, h: 0.45,
  fill: { color: C.primary },
});
s13.addText("SAP Entity", {
  x: 0.9, y: 1.38, w: 3, h: 0.4,
  fontSize: 10, fontFace: FONT_H, color: C.white, bold: true, margin: 0,
});
s13.addText("Modulo CRM", {
  x: 3.9, y: 1.38, w: 3, h: 0.4,
  fontSize: 10, fontFace: FONT_H, color: C.white, bold: true, margin: 0,
});
s13.addText("Estado", {
  x: 7.5, y: 1.38, w: 1.5, h: 0.4,
  fontSize: 10, fontFace: FONT_H, color: C.white, bold: true, align: "center", margin: 0,
});

sapEndpoints.forEach((ep, i) => {
  const ey = 1.82 + i * 0.3;
  const bgColor = i % 2 === 0 ? C.white : C.offWhite;

  s13.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: ey, w: 8.4, h: 0.3,
    fill: { color: bgColor },
  });
  s13.addText(ep.entity, {
    x: 0.9, y: ey, w: 3, h: 0.3,
    fontSize: 9, fontFace: "Consolas", color: C.primary, margin: 0,
  });
  s13.addText(ep.crm, {
    x: 3.9, y: ey, w: 3, h: 0.3,
    fontSize: 9, fontFace: FONT_B, color: C.text, margin: 0,
  });
  s13.addText(ep.status, {
    x: 7.8, y: ey + 0.03, w: 0.8, h: 0.24,
    fontSize: 7, fontFace: FONT_H, color: C.accent, bold: true, align: "center", valign: "middle",
    shape: pres.shapes.ROUNDED_RECTANGLE, fill: { color: C.accentBg }, rectRadius: 0.03,
  });
});

// ========== SLIDE 14: DATOS REALES ==========
const s14 = pres.addSlide();
s14.background = { color: C.dark };

s14.addText("Datos Reales en Produccion", {
  x: 0.8, y: 0.3, w: 8, h: 0.6,
  fontSize: 30, fontFace: FONT_H, color: C.white, bold: true, margin: 0,
});
s14.addText("Ejemplo: Mario Marin, Vendedor - Datos en vivo desde SAP B1", {
  x: 0.8, y: 0.85, w: 8, h: 0.35,
  fontSize: 12, fontFace: FONT_B, color: "94A3B8", margin: 0,
});

const realData = [
  { client: "CORPORACION MEGA SUPER", amount: "$5,651,432", type: "Cotizacion" },
  { client: "MARJAVA SUPERMERCADOS", amount: "$5,484,762", type: "Cotizacion" },
  { client: "AUTO DELI", amount: "$1,798,129", type: "Cotizacion" },
  { client: "INDUSTRIAS SALQUI", amount: "$1,135,647", type: "Cotizacion" },
  { client: "INDUSTRIAS CARNICAS MONTERREY", amount: "$365,592", type: "Cotizacion" },
  { client: "EL LUGAR DE LA CARNE", amount: "$138,891", type: "Cotizacion" },
];

// Table header
s14.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.35, w: 8.4, h: 0.45,
  fill: { color: "1E293B" },
});
s14.addText("Cliente SAP", {
  x: 0.9, y: 1.38, w: 4, h: 0.4,
  fontSize: 10, fontFace: FONT_H, color: C.primaryLight, bold: true, margin: 0,
});
s14.addText("Monto", {
  x: 5.5, y: 1.38, w: 2, h: 0.4,
  fontSize: 10, fontFace: FONT_H, color: C.primaryLight, bold: true, align: "right", margin: 0,
});
s14.addText("Tipo", {
  x: 7.8, y: 1.38, w: 1.4, h: 0.4,
  fontSize: 10, fontFace: FONT_H, color: C.primaryLight, bold: true, margin: 0,
});

realData.forEach((rd, i) => {
  const ry = 1.85 + i * 0.42;
  s14.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: ry, w: 8.4, h: 0.4,
    fill: { color: i % 2 === 0 ? "1E293B" : "0F172A" },
  });
  s14.addText(rd.client, {
    x: 0.9, y: ry, w: 4.4, h: 0.4,
    fontSize: 11, fontFace: FONT_B, color: C.white, margin: 0,
  });
  s14.addText(rd.amount, {
    x: 5.5, y: ry, w: 2, h: 0.4,
    fontSize: 12, fontFace: FONT_H, color: C.accent, bold: true, align: "right", margin: 0,
  });
  s14.addText(rd.type, {
    x: 7.8, y: ry, w: 1.4, h: 0.4,
    fontSize: 9, fontFace: FONT_B, color: "94A3B8", margin: 0,
  });
});

// Total
s14.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 4.4, w: 8.4, h: 0.5,
  fill: { color: C.primary },
});
s14.addText("Total Pipeline Mario Marin", {
  x: 0.9, y: 4.42, w: 4, h: 0.45,
  fontSize: 12, fontFace: FONT_H, color: C.white, bold: true, margin: 0,
});
s14.addText("$14,574,453", {
  x: 5.5, y: 4.42, w: 2, h: 0.45,
  fontSize: 14, fontFace: FONT_H, color: C.white, bold: true, align: "right", margin: 0,
});

// Top vendedores equipo
s14.addText("Top Vendedores del Equipo (Vista Gerente)", {
  x: 0.8, y: 5.05, w: 4, h: 0.3,
  fontSize: 9, fontFace: FONT_H, color: "94A3B8", margin: 0,
});
const topSellers = [
  { name: "Ivan Arceyut", revenue: "$4,267,007" },
  { name: "Mario Marin", revenue: "$1,558,738" },
  { name: "Randall Zuniga", revenue: "$262,468" },
];
topSellers.forEach((ts, i) => {
  const tx = 5.2 + i * 1.65;
  s14.addText(ts.name, {
    x: tx, y: 5.0, w: 1.5, h: 0.2,
    fontSize: 8, fontFace: FONT_B, color: C.white, margin: 0,
  });
  s14.addText(ts.revenue, {
    x: tx, y: 5.2, w: 1.5, h: 0.2,
    fontSize: 8, fontFace: FONT_H, color: C.accent, margin: 0,
  });
});

// ========== SLIDE 15: ROADMAP ==========
const s15 = pres.addSlide();
s15.background = { color: C.offWhite };

s15.addText("Proximos Pasos", {
  x: 0.8, y: 0.3, w: 8, h: 0.6,
  fontSize: 30, fontFace: FONT_H, color: C.text, bold: true, margin: 0,
});

const phases = [
  {
    phase: "Fase 1",
    title: "Actual - En Produccion",
    color: C.accent,
    items: ["26+ pantallas LIVE", "Integracion SAP completa", "3 roles con permisos", "Busqueda global y forecasting"],
  },
  {
    phase: "Fase 2",
    title: "Q2 2026",
    color: C.primary,
    items: ["App movil (React Native)", "Notificaciones push", "Calendario integrado", "Aprobaciones de cotizaciones"],
  },
  {
    phase: "Fase 3",
    title: "Q3 2026",
    color: C.amber,
    items: ["Multi-compania simultanea", "Workflows automatizados", "AI: prediccion de cierre", "Integracion WhatsApp Business"],
  },
];

phases.forEach((ph, i) => {
  const py = 1.2 + i * 1.4;

  s15.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: py, w: 8.4, h: 1.2,
    fill: { color: C.white }, shadow: makeShadow(),
  });

  s15.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: py, w: 0.06, h: 1.2,
    fill: { color: ph.color },
  });

  s15.addText(ph.phase, {
    x: 1.1, y: py + 0.1, w: 1.2, h: 0.3,
    fontSize: 11, fontFace: FONT_H, color: ph.color, bold: true, margin: 0,
  });

  s15.addText(ph.title, {
    x: 2.3, y: py + 0.1, w: 3, h: 0.3,
    fontSize: 11, fontFace: FONT_B, color: C.text, bold: true, margin: 0,
  });

  if (i === 0) {
    s15.addText("LIVE", {
      x: 5.5, y: py + 0.12, w: 0.6, h: 0.25,
      fontSize: 8, fontFace: FONT_H, color: C.accent, bold: true, align: "center",
      shape: pres.shapes.ROUNDED_RECTANGLE, fill: { color: C.accentBg }, rectRadius: 0.03,
    });
  }

  const phBullets = ph.items.map((item, ii) => ({
    text: item,
    options: { bullet: true, breakLine: ii < ph.items.length - 1, fontSize: 10, color: C.textMuted },
  }));
  s15.addText(phBullets, {
    x: 1.1, y: py + 0.45, w: 7.8, h: 0.7,
    fontFace: FONT_B, paraSpaceAfter: 2, margin: 0,
  });
});

// ========== SLIDE 16: CLOSING ==========
const s16 = pres.addSlide();
s16.background = { color: C.dark };

s16.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 2.3, w: 10, h: 0.06,
  fill: { color: C.primaryLight, transparency: 50 },
});

s16.addText("STIA CRM", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.0,
  fontSize: 48, fontFace: FONT_H, color: C.white, bold: true, align: "center", margin: 0,
});

s16.addText("Listo para transformar su operacion comercial", {
  x: 0.8, y: 2.5, w: 8.4, h: 0.5,
  fontSize: 18, fontFace: FONT_B, color: C.primaryLight, align: "center", margin: 0,
});

s16.addText("xy.bluesystem.io", {
  x: 0.8, y: 3.3, w: 8.4, h: 0.4,
  fontSize: 14, fontFace: FONT_B, color: "94A3B8", align: "center", margin: 0,
});

s16.addShape(pres.shapes.RECTANGLE, {
  x: 3.5, y: 4.2, w: 3, h: 0.06,
  fill: { color: C.primaryLight, transparency: 60 },
});

s16.addText([
  { text: "Grecia Rosales  |  STIA", options: { fontSize: 11, color: "94A3B8", breakLine: true } },
  { text: "Freddy Molina  |  BlueSystem", options: { fontSize: 11, color: "94A3B8" } },
], { x: 0.8, y: 4.5, w: 8.4, h: 0.8, fontFace: FONT_B, align: "center", margin: 0 });

// ========== SAVE ==========
const outPath = basePath + "STIA-CRM-Presentacion-v2.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("PPTX generado exitosamente:", outPath);
  console.log("Total slides:", 16);
}).catch(err => {
  console.error("Error:", err);
});
