# CAMPO DE BATALLA: Dueno vs Gerente de Ventas
## El unico ganador es la aplicacion

**Fecha:** 2026-02-15
**Participantes:**
- **Don Roberto** (Dueno de STIA, 15 anos en distribucion B2B Centroamerica)
- **Ing. Martinez** (Gerente de Ventas Senior, 20+ anos con SAP, Dynamics, Salesforce)
**Moderador:** Sistema de auditoria automatizado

---

## ROUND 1: "DONDE ESTA MI DINERO?"

### Don Roberto (Dueno):
> "Pague por un CRM. Quiero saber en 30 segundos: Cuanto vendimos este mes? Cuanto nos deben? Quien esta vendiendo y quien no? Y no me vengan con numeros bonitos que no son reales."

### Ing. Martinez (Gerente):
> "Don Roberto, le muestro el Dashboard. Revenue MTD viene directo de SAP Invoices de los ultimos 6 meses. El pipeline es real -- cotizaciones y ordenes abiertas de SAP. Los top sellers son calculados de facturas reales."

### LA BRECHA ENCONTRADA:

| Pregunta del Dueno | El CRM Responde? | Evidencia en Codigo |
|---------------------|-------------------|---------------------|
| Cuanto vendimos este mes? | SI (parcial) | `sap-proxy.service.ts:456` - Revenue MTD de invoices |
| Cuanto nos deben? | PARCIAL | Alertas muestran overdueInvoices count + monto, pero NO hay aging report (0-30, 30-60, 60-90, 90+ dias) |
| Quien vende mas? | SI | Scorecard en `manager.routes.ts:143-256` con facturado real por vendedor |
| A que margen vendemos? | **NO** | `sap-proxy.service.ts:201` -- Products tienen `price: 0` siempre. No se lee `ItemPrices` de SAP |
| Cuanto damos de descuento? | **NO** | `mapDocLine:391` tiene `DiscountPercent` pero no se expone en UI |
| Cual es el costo de adquisicion? | **NO** | No existe modelo de costos de venta ni marketing |

**VEREDICTO ROUND 1:** El CRM muestra ingresos y vendedores con datos reales, pero el Dueno no puede ver MARGENES ni DESCUENTOS. Esta volando a ciegas en rentabilidad.

---

## ROUND 2: "MIS VENDEDORES ESTAN TRABAJANDO?"

### Don Roberto:
> "Tengo 8 vendedores en 5 paises. Me dicen que 'estan visitando clientes'. Pero yo veo facturas estancadas. Como verifico que estan haciendo su trabajo?"

### Ing. Martinez:
> "Don Roberto, la seccion Gerente de Ventas tiene el Scorecard. Le muestra por vendedor: cotizaciones hechas, pedidos generados, facturado, tasa de conversion (cotizacion->pedido), y tasa de cobro (pagado vs facturado). Si Jose Castillo tiene 50 cotizaciones pero solo 5 pedidos, su conversion es 10% -- ahi hay un problema."

### Don Roberto:
> "Y cuantas visitas hizo Jose esta semana? Cuantas llamadas? Puedo ver si llamo a Chiquita antes de la reunion?"

### Ing. Martinez:
> "...Ahi tenemos un problema. Las actividades se registran en SAP pero no estan vinculadas a cuentas especificas en el CRM. El formulario de nueva actividad no tiene campo para seleccionar cuenta ni contacto."

### LA BRECHA ENCONTRADA:

| Metrica de Productividad | Disponible? | Problema |
|--------------------------|-------------|----------|
| Cotizaciones por vendedor | SI | `manager.routes.ts:190-194` |
| Facturado por vendedor | SI | `manager.routes.ts:200-205` |
| Conversion cotizacion->pedido | SI | `manager.routes.ts:216` |
| Tasa de cobro | SI | `manager.routes.ts:217` |
| Actividades por vendedor | **PARCIAL** | SAP Activities tienen `HandledBy` pero el CRM no las agrupa por vendedor |
| Visitas por cuenta | **NO** | `mapActivity:356` pone `contact: null`, `opportunity: null` |
| Meta vs real por vendedor | **NO** | No hay modelo `SalesTarget`. El "target" del dashboard es promedio historico (`sap-proxy.service.ts:449`) |
| KPIs de actividad (llamadas/dia) | **NO** | Se calculan globalmente, no por vendedor |

