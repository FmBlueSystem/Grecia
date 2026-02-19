from fpdf import FPDF
import os

DIR = "/Users/freddymolina/Desktop/Stia/Grecia"
SHOTS = os.path.join(DIR, "screenshots")
OUT = os.path.join(DIR, "STIA-CRM-Presentacion.pdf")

# 16:9 landscape: 254mm x 142.9mm
W, H = 254, 142.9

def sanitize(text):
    return text.replace("\u2022", "-").replace("\u2192", "->").replace("\u20a1", "CRC ").replace("\u2014", "--").replace("\u2013", "-").replace("\u2018", "'").replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"').replace("\u2026", "...").replace("\u2716", "X").replace("\u2714", "OK").replace("\u26a0", "!").replace("\u2715", "x").replace("\u2717", "x").replace("\u2713", "OK")

class StiaPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="L", unit="mm", format=(H, W))
        self.set_auto_page_break(auto=False)

    def slide_bg(self, color):
        self.set_fill_color(*color)
        self.rect(0, 0, W, H, "F")

    def bar(self, x, y, w, h, color):
        self.set_fill_color(*color)
        self.rect(x, y, w, h, "F")

    def txt(self, x, y, w, text, size=10, color=(15, 23, 42), bold=False, align="L"):
        self.set_xy(x, y)
        self.set_text_color(*color)
        if bold:
            self.set_font("Helvetica", "B", size)
        else:
            self.set_font("Helvetica", "", size)
        self.multi_cell(w, size * 0.45, sanitize(text), align=align)

pdf = StiaPDF()
NAV = (10, 15, 26)
PRI = (0, 103, 178)
WHT = (255, 255, 255)
PAGE = (248, 250, 252)
TXT1 = (15, 23, 42)
TXT2 = (100, 116, 139)
TXTM = (148, 163, 184)
BDR = (226, 232, 240)

# ===== SLIDE 1: COVER =====
pdf.add_page()
pdf.slide_bg(NAV)
pdf.bar(0, 0, 1.5, H, PRI)
# Blue circles (decorative)
pdf.set_fill_color(0, 103, 178)
pdf.set_draw_color(0, 103, 178)
# Logo box
pdf.bar(12, 25, 10, 10, PRI)
pdf.txt(13, 26.5, 8, "S", 16, WHT, True, "C")
pdf.txt(25, 26, 30, "STIA CRM", 16, WHT, True)
pdf.txt(12, 42, 120, "Customer Relationship\nManagement", 32, WHT, True)
pdf.txt(12, 72, 120, "Diseño de Interfaz y Arquitectura Backend", 13, TXTM)
pdf.bar(12, 88, 50, 0.8, PRI)
pdf.txt(12, 93, 100, "Febrero 2026  |  Preparado por BlueSystem.io", 9, TXTM)
pdf.txt(12, 100, 120, "Para: Grecia Rosales  |  STIA - Soluciones al Procesar Alimentos", 9, TXT2)

# ===== SLIDE 2: RESUMEN EJECUTIVO =====
pdf.add_page()
pdf.slide_bg(PAGE)
pdf.txt(10, 6, 100, "Resumen Ejecutivo", 22, TXT1, True)
pdf.bar(10, 18, 25, 0.8, PRI)

stats = [
    ("18", "Pantallas\nDiseñadas", PRI),
    ("5", "Países\nMulti-tenant", (14, 165, 233)),
    ("12", "Endpoints\nAPI REST", (99, 102, 241)),
    ("100%", "Datos Reales\nSAP B1", (139, 92, 246)),
]
for i, (num, label, color) in enumerate(stats):
    x = 10 + i * 57
    pdf.set_fill_color(255, 255, 255)
    pdf.rect(x, 24, 52, 28, "F")
    pdf.bar(x, 24, 52, 1.2, color)
    pdf.txt(x, 27, 52, num, 24, color, True, "C")
    pdf.txt(x, 38, 52, label, 8, TXT2, False, "C")

pdf.txt(10, 58, 234, "Plataforma CRM diseñada para el área de Mercadeo y Ventas de STIA, integrando datos reales de SAP Business One Service Layer con una interfaz moderna inspirada en Microsoft Dynamics 365 Sales.", 10, TXT2)

