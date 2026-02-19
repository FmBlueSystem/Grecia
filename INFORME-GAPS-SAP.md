# Informe de Brechas de Datos SAP B1
## STIA CRM - Requisitos de Completitud de Datos

**Fecha:** 15 de febrero 2026
**Preparado por:** BlueSystem
**Para:** Equipo STIA - Administradores SAP B1
**Compañía auditada:** Costa Rica (CR)

---

## Resumen Ejecutivo

El CRM STIA consume datos en tiempo real desde SAP Business One Service Layer. Tras auditoría de los datos actuales, se identificaron **23 brechas** en la completitud de datos que impiden que el CRM funcione a su máxima capacidad. Este informe detalla exactamente qué campos requieren atención en SAP para que cada módulo del CRM opere correctamente.

**Sin modificar la aplicación**, la calidad del CRM mejorará dramáticamente al completar los datos descritos a continuación.

---

## Estado por Módulo

| Módulo CRM | Entidad SAP | Datos Usados | Completitud | Impacto |
|------------|-------------|--------------|:-----------:|---------|
| Cuentas | BusinessPartners | CardName, Phone1, Website, Country, Industry, SalesPersonCode | 40% | ALTO |
| Contactos | ContactEmployees | Name, E_Mail, Phone1, MobilePhone, Position | 25% | ALTO |
| Cotizaciones | Quotations | DocNum, CardName, DocTotal, SalesPersonCode, DocumentLines | 80% | MEDIO |
| Pedidos | Orders | DocNum, CardName, DocTotal, SalesPersonCode, DocumentLines, BaseEntry | 70% | MEDIO |
| Facturas | Invoices | DocNum, CardName, DocTotal, PaidToDate, DocDueDate | 85% | BAJO |
| Actividades | Activities | Subject, Notes, ActivityType, HandledBy, CardCode | 15% | CRITICO |
| Productos | Items | ItemCode, ItemName, ItemPrices, QuantityOnStock | 50% | MEDIO |
| Dashboard | (Agregado) | Invoices + Orders + Quotations + Activities + SalesPersons | 60% | ALTO |
| Antigüedad | Invoices (abiertas) | DocTotal, PaidToDate, DocDueDate, SalesPersonCode | 85% | BAJO |
| Ficha 360° | (Multi-entidad) | BP + Orders + Invoices + Quotes + Activities | 45% | ALTO |

---

## 1. BusinessPartners (Cuentas)

### Campos que el CRM necesita y su estado actual

| Campo SAP | Uso en CRM | Estado Actual | Acción Requerida |
|-----------|-----------|:------------:|------------------|
| `CardName` | Nombre de cuenta en listados, dashboard, 360° | Algunos BPs tienen solo el código (ej: "CL01316") en lugar del nombre comercial | Completar nombre comercial para todos los BPs activos |
| `Phone1` | Teléfono principal en ficha de cuenta | ~50% vacío | Completar teléfono de cada cliente activo |
| `Website` | Sitio web en ficha 360° | ~95% vacío | Completar URL del sitio web cuando exista |
| `Industry` | Industria/sector en listados y filtros | ~100% vacío | **CRITICO** - Asignar código de industria a cada BP. Sin esto, el CRM no puede segmentar por industria |
| `SalesPersonCode` | Vendedor asignado (owner) en todos los módulos | Algunos BPs tienen código -1 ("Ningún empleado") | Asignar vendedor responsable a cada BP activo |
| `Country` | Filtro por país en dashboard y reportes | OK (~95% poblado) | Verificar BPs sin país asignado |

### Ejemplo de dato incompleto encontrado
```
BP "CL01316": Sin nombre, sin teléfono, sin web, sin industria, sin vendedor
```

### Beneficio al completar
- El módulo de Cuentas mostrará información completa
- La Ficha 360° del cliente tendrá datos de contacto
- Los reportes podrán segmentar por industria
- Cada cuenta tendrá un vendedor responsable asignado

---

## 2. ContactEmployees (Contactos)

### Campos que el CRM necesita y su estado actual