**VEREDICTO ROUND 2:** Hay datos financieros excelentes por vendedor. Pero NO hay datos de ACTIVIDAD por vendedor. El gerente puede ver RESULTADOS pero no el ESFUERZO. El Dueno no puede verificar si el vendedor trabaja o solo tiene suerte.

---

## ROUND 3: "ESTAMOS PERDIENDO NEGOCIOS Y NO SE POR QUE"

### Don Roberto:
> "El trimestre pasado perdimos la cuenta de PIPASA. Nadie me puede decir por que. Fue precio? Fue servicio? Fue la competencia? Y ahora quieren que apruebe descuentos para retener otra cuenta. Con que datos me justifican eso?"

### Ing. Martinez:
> "Don Roberto, ahi tenemos un hueco grande. La seccion de 'Negocios Perdidos' existe en el menu pero los datos son ficticios."

### Don Roberto:
> "Repitame eso. Los datos son QUE?"

### Ing. Martinez:
> "Inventados. El archivo `LostDeals.tsx` tiene un array `MOCK_LOST_DEALS` con empresas y razones de perdida hardcodeadas. No viene de SAP. Lo mismo pasa con Reportes, Trazabilidad, y el Detalle de Cuenta."

### PANTALLAS CON DATOS FALSOS (evidencia):

| Pantalla | Archivo | Lineas | Datos Falsos |
|----------|---------|--------|--------------|
| **Negocios Perdidos** | `LostDeals.tsx` | 17-72 | `MOCK_LOST_DEALS` -- empresas, montos, razones inventadas |
| **Reportes** | `Reports.tsx` | 18-67 | `MOCK_VENDORS`, `SALES_BY_COUNTRY` -- "$4.8M", "156 cotizaciones" hardcoded |
| **Trazabilidad** | `Traceability.tsx` | 18-79 | `MOCK_TRACEABILITY` -- tracking ficticio |
| **Detalle de Cuenta** | `AccountDetail.tsx` | 35-94, 191 | `MOCK_OPPORTUNITIES`, `MOCK_CONTACTS` -- siempre muestra "Alimentos del Valle S.A." |
| **Casos** | `Cases.tsx` | datos mock | Tickets de soporte ficticios |
| **Crear Cotizacion** | `Quotes.tsx` | 64-70 | `alert("Funcionalidad en desarrollo")` -- boton decorativo |

### Don Roberto:
> "Me esta diciendo que si alguien del board mira Reportes, esta viendo numeros inventados? Esto es inaceptable."

### Ing. Martinez:
> "Coincido. Es peor que no tener la pantalla. Destruye la credibilidad de todo el sistema. Recomiendo: o se conectan a datos reales de SAP, o se eliminan y se pone 'Proximamente'."

**VEREDICTO ROUND 3:** 5 pantallas con datos 100% falsos. PRIORIDAD CRITICA: eliminar o reemplazar antes de que alguien tome una decision basada en datos ficticios.

---

## ROUND 4: "EL VENDEDOR PUEDE COTIZAR DESDE EL CRM?"

### Don Roberto:
> "Entonces mi vendedor esta en la oficina de Auto Mercado. El cliente le dice 'mandame la cotizacion'. Que hace mi vendedor?"

### Ing. Martinez:
> "Abre SAP B1. Busca el cliente. Agrega lineas. Genera la cotizacion. Le toma 15-20 minutos."

### Don Roberto:
> "Pero para eso pague el CRM! Para que el vendedor cotice rapido, desde el celular si es posible!"

### Ing. Martinez:
> "El boton 'Nueva Oferta' en Cotizaciones existe, pero al hacer click muestra una alerta de 'en desarrollo'. No envia datos a SAP. Los vendedores siguen cotizando en SAP directamente."