pdf.txt(10, 72, 60, "Módulos Incluidos:", 10, TXT1, True)
modules = [
    ["Paneles de Ventas (Light/Dark)", "Customer 360 con BPF", "Contactos y Prospectos",
     "Pipeline Kanban", "Cotizaciones con detalle"],
    ["Pedidos con logística", "Facturas integradas SAP", "Actividades y calendario",
     "Catálogo de Productos", "Casos de soporte"],
    ["Ofertas Perdidas", "Trazabilidad de lotes", "Dashboard Logística",
     "Reportes y Análisis", "Login multi-empresa"]
]
for ci, col in enumerate(modules):
    for mi, m in enumerate(col):
        pdf.txt(10 + ci * 80, 80 + mi * 6, 75, "•  " + m, 8, TXT2)

# ===== SLIDE 3: GALLERY DIVIDER =====
pdf.add_page()
pdf.slide_bg(NAV)
pdf.bar(0, 0, 1.5, H, PRI)
pdf.txt(12, 30, 150, "Galería de Pantallas", 32, WHT, True)
pdf.txt(12, 55, 150, "18 pantallas diseñadas con datos reales de SAP Business One", 13, TXTM)
pdf.bar(12, 72, 50, 0.8, PRI)

# ===== SCREENSHOT SLIDES (2 per slide) =====
screenshot_pairs = [
    ("Acceso y Panel Principal",
     ("01-Login", "Login", "Selector de empresa (5 países) - Auth JWT multi-tenant"),
     ("02-Dashboard-Light", "Dashboard de Ventas (Light)", "KPIs: ₡478.7M ingresos, 342 clientes, gráficos por país")),
    ("Dashboard Dark y Vista del Cliente",
     ("03-Dashboard-Dark", "Dashboard de Ventas (Dark)", "Mismos KPIs en modo oscuro"),
     ("04-Customer-360", "Customer 360", "Vista completa del cliente con tabs y BPF de venta")),
    ("Gestión de Contactos y Prospectos",
     ("05-Contactos", "Contactos", "342 contactos, 218 activos, filtros por país y estado"),
     ("06-Prospectos", "Prospectos (Leads)", "47 prospectos, conversión 23.4%, pipeline Q2.1M")),
    ("Embudo de Ventas y Cotizaciones",
     ("07-Pipeline", "Pipeline / Embudo", "Kanban: Prospección → Cerrado/Ganado, barra conversión"),
     ("08-Cotizaciones", "Cotizaciones", "24 activas, valor Q4.8M, tasa cierre 34.2%")),
    ("Pedidos y Facturación",
     ("09-Pedidos", "Pedidos", "18 pedidos, ₡3.2M, seguimiento logístico 4 etapas"),
     ("10-Facturas", "Facturas", "Q1.8M pendiente, Q2.4M total, estados de pago")),
    ("Actividades y Catálogo de Productos",
     ("11-Actividades", "Actividades", "Llamadas, emails, reuniones, tareas, vista 7 días"),
     ("12-Productos", "Productos", "Catálogo con imágenes reales, SKU SAP")),
    ("Soporte y Análisis de Pérdidas",
     ("13-Casos", "Casos de Soporte", "7 abiertos, 3 en proceso, tiempo respuesta 2.4 días"),
     ("14-Ofertas-Perdidas", "Ofertas Perdidas", "44 ofertas, $1.86M, motivo: Precio 44%")),
    ("Trazabilidad y Logística",
     ("15-Trazabilidad", "Trazabilidad", "Árbol de documentos, registro de auditoría"),
     ("17-Dashboard-Logistica", "Dashboard Logística", "Envíos en tránsito, estados, timeline entregas")),
]

for title, left, right in screenshot_pairs:
    pdf.add_page()
    pdf.slide_bg(PAGE)
    # Title bar
    pdf.bar(0, 0, W, 13, NAV)
    pdf.txt(8, 2.5, 230, title, 14, WHT, True)

    # Left image
    img_path_l = os.path.join(SHOTS, left[0] + ".png")
    pdf.bar(3, 15, 121, 0.8, PRI)
    if os.path.exists(img_path_l):
        pdf.image(img_path_l, 3, 15.8, 121, 80.7)
    pdf.set_draw_color(*BDR)
    pdf.rect(3, 15.8, 121, 80.7)
    pdf.txt(3, 98, 121, left[1], 10, TXT1, True, "C")
    pdf.txt(3, 105, 121, left[2], 7.5, TXT2, False, "C")

    # Right image
    img_path_r = os.path.join(SHOTS, right[0] + ".png")
    pdf.bar(130, 15, 121, 0.8, PRI)
    if os.path.exists(img_path_r):
        pdf.image(img_path_r, 130, 15.8, 121, 80.7)
    pdf.rect(130, 15.8, 121, 80.7)
    pdf.txt(130, 98, 121, right[1], 10, TXT1, True, "C")
    pdf.txt(130, 105, 121, right[2], 7.5, TXT2, False, "C")