| Campo SAP | Uso en CRM | Estado Actual | Acción Requerida |
|-----------|-----------|:------------:|------------------|
| `Name` | Nombre del contacto en listados | Muchos tienen nombres genéricos: "GERENTE", "Compras", "CxP" en lugar del nombre real | Reemplazar nombres genéricos con nombre y apellido real |
| `E_Mail` | Email del contacto | ~80% vacío, algunos incompletos (ej: "user@gmail" sin .com) | Completar email válido de cada contacto |
| `Phone1` | Teléfono del contacto | ~70% vacío | Completar teléfono directo |
| `MobilePhone` | Celular del contacto | ~95% vacío | Completar número de celular |
| `Position` | Cargo/puesto en la empresa | ~100% vacío | **CRITICO** - Completar cargo (Gerente General, Compras, CxP, etc.) para identificar tomadores de decisión |

### Ejemplo de datos incompletos encontrados
```
Contacto "GERENTE" en INDESA: Sin email, con teléfono, sin celular, sin cargo
Contacto "Compras" en COPROLAC: Sin email, sin teléfono, sin celular, sin cargo
Contacto "CxP" en COPROLAC: Con email, sin teléfono, sin celular, sin cargo
```

### Beneficio al completar
- El CRM mostrará nombres reales de personas en lugar de departamentos
- La búsqueda global encontrará contactos por nombre
- Los vendedores podrán contactar directamente desde el CRM
- Se identificarán los tomadores de decisión por su cargo

---

## 3. Activities (Actividades)

### Estado: CRITICO - Módulo más afectado

| Campo SAP | Uso en CRM | Estado Actual | Acción Requerida |
|-----------|-----------|:------------:|------------------|
| `Notes` | Descripción/asunto de la actividad | Muy escaso. La mayoría de actividades no tienen notas | **CRITICO** - Registrar descripción en cada actividad |
| `ActivityType` | Tipo (Llamada, Reunión, Tarea, Email) | Funcional pero con pocos registros | Registrar todas las interacciones con clientes |
| `HandledBy` | Vendedor responsable | Algunos sin asignar | Asignar responsable a cada actividad |
| `CardCode` | Cliente asociado | Funcional | OK |
| `Status` | Estado de la actividad | Funcional | OK |

### Problema principal
El módulo de Actividades del CRM muestra solo **3 registros** para toda Costa Rica. Esto indica que los vendedores **no están registrando sus actividades en SAP**.

### Recomendación
Implementar como política comercial que todo vendedor registre en SAP:
1. Cada llamada realizada a un cliente
2. Cada reunión (presencial o virtual)
3. Cada tarea pendiente o compromiso adquirido
4. Emails importantes enviados

### Beneficio al completar
- El Dashboard mostrará actividad real del equipo por día
- La Ficha 360° mostrará historial de contacto con cada cliente
- El indicador "Días sin contacto" será preciso
- El gerente podrá evaluar productividad del equipo

---

## 4. Items (Productos)

| Campo SAP | Uso en CRM | Estado Actual | Acción Requerida |
|-----------|-----------|:------------:|------------------|
| `ItemName` | Nombre del producto en listados y cotizaciones | Algunos ítems solo muestran el código (ej: "99009065") | Completar nombre descriptivo |
| `ItemPrices` (PriceList 1) | Precio en listado de productos y al crear cotizaciones | ~30% tienen precio $0 | Actualizar lista de precios #1 para todos los ítems activos |
| `QuantityOnStock` | Inventario disponible | Muchos muestran 0 | Verificar si es stock real o si falta configuración de almacenes |
| `ItemsGroupCode` | Categoría/grupo de producto | Muestra código numérico (ej: "100", "105") | No requiere cambio, pero se recomienda documentar qué significa cada código |

### Beneficio al completar
- El módulo de Productos mostrará nombres y precios reales
- Al crear cotizaciones, los precios se cargarán automáticamente
- Se podrá filtrar por productos con stock disponible

---

## 5. Quotations / Orders - Trazabilidad

### Estado: Parcialmente funcional