### IMPACTO CALCULADO:

```
50 cotizaciones/semana x 15 min extra en SAP = 12.5 horas/semana perdidas
12.5 hrs x $25/hr costo vendedor = $312.50/semana = $16,250/ano en productividad perdida
+ Deals perdidos por tardanza en cotizar (inmedible pero real)
```

### Don Roberto:
> "Esto es el feature #1. Si mis vendedores no pueden cotizar desde el CRM, para que lo tienen abierto?"

**VEREDICTO ROUND 4:** La creacion de cotizaciones en SAP desde el CRM es el feature que determina adopcion o abandono.

---

## ROUND 5: "NO VEO EL FLUJO DEL DINERO"

### Don Roberto:
> "Mire, el negocio es simple: Cotizo -> Pido -> Facturo -> Cobro. Puedo ver ese flujo para cada deal?"

### Ing. Martinez:
> "No. Cada documento vive aislado. Las cotizaciones estan en /quotes, los pedidos en /orders, las facturas en /invoices. No hay vinculo entre ellos. SAP tiene `BaseEntry` y `BaseType` en las lineas de documento que vinculan Cotizacion->Pedido->Factura, pero el CRM no los lee."

### Don Roberto:
> "Entonces si el cliente me llama y dice 'que paso con mi cotizacion QT-29216', tengo que buscar en 3 pantallas?"

### Ing. Martinez:
> "Correcto. La ficha 360 del cliente muestra las ultimas 5 cotizaciones, 5 pedidos y 5 facturas por separado. Pero no puedo ver que la QT-29216 se convirtio en ORD-31450 y luego en INV-28900."

**VEREDICTO ROUND 5:** La trazabilidad documental Quote->Order->Invoice es esencial para follow-up comercial y para responder al cliente.

---

## ROUND 6: "QUIERO METAS REALES"

### Don Roberto:
> "Cada trimestre doy metas a los vendedores. $200K para Carlos, $150K para Maria. El CRM muestra eso?"

### Ing. Martinez:
> "No. El dashboard muestra 'Ingresos vs Objetivo' pero el 'objetivo' es el promedio de los ultimos meses (`Math.round(avgRevenue)` en linea 449 de sap-proxy.service.ts). No hay forma de cargar metas reales."

### Don Roberto:
> "Entonces la barra de progreso que veo en el dashboard es... mentira?"

### Ing. Martinez:
> "Es un proxy. Si vendiste $300K los ultimos meses, te pone $300K de meta. No refleja su decision de subir la cuota a $400K."

### Don Roberto:
> "Sin metas reales no puedo pagar comisiones, no puedo hacer reviews, no puedo presentar al board."

**VEREDICTO ROUND 6:** Sin modelo de metas configurables, el CRM no puede medir cumplimiento real. Impacta compensacion, accountability y reportes a directivos.

---

## RESUMEN DE BRECHAS CONSENSUADAS

Tanto el Dueno como el Gerente coinciden en estas 15 brechas:

| # | Brecha | Dueno dice | Gerente dice | Severidad |
|---|--------|-----------|-------------|-----------|
| 1 | Datos MOCK en 5 pantallas | "Inaceptable - datos falsos" | "Destruye credibilidad" | **CRITICA** |
| 2 | No se pueden crear cotizaciones | "Feature #1 para adopcion" | "Mata la productividad" | **CRITICA** |
| 3 | No hay margenes/precios de productos | "Vuelo a ciegas en rentabilidad" | "No puedo analizar pricing" | **ALTA** |
| 4 | Sin trazabilidad Quote->Order->Invoice | "No puedo seguir el dinero" | "No puedo responder al cliente" | **ALTA** |
| 5 | Sin metas de ventas configurables | "No puedo medir cumplimiento" | "No puedo hacer coaching" | **ALTA** |
| 6 | Actividades no vinculadas a cuentas | "No verifico esfuerzo" | "No puedo hacer coaching basado en datos" | **ALTA** |
| 7 | AccountDetail con datos ficticios | "Datos equivocados = decisiones equivocadas" | "Peligroso para reuniones" | **ALTA** |
| 8 | Sin aging report de cobranza | "No se quien me debe de hace 90 dias" | "No puedo priorizar cobranza" | **MEDIA** |
| 9 | Sin analisis de perdidas (LostDeals real) | "No aprendo de errores" | "No ajusto estrategia" | **MEDIA** |
| 10 | Filtros del dashboard decorativos | "No puedo comparar periodos" | "No puedo drill-down" | **MEDIA** |
| 11 | Pipeline desconectado de SAP Quotations | "Forecast incompleto" | "Subestimo el pipeline real" | **MEDIA** |
| 12 | Sin paginacion en vistas criticas | "Solo veo las ultimas 50" | "Cotizaciones viejas invisibles" | **BAJA** |
| 13 | Sin descuentos visibles | "No controlo margenes" | "No hago analisis de pricing" | **MEDIA** |
| 14 | Sin win rate por vendedor | "No diferencio habilidades" | "Coaching generico" | **BAJA** |
| 15 | Sin cross-sell/upsell suggestions | "Dejo dinero en la mesa" | "No maximizo wallet share" | **BAJA** |

---

## PLAN DE MEJORA: 3 SPRINTS

### SPRINT 1: "LIMPIAR LA CASA" (Semana 1-2)
**Objetivo:** Eliminar datos falsos, conectar lo critico

| # | Tarea | Archivos | Esfuerzo | Impacto |
|---|-------|----------|----------|---------|
| 1.1 | Reemplazar AccountDetail mock con datos SAP reales | `AccountDetail.tsx` + usar endpoint `getAccountById` + `client-360` ya existentes | M | CRITICO |
| 1.2 | Reemplazar Reports mock con datos SAP reales | `Reports.tsx` -- crear endpoint `/api/reports` que agregue invoices por pais/vendedor | M | CRITICO |
| 1.3 | Eliminar LostDeals mock, mostrar "Proximamente" | `LostDeals.tsx` | S | CRITICO |
| 1.4 | Eliminar Traceability mock, mostrar "Proximamente" | `Traceability.tsx` | S | CRITICO |
| 1.5 | Eliminar Cases mock, mostrar "Proximamente" | `Cases.tsx` | S | CRITICO |
| 1.6 | Implementar paginacion en Quotes, Orders, Invoices | Copiar patron de `Contacts.tsx` | S | MEDIO |
| 1.7 | Hacer filtros del dashboard funcionales | `SalesDashboard.tsx` + pasar params a `/dashboard/stats` (backend ya soporta `salesPersonCode`) | M | ALTO |
| 1.8 | Vincular actividades a cuentas (mapActivity + formulario) | `sap-proxy.service.ts:356` resolver CardCode, `Activities.tsx` agregar selector cuenta | S | ALTO |

**Gate de salida:** CERO datos mock en produccion. Todas las pantallas muestran datos reales de SAP o "Proximamente".

### SPRINT 2: "ARMAR AL VENDEDOR" (Semana 3-4)
**Objetivo:** El vendedor puede HACER cosas, no solo ver

| # | Tarea | Archivos | Esfuerzo | Impacto |
|---|-------|----------|----------|---------|
| 2.1 | Crear cotizaciones en SAP desde el CRM | Nuevo endpoint POST `/api/quotes` -> `sapPost(cc, 'Quotations', body)`. Modal con buscador de cliente + grid de productos SAP | L | CRITICO |
| 2.2 | Trazabilidad documental Quote->Order->Invoice | Leer `BaseEntry`/`BaseType` de DocumentLines. Vista lifecycle en AccountDetail y QuoteDetail | M | ALTO |
| 2.3 | Modelo de metas de ventas | Nuevo modelo Prisma `SalesTarget`, CRUD endpoints, integrar en Dashboard y Scorecard | M | ALTO |
| 2.4 | Leer precios de productos desde SAP | Consultar `ItemPrices` o `PriceLists` de SAP. Mostrar en Products y en modal de cotizacion | S | ALTO |
| 2.5 | Mostrar descuentos en lineas de documento | Exponer `DiscountPercent` de `mapDocLine` en UI de cotizaciones, pedidos, facturas | S | MEDIO |
| 2.6 | Crear actividades vinculadas a cuenta/contacto | POST `/api/activities` con campos CardCode, ContactCode. SAP Activities API soporta estos campos | M | ALTO |