# ===== SINGLE: Detalle Cotización =====
pdf.add_page()
pdf.slide_bg(PAGE)
pdf.bar(0, 0, W, 13, NAV)
pdf.txt(8, 2.5, 230, "Detalle de Cotización COT-29171", 14, WHT, True)
pdf.bar(10, 16, 234, 0.8, (99, 102, 241))
img = os.path.join(SHOTS, "16-Detalle-Cotizacion.png")
if os.path.exists(img):
    pdf.image(img, 10, 16.8, 234, 104)
pdf.set_draw_color(*BDR)
pdf.rect(10, 16.8, 234, 104)
pdf.txt(10, 123, 234, "BPF de cotización, líneas de producto con precios, totales con impuestos, actividad reciente y notas", 8, TXT2, False, "C")

# ===== SINGLE: Reportes =====
pdf.add_page()
pdf.slide_bg(PAGE)
pdf.bar(0, 0, W, 13, NAV)
pdf.txt(8, 2.5, 230, "Reportes y Análisis", 14, WHT, True)
pdf.bar(10, 16, 234, 0.8, (79, 70, 229))
img = os.path.join(SHOTS, "18-Reportes.png")
if os.path.exists(img):
    pdf.image(img, 10, 16.8, 234, 104)
pdf.set_draw_color(*BDR)
pdf.rect(10, 16.8, 234, 104)
pdf.txt(10, 123, 234, "₡5.87B ingresos totales, conversión 34.2%, ventas por país, Top 5 vendedores. Exportar a PDF.", 8, TXT2, False, "C")

# ===== SLIDE: ARCHITECTURE DIVIDER =====
pdf.add_page()
pdf.slide_bg(NAV)
pdf.bar(0, 0, 1.5, H, PRI)
pdf.txt(12, 30, 150, "Arquitectura y\nEstado Técnico", 32, WHT, True)
pdf.txt(12, 60, 150, "Backend, SAP Service Layer e infraestructura", 13, TXTM)
pdf.bar(12, 76, 50, 0.8, PRI)

# ===== SLIDE: MULTI-PAÍS =====
pdf.add_page()
pdf.slide_bg(PAGE)
pdf.txt(10, 6, 120, "Arquitectura Multi-País", 22, TXT1, True)
pdf.bar(10, 18, 25, 0.8, PRI)
pdf.txt(10, 22, 234, "Cada país conecta a su propia base de datos SAP Business One, con moneda local y datos independientes.", 10, TXT2)

countries = [
    ("CR", "Costa Rica", "SBO_STIACR_PROD", "CRC (₡)", PRI),
    ("GT", "Guatemala", "SBO_GT_STIA_PROD", "GTQ (Q)", (14, 165, 233)),
    ("SV", "El Salvador", "SBO_SV_STIA_FINAL", "USD ($)", (99, 102, 241)),
    ("HN", "Honduras", "SBO_HO_STIA_PROD", "HNL (L)", (139, 92, 246)),
    ("PA", "Panamá", "SBO_PA_STIA_PROD", "USD ($)", (5, 150, 105)),
]
for i, (code, name, db, cur, color) in enumerate(countries):
    x = 8 + i * 48
    pdf.set_fill_color(255, 255, 255)
    pdf.rect(x, 34, 44, 48, "F")
    pdf.bar(x, 34, 44, 12, color)
    pdf.txt(x, 36, 44, code, 18, WHT, True, "C")
    pdf.txt(x, 50, 44, name, 10, TXT1, True, "C")
    pdf.txt(x, 58, 44, cur, 8, TXT2, False, "C")
    pdf.txt(x, 66, 44, db, 6, TXTM, False, "C")

pdf.set_fill_color(255, 255, 255)
pdf.rect(8, 90, 238, 18, "F")
pdf.txt(12, 92, 80, "Conexión SAP Service Layer", 11, TXT1, True)
pdf.txt(12, 100, 230, "Endpoint: sap-stiacmzdr-sl.skyinone.net:50000/b1s/v1  |  Sesiones automáticas con retry  |  Header: x-company-id", 8, TXT2)