| Aspecto | Estado | Detalle |
|---------|:------:|---------|
| Cotización → Pedido | Funcional cuando se usa BaseEntry/BaseType | Funciona correctamente cuando el pedido se crea **desde** la cotización en SAP |
| Pedido → Factura | Funcional cuando se usa BaseEntry/BaseType | Funciona cuando la factura se crea **desde** el pedido en SAP |
| Pedido directo (sin cotización) | Sin trazabilidad | Si el pedido se crea directamente sin cotización origen, no hay enlace |

### Acción requerida
Para que la trazabilidad funcione en el CRM (Cotización → Pedido → Factura):

1. **Siempre crear pedidos DESDE cotizaciones** usando la función "Copiar a → Pedido de venta" de SAP
2. **Siempre crear facturas DESDE pedidos** usando "Copiar a → Factura de deudores"
3. Evitar crear documentos "sueltos" sin origen

### Beneficio
- La ficha de cada pedido mostrará la cotización que lo originó
- La ficha de cada pedido mostrará las facturas que derivaron
- Se podrá rastrear el ciclo completo: Cotización → Pedido → Factura

---

## 6. Orders - Logística

| Campo | Uso en CRM | Estado | Acción Requerida |
|-------|-----------|:------:|------------------|
| Campos definidos por usuario (UDFs) para logística | Estado de despacho, número de guía | No configurado | Crear UDFs en SAP: `U_LogisticsStatus`, `U_TrackingNumber` |

### Detalle
El CRM tiene columnas para **Estado Logístico** y **Número de Rastreo** en pedidos, pero SAP no tiene estos campos de forma nativa en la entidad Orders. Se requiere:

1. Crear campo definido por usuario (UDF) `U_LogisticsStatus` tipo texto en la tabla ORDR con valores posibles:
   - `Facturado`
   - `Disponible`
   - `Salió de puerto`
   - `Llegó a puerto`
   - `Entregado`
2. Crear UDF `U_TrackingNumber` tipo texto en ORDR para número de guía

### Alternativa
Si no se desea crear UDFs, se puede usar el campo `Comments` de la orden para registrar información logística, aunque esto es menos estructurado.

---

## 7. SalesPersons (Vendedores)

| Aspecto | Estado | Acción |
|---------|:------:|--------|
| Vendedores registrados | OK - 31 vendedores en SAP CR | Sin acción |
| Asignación a BPs | Parcial - algunos BPs sin vendedor | Asignar vendedor a todos los BPs activos |
| Asignación a documentos | Parcial - algunas cotizaciones sin vendedor | Asignar vendedor al crear documentos |

---

## 8. Pipeline / Oportunidades

### Estado: NO EXISTE EN SAP

SAP B1 no tiene un módulo nativo de gestión de oportunidades de venta (pipeline/embudo). El CRM utiliza una base de datos local (PostgreSQL) para este módulo.

### Opciones para alimentar el pipeline:

**Opción A (Recomendada):** Uso mixto
- Los vendedores registran oportunidades directamente en el CRM
- Cuando una oportunidad se cierra como "Ganada", se crea la cotización en SAP desde el CRM
- El CRM ya tiene esta funcionalidad implementada

**Opción B:** SAP Business One tiene un módulo de "Sales Opportunities" que podría activarse
- Requiere licencia adicional y configuración
- Permitiría que las oportunidades vivan en SAP
- Se necesitaría adaptar el CRM para leer desde `SalesOpportunities` del Service Layer

### Acción requerida (mínima)
Entrenar a los vendedores para registrar oportunidades en el CRM, ya que este módulo no depende de SAP.

---

## 9. Leads (Prospectos)

### Estado: NO EXISTE EN SAP

Similar al Pipeline, SAP B1 no tiene un módulo nativo de leads/prospectos. El CRM utiliza base de datos local.

### Acción requerida
No requiere cambios en SAP. Los vendedores deben registrar prospectos directamente en el CRM. Cuando un prospecto se califica, el CRM convierte automáticamente a Cuenta + Contacto + Oportunidad.

---

## Resumen de Acciones Prioritarias

### Prioridad CRITICA (Sin esto, módulos clave no funcionan)