**Gate de salida:** Un vendedor puede cotizar, registrar actividades contra cuentas, y ver el flujo completo Quote->Order->Invoice.

### SPRINT 3: "INTELIGENCIA PARA DECIDIR" (Semana 5-6)
**Objetivo:** El Dueno y el Gerente pueden tomar decisiones estrategicas

| # | Tarea | Archivos | Esfuerzo | Impacto |
|---|-------|----------|----------|---------|
| 3.1 | Aging report de cobranza (0-30, 30-60, 60-90, 90+) | Nuevo endpoint `/api/manager/aging`. Calcular desde Invoices con DocDueDate y PaidToDate | M | ALTO |
| 3.2 | Analisis de perdidas real con razones | Campo `lossReason` en Opportunity model. Endpoint para analytics. Pantalla LostDeals conectada | M | ALTO |
| 3.3 | Reportes por pais con datos SAP reales | Endpoint `/api/reports/by-country` que agregue invoices por company code + vendedor | M | ALTO |
| 3.4 | Win rate por vendedor (no solo global) | Extender scorecard con win rate individual cruzando Quotations->Orders por SalesPersonCode | S | MEDIO |
| 3.5 | Pipeline hibrido (Prisma + SAP Quotations) | Mostrar cotizaciones SAP abiertas como cards adicionales en Pipeline | M | MEDIO |
| 3.6 | Sugerencias de cross-sell basadas en historico | Analizar patrones de compra por industria/segmento desde invoice lines | L | BAJO |

**Gate de salida:** El Dueno puede ver aging, perdidas, reportes por pais y metas vs real. El Gerente puede hacer coaching con datos completos.

---

## ROUND 7: "CUANTO ME ESTA COSTANDO LO QUE NO VEO?"

### Don Roberto (analisis de ROI):
> "Hice los numeros. Este CRM me ahorra aproximadamente $25K-$35K al ano en productividad (visibilidad centralizada, Client 360, Scorecard automatico). Pero lo que NO me ahorra por estar incompleto es mucho mas."

### Costos ocultos por brechas del CRM:

| Brecha | Costo Anual Estimado | Razonamiento |
|--------|---------------------|--------------|
| Sin aging de cartera | $50K-$150K | 3-5% de cartera vencida se vuelve incobrable sin seguimiento proactivo |
| Sin embudo medible Quote->Order | $100K-$300K | Mejora de conversion 5-10% sobre pipeline de $5M+ |
| Sin tracking logistico | $30K-$80K | Penalidades por atrasos + clientes perdidos |
| Sin margenes por producto | $50K-$200K | Decisiones de mix de producto sub-optimas |
| Sin metas por vendedor | $50K-$100K | Accountability que mejora rendimiento 10-15% |
| **TOTAL POTENCIAL NO CAPTURADO** | **$280K-$830K/ano** | |

### Ing. Martinez:
> "Los numeros de Don Roberto son conservadores. Solo con aging de cartera, si recuperamos 20% de las facturas >90 dias que hoy nadie persigue, eso paga el desarrollo del CRM completo."

### Don Roberto:
> "Exacto. Este CRM genera $30K de valor hoy de una herramienta que podria dar 10 veces mas. Es como tener un Ferrari y solo usarlo para ir al supermercado."

---

## ROUND 8: "DONDE SE ESCONDEN MIS VENDEDORES?"

### Don Roberto:
> "Digame Ing. Martinez: con este CRM, un vendedor mediocre puede esconderse?"

### Ing. Martinez:
> "Si, y le explico como:"