# ===== SLIDE: BACKEND STATUS =====
pdf.add_page()
pdf.slide_bg(PAGE)
pdf.txt(10, 6, 120, "Estado del Backend", 22, TXT1, True)
pdf.bar(10, 18, 25, 0.8, PRI)

# Table header
y = 22
pdf.bar(6, y, 242, 7, NAV)
cols = [("Módulo", 35), ("Endpoints API", 62), ("Base de Datos", 55), ("SAP Service Layer", 90)]
cx = 8
for label, w in cols:
    pdf.txt(cx, y + 1.5, w, label, 8, WHT, True)
    cx += w

rows = [
    ("Auth (Login)", "POST /login, /me, /logout", "Users + JWT", "No requerido", TXTM),
    ("Cuentas", "CRUD completo", "Account + sapId", "Ref sin sync", (217, 119, 6)),
    ("Contactos", "CRUD + soft delete", "Contact model", "Sin sync", (217, 119, 6)),
    ("Prospectos", "CRUD + /qualify", "Lead conversión", "Sin sync", (217, 119, 6)),
    ("Oportunidades", "CRUD + auto-Order", "Pipeline stages", "Sin sync", (217, 119, 6)),
    ("Cotizaciones", "CRUD con items", "Quote + Items", "Falta Quotations", (220, 38, 38)),
    ("Pedidos", "CRUD + /logistics", "Order + Items", "Comentado MVP", (217, 119, 6)),
    ("Facturas", "CRUD básico", "Invoice model", "Falta Invoices", (220, 38, 38)),
    ("Actividades", "CRUD completo", "Activity model", "Falta Activities", (220, 38, 38)),
    ("Productos", "Listar + Crear", "Product model", "Falta Items OITM", (220, 38, 38)),
    ("Casos", "Listar + Crear", "Case model", "No existe en SAP", TXTM),
    ("Dashboard", "GET /stats", "Queries agregadas", "KPIs locales", (217, 119, 6)),
]

for ri, (mod, api, db, sap, sap_color) in enumerate(rows):
    ry = y + 7 + ri * 7
    if ri % 2 == 0:
        pdf.set_fill_color(248, 250, 252)
        pdf.rect(6, ry, 242, 7, "F")
    pdf.txt(8, ry + 1.5, 35, mod, 7, (5, 150, 105), True)
    pdf.txt(8 + 35, ry + 1.5, 62, api, 7, (5, 150, 105))
    pdf.txt(8 + 97, ry + 1.5, 55, db, 7, (5, 150, 105))
    pdf.txt(8 + 152, ry + 1.5, 90, sap, 7, sap_color)

pdf.txt(8, 115, 50, "Completado", 7, (5, 150, 105), True)
pdf.txt(55, 115, 50, "Parcial", 7, (217, 119, 6), True)
pdf.txt(95, 115, 50, "Falta integrar", 7, (220, 38, 38), True)
pdf.txt(145, 115, 50, "No aplica", 7, TXTM)

# ===== SLIDE: SAP PENDIENTE =====
pdf.add_page()
pdf.slide_bg(PAGE)
pdf.txt(10, 6, 180, "SAP Service Layer — Pendiente", 22, TXT1, True)
pdf.bar(10, 18, 25, 0.8, (239, 68, 68))

# Left: Implemented
pdf.set_fill_color(255, 255, 255)
pdf.rect(8, 24, 115, 82, "F")
pdf.bar(8, 24, 115, 1, (16, 185, 129))
pdf.txt(12, 28, 100, "Implementado", 14, (5, 150, 105), True)
impl = [
    "Conexión multi-empresa (5 DBs SAP)", "Gestión sesiones con auto-retry 401",
    "Header x-company-id para tenant", "AxiosInstance con B1SESSION cookie",
    "SSL self-signed certs soportado", "Servicio createOrderFromOpportunity",
    "Account.sapId → BusinessPartner", "Invoice.sapInvoiceId → SAP",
    "Order.sapOrderId → SAP", "Product.code → SAP ItemCode",
]
for i, item in enumerate(impl):
    pdf.txt(14, 38 + i * 6.2, 105, "•  " + item, 7.5, TXT2)

