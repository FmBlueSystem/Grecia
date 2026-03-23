# Decisiones Arquitectonicas - Portal Casos STIA

## ADR-001: PostgreSQL para gestion de usuarios y configuracion

**Fecha:** 25 Feb 2026
**Estado:** Aprobado
**Contexto:** El portal necesita autenticacion, roles, permisos y configuracion. Se evaluo si usar SAP directamente o una base de datos propia.

### Opciones evaluadas

| Criterio | SAP directo | PostgreSQL local |
|----------|-------------|-----------------|
| Licencias | Requiere 1 licencia SAP por usuario (~$100-200 USD/mes cada una) | Sin costo adicional (ya existe en el servidor) |
| Roles y permisos | SAP no tiene roles granulares para ServiceCalls (solo lectura/escritura global) | Roles personalizados: agente, supervisor, admin con permisos por accion |
| Auditoria | SAP registra cambios pero no es facilmente consultable | Tabla de logs con usuario, accion, timestamp, IP |
| Configuracion portal | No existe en SAP (tendria que ser UDFs en tablas no relacionadas) | Tabla dedicada con parametros del portal |
| Disponibilidad | Si SAP cae, nadie puede entrar al portal | Login local independiente; SAP solo para datos de casos |
| Velocidad de auth | Login SAP toma 1-3 segundos por request (HTTPS externo) | Login local < 50ms (PostgreSQL en localhost) |
| Multi-pais | Habria que crear usuarios en cada una de las 5 DBs SAP | Un solo usuario con pais(es) asignados |
| Mantenimiento | Requiere acceso admin SAP para cada cambio de usuario | Panel admin en el propio portal |

### Decision

**PostgreSQL local** para gestion de usuarios, roles, permisos, configuracion y auditoria.
**SAP Service Layer** exclusivamente para datos de negocio (ServiceCalls, BusinessPartners, EmployeesInfo).

### Justificacion principal

1. **Costo:** SAP Business One cobra por licencia de usuario. Con 10-20 usuarios del portal, el costo seria $1,000-4,000 USD/mes adicionales. PostgreSQL ya existe en el servidor sin costo.

2. **Independencia:** Si SAP tiene mantenimiento o cae temporalmente, los usuarios pueden al menos entrar al portal y ver datos cacheados. Con SAP directo, cualquier caida bloquea completamente el acceso.

3. **Permisos granulares:** SAP no distingue entre "puede crear casos" y "puede ver estadisticas". El portal necesita roles diferenciados (agente solo ve sus casos, supervisor ve todos, admin configura).

4. **Auditoria:** STIA necesita saber quien hizo que y cuando. PostgreSQL permite una tabla de audit logs consultable desde el portal. SAP almacena logs pero no son facilmente accesibles via Service Layer.

5. **Velocidad:** La autenticacion contra SAP Service Layer requiere un round-trip HTTPS al servidor SAP externo (1-3 seg). PostgreSQL local responde en milisegundos.

### Consecuencias

- El portal mantiene su propia tabla de usuarios (NO duplica datos de SAP)
- SAP se accede con un usuario de servicio compartido ("Consultas") para queries de datos
- Los usuarios del portal se crean/editan desde un panel admin dentro del portal
- Se requiere seed inicial de usuarios (script SQL o panel admin)

---

## Schema de Base de Datos

### Tabla: users

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | SERIAL PK | ID unico |
| email | VARCHAR(255) UNIQUE | Email del usuario (login) |
| password_hash | VARCHAR(255) | Bcrypt hash de la contrasena |
| name | VARCHAR(100) | Nombre completo |
| role | VARCHAR(20) | agente / supervisor / admin |
| countries | VARCHAR(20)[] | Paises asignados: {"CR","SV","GT","HN","PA"} |
| default_country | VARCHAR(2) | Pais por defecto al entrar |
| active | BOOLEAN DEFAULT true | Si puede acceder |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| updated_at | TIMESTAMPTZ | Ultima modificacion |

### Tabla: settings

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| key | VARCHAR(100) PK | Nombre del parametro |
| value | JSONB | Valor del parametro |
| updated_at | TIMESTAMPTZ | Ultima modificacion |
| updated_by | INTEGER FK users | Quien lo cambio |

### Tabla: audit_logs

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | SERIAL PK | ID unico |
| user_id | INTEGER FK users | Quien hizo la accion |
| action | VARCHAR(50) | login / create_case / edit_case / resolve_case / etc. |
| entity | VARCHAR(50) | case / user / setting |
| entity_id | VARCHAR(50) | ID del registro afectado |
| details | JSONB | Datos adicionales (campos cambiados, etc.) |
| ip_address | INET | IP del usuario |
| created_at | TIMESTAMPTZ | Timestamp de la accion |

### Roles y permisos

| Permiso | Agente | Supervisor | Admin |
|---------|--------|------------|-------|
| Ver casos propios | Si | Si | Si |
| Ver todos los casos | No | Si | Si |
| Crear caso | Si | Si | Si |
| Editar caso | Solo propios | Todos | Todos |
| Resolver caso | Solo propios | Todos | Todos |
| Ver estadisticas | Basicas | Completas | Completas |
| Ver SLA & Alertas | No | Si | Si |
| Gestionar usuarios | No | No | Si |
| Configurar parametros | No | No | Si |
| Cambiar pais | Solo asignados | Solo asignados | Todos |