### Accountability Gaps (evidencia en codigo):

| Gap | Como se esconde el vendedor | Evidencia |
|-----|---------------------------|-----------|
| No hay metas individuales | "No hay cuota, asi que no estoy bajo" | `SellerScore` en `SalesManager.tsx:32-37` -- no tiene campo `target` |
| No hay minimo de actividades | Pasa 2 semanas sin llamar a nadie y el sistema no alerta | Sin regla de negocio en ningun archivo |
| "Dias sin contacto" no dispara accion | 5 clientes de $1.2M llevan 30+ dias sin contacto | `Client360Tab:229` solo muestra dato visual, no alerta |
| No hay razon de perdida obligatoria | Pierde deals y nadie sabe por que | `LostDeals.tsx` es 100% mock, no hay campo `lostReason` |
| Boton "Actualizar Estado" en Orders no funciona | No registra quien/cuando cambio el estado | `Orders.tsx:103` -- boton sin `onClick` handler |
| Cotizaciones sin actividad previa | Genera cotizaciones "en frio" sin haber visitado al cliente | No hay workflow de validacion |

### Don Roberto:
> "Inaceptable. Cada uno de esos gaps le cuesta dinero a la empresa. Quiero semaforos: VERDE si cumple, ROJO si no. Y quiero verlo en MI pantalla, no tener que ir a buscar."

---

## ROUND 9: "LAS 12 PREGUNTAS DE LUNES QUE EL CRM NO CONTESTA"

### Don Roberto (preguntas que haria cada lunes a las 7am):

| # | Pregunta | El CRM Responde? | Evidencia |
|---|----------|-------------------|-----------|
| 1 | Cual es mi margen bruto por producto y por pais? | **NO** | `sap-proxy.service.ts:200` -- `price: 0` hardcodeado |
| 2 | Quien me debe mas de 60 dias y cuanto exactamente? | **PARCIAL** | `Invoices.tsx:129` solo un bucket ">30 dias" |
| 3 | Cuantas cotizaciones se convirtieron en orden este mes? | **NO** | No hay flujo Quote->Order vinculado |
| 4 | Que vendedor tiene clientes vencidos sin contactar? | **NO** | No cruza `collectionRate` con `daysSinceLastContact` |
| 5 | Cuales son mis costos de flete por pais? | **NO** | `Traceability.tsx` es 100% mock |
| 6 | Cual es mi forecast ponderado POR PAIS? | **NO** | `forecast.routes.ts` opera sobre Prisma, no SAP |
| 7 | Cuantos clientes nuevos ganamos este mes vs anterior? | **NO** | Sin filtro por fecha de creacion de cliente |
| 8 | Cual es la rentabilidad neta de cada vendedor? | **NO** | Sin modelo de comisiones |
| 9 | Cuantos pedidos estan atrasados en logistica? | **NO** | `mapOrder:281` -- `logisticsStatus: null` siempre |
| 10 | Cual es el tiempo de resolucion real de soporte? | **NO** | `Cases.tsx` es mock. KPIs inventados |
| 11 | Cuanto compran mis top 10 clientes este ano vs anterior? | **NO** | Sin analisis year-over-year |
| 12 | Que productos estan sin movimiento en inventario? | **NO** | `Products.tsx` es solo catalogo visual |

### Ing. Martinez:
> "De 12 preguntas criticas, el CRM contesta 0 completamente y 1 parcialmente. Eso es un 8% de cobertura para decisiones de lunes."

### Don Roberto:
> "Y me lo dicen con una cara... En 90 dias quiero contestar al menos 8 de estas 12."

---

## CALIFICACION ACTUAL vs PROYECTADA