# Right: Missing
pdf.set_fill_color(255, 255, 255)
pdf.rect(131, 24, 115, 82, "F")
pdf.bar(131, 24, 115, 1, (239, 68, 68))
pdf.txt(135, 28, 100, "Pendiente de Integrar", 14, (220, 38, 38), True)
miss = [
    "GET BusinessPartners → Cuentas", "GET Quotations (OCQT) → Cotizaciones",
    "POST Quotations → Crear en SAP", "GET Orders → Sincronizar pedidos",
    "POST Orders → Crear en SAP (activo)", "GET Invoices (OINV) → Facturas",
    "GET Items (OITM) → Productos", "GET Activities (OACT) → Actividades",
    "Sync bidireccional completa", "Filtros por company en queries DB",
]
for i, item in enumerate(miss):
    pdf.txt(137, 38 + i * 6.2, 105, "•  " + item, 7.5, TXT2)

# Warning bar
pdf.set_fill_color(254, 243, 199)
pdf.rect(8, 110, 238, 8, "F")
pdf.txt(12, 112, 230, "Credenciales SAP en código fuente — mover a .env antes de producción", 8, (146, 64, 14))

# ===== SLIDE: STACK =====
pdf.add_page()
pdf.slide_bg(PAGE)
pdf.txt(10, 6, 120, "Stack Tecnológico", 22, TXT1, True)
pdf.bar(10, 18, 25, 0.8, PRI)

stacks = [
    ("Frontend", PRI, ["React 18 + TypeScript", "TailwindCSS", "React Hook Form + Zod", "i18next (ES/EN)", "Zustand store", "React Router v6", "Lucide Icons"]),
    ("Backend", (99, 102, 241), ["Fastify 4 (Node.js)", "Prisma ORM", "PostgreSQL", "JWT Auth", "Zod validation", "Helmet + CORS", "Pino logging"]),
    ("Integración", (5, 150, 105), ["SAP B1 Service Layer", "REST API (OData)", "Multi-tenant sessions", "Auto-retry on 401", "5 bases SAP", "Axios interceptors", "SSL self-signed"]),
    ("Diseño", (217, 119, 6), ["Pencil (.pen editor)", "18 pantallas mockup", "Componentes reusables", "Design tokens", "Datos reales SAP", "Responsive sidebar", "Dark/Light mode"]),
]
for i, (title, color, items) in enumerate(stacks):
    x = 8 + i * 60
    pdf.set_fill_color(255, 255, 255)
    pdf.rect(x, 24, 56, 100, "F")
    pdf.bar(x, 24, 56, 10, color)
    pdf.txt(x, 26, 56, title, 11, WHT, True, "C")
    for j, item in enumerate(items):
        pdf.txt(x + 4, 40 + j * 8.5, 50, "•  " + item, 8, TXT2)

# ===== SLIDE: PRÓXIMOS PASOS =====
pdf.add_page()
pdf.slide_bg(NAV)
pdf.bar(0, 0, 1.5, H, PRI)
pdf.txt(10, 8, 100, "Próximos Pasos", 22, WHT, True)
pdf.bar(10, 20, 25, 0.8, PRI)

phases = [
    ("Fase 1", "Integración SAP Completa", "Conectar lectura/escritura de BusinessPartners, Quotations, Orders, Invoices e Items.", PRI),
    ("Fase 2", "Frontend Funcional", "Implementar las 18 pantallas en React con datos reales. Formularios, filtros, paginación.", (14, 165, 233)),
    ("Fase 3", "Multi-tenant Real", "Filtrar datos por empresa en todas las consultas. Dashboard KPIs por país.", (99, 102, 241)),
    ("Fase 4", "QA y Despliegue", "Testing end-to-end, optimización, servidor producción y capacitación de usuarios.", (5, 150, 105)),
]
for i, (phase, title, desc, color) in enumerate(phases):
    y = 28 + i * 24
    pdf.set_fill_color(20, 34, 56)
    pdf.rect(10, y, 228, 20, "F")
    pdf.bar(10, y, 1.2, 20, color)
    pdf.txt(16, y + 2, 18, phase, 8, color, True)
    pdf.txt(35, y + 2, 200, title, 12, WHT, True)
    pdf.txt(35, y + 10, 200, desc, 8, TXTM)

pdf.bar(10, 125, 60, 0.6, PRI)
pdf.txt(10, 128, 150, "BlueSystem.io  |  Freddy Molina  |  freddy@bluesystem.io", 8, TXTM)

# Save
pdf.output(OUT)
print(f"OK: {OUT} ({os.path.getsize(OUT) // 1024}KB)")