| # | Acción | Entidad SAP | Módulos CRM Afectados | Esfuerzo |
|---|--------|-------------|----------------------|----------|
| 1 | Registrar actividades diarias (llamadas, reuniones, tareas) | Activities | Dashboard, Actividades, Ficha 360° | Continuo |
| 2 | Completar campo `Industry` en todos los BPs activos | BusinessPartners | Cuentas, Reportes, Filtros | 4-8 horas |
| 3 | Asignar `SalesPersonCode` a todos los BPs activos | BusinessPartners | Todos los módulos, Reportes por vendedor | 2-4 horas |
| 4 | Corregir nombres de contactos (reemplazar "GERENTE", "Compras" por nombre real) | ContactEmployees | Contactos, Búsqueda Global | 8-16 horas |
| 5 | Completar campo `Position` (cargo) en contactos | ContactEmployees | Contactos, Ficha 360° | 8-16 horas |

### Prioridad ALTA (Mejora significativa de experiencia)

| # | Acción | Entidad SAP | Módulos CRM Afectados | Esfuerzo |
|---|--------|-------------|----------------------|----------|
| 6 | Completar emails de contactos | ContactEmployees | Contactos, Búsqueda | 4-8 horas |
| 7 | Completar teléfonos y celulares de contactos | ContactEmployees | Contactos, Ficha 360° | 4-8 horas |
| 8 | Actualizar precios en PriceList 1 para ítems con precio $0 | ItemPrices | Productos, Cotizaciones | 4-8 horas |
| 9 | Completar `ItemName` para ítems que solo tienen código | Items | Productos, Cotizaciones | 2-4 horas |
| 10 | Completar `Phone1` de BPs | BusinessPartners | Cuentas, Ficha 360° | 2-4 horas |

### Prioridad MEDIA (Buena práctica)

| # | Acción | Entidad SAP | Módulos CRM Afectados | Esfuerzo |
|---|--------|-------------|----------------------|----------|
| 11 | Completar `Website` de BPs donde aplique | BusinessPartners | Cuentas, Ficha 360° | 2-4 horas |
| 12 | Crear UDFs de logística en Orders | Orders (ORDR) | Pedidos (seguimiento) | 1-2 horas |
| 13 | Usar siempre "Copiar a" para trazabilidad de documentos | Quotations → Orders → Invoices | Trazabilidad | Proceso continuo |
| 14 | Verificar `CardName` de BPs que solo muestran código | BusinessPartners | Cuentas | 1-2 horas |

---

## Métricas de Seguimiento

Para verificar el progreso de completitud de datos, se recomienda ejecutar periódicamente estas consultas en SAP:

### BPs sin industria
```
BusinessPartners?$filter=CardType eq 'C' and Industry eq null&$select=CardCode,CardName&$inlinecount=allpages
```

### BPs sin vendedor asignado
```
BusinessPartners?$filter=CardType eq 'C' and (SalesPersonCode eq -1 or SalesPersonCode eq null)&$select=CardCode,CardName&$inlinecount=allpages
```

### Contactos sin email
```
BusinessPartners?$filter=CardType eq 'C'&$select=CardCode,ContactEmployees
→ Filtrar ContactEmployees donde E_Mail es vacío
```

### Actividades esta semana
```
Activities?$filter=ActivityDate ge '[fecha_lunes]'&$inlinecount=allpages
→ Si el conteo es < 5 por vendedor por semana, hay sub-registro
```

---

## Conclusión

El CRM STIA está técnicamente preparado para operar con datos de SAP B1 en tiempo real. Los módulos de Cotizaciones, Pedidos, Facturas y Antigüedad funcionan correctamente. Sin embargo, la experiencia completa del CRM depende directamente de la **calidad y completitud de los datos maestros en SAP**.

Las 5 acciones críticas listadas arriba son requisitos mínimos para que el CRM entregue valor real al equipo comercial. Se estima un esfuerzo total de **40-70 horas** de trabajo administrativo en SAP para alcanzar una completitud del 80%+.

**No se requieren cambios en la aplicación CRM.** Todos los módulos ya están preparados para mostrar esta información cuando esté disponible en SAP.

---

*Informe generado por BlueSystem - Auditoría de Datos SAP B1 para STIA CRM*