| Dimension | Actual | Post Sprint 1 | Post Sprint 2 | Post Sprint 3 |
|-----------|--------|---------------|---------------|---------------|
| **Datos reales** | 6/10 (5 pantallas mock) | 9/10 | 10/10 | 10/10 |
| **Productividad vendedor** | 3/10 (solo lectura) | 4/10 | 8/10 | 9/10 |
| **Visibilidad gerencial** | 7/10 (Scorecard + 360 buenos) | 8/10 | 9/10 | 10/10 |
| **Decisiones estrategicas** | 2/10 (sin margenes, sin aging) | 3/10 | 6/10 | 9/10 |
| **Adopcion esperada** | 30% (vendedores usan SAP) | 50% | 85% | 95% |
| **GLOBAL** | **4.5/10** | **6/10** | **8/10** | **9.5/10** |

---

## VEREDICTO FINAL

### Don Roberto (Dueno) -- Calificacion: 5.5/10:
> "Pague por un CRM y me entregaron MEDIO CRM. La base tecnica es solida: la conexion a SAP funciona, el Client 360 y el Seller Scorecard son genuinamente utiles. PERO tengo 6 pantallas mostrando datos inventados (Reports, LostDeals, Cases, Traceability, AccountDetail, Chart fallbacks), el embudo esta desconectado de SAP, no puedo crear cotizaciones, la logistica es pura fachada con nulls, y no tengo aging de cartera, metas por vendedor, ni notificaciones. La mitad del CRM lee datos reales de SAP y es util. La otra mitad es maqueta bonita. En 30 dias exijo: cero datos mock, aging de cartera, metas y tracking logistico. En 60 dias: dashboard por pais y margenes. En 90 dias: cotizaciones funcionales. Si no, la inversion no se justifica. Hoy saco $30K de valor de una herramienta que podria dar $300K-$500K."

### Ing. Martinez (Gerente) -- Calificacion: 6/10:
> "La lectura de datos es la mejor que he visto en un CRM custom para la region. La integracion SAP es solida, el multi-pais funciona, el 360 me prepara para una reunion en 3 minutos. Pero mis vendedores abren el CRM, ven datos, y vuelven a SAP para trabajar. Es un cerebro sin manos. La prioridad #1 es que puedan cotizar aqui. La #2 es eliminar datos mock antes de que alguien tome una decision equivocada. La #3 es metas reales para accountability. Con Sprint 1 y 2 completados, la adopcion sube de 30% a 85%. Sin eso, el CRM se convierte en un proyecto bonito que nadie usa."

### DONDE COINCIDEN (consenso absoluto):
1. **Datos mock son INACEPTABLES** -- ambos exigen eliminacion inmediata
2. **Sin crear cotizaciones, no hay adopcion** -- el feature critico para uso diario
3. **Sin metas reales, no hay accountability** -- tanto dueno como gerente lo necesitan
4. **El flujo del dinero debe ser visible** -- Quote -> Order -> Invoice -> Collection
5. **Las actividades deben vincularse a cuentas** -- sin esto, no se mide esfuerzo

### DONDE DIFIEREN (tension productiva):

| Tema | Dueno | Gerente | Quien tiene razon |
|------|-------|---------|-------------------|
| Prioridad #1 | Aging de cartera (dinero!) | Crear cotizaciones (adopcion!) | **AMBOS** -- Sprint 1 limpia datos, Sprint 2 agrega accion |
| Timeline de cotizaciones | 90 dias (puede esperar) | Semana 2-3 (urgente para adopcion) | **Gerente** -- sin esto los vendedores no usan el CRM |
| Margenes por producto | Inmediato (decision estrategica) | 60 dias (nice-to-have) | **Dueno** -- sin margen no hay negocio |
| Cross-sell suggestions | 90 dias | No priorizado | **Dueno** -- pero Sprint 3 es razonable |

### CONCLUSION:
> **"La aplicacion tiene las herramientas de INTELIGENCIA correctas pero carece de las herramientas de ACCION. Es un cerebro sin manos. Sprint 1 limpia la credibilidad, Sprint 2 da las manos, Sprint 3 agrega vision estrategica. Las 3 juntas convierten un visor bonito en el centro nervioso de la operacion comercial. Valor actual: $30K/ano. Valor potencial post-3 sprints: $300K-$500K/ano. ROI del desarrollo adicional: 10x."**
