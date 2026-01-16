# STIA CRM - Modelo de Datos (ERD)

## Diagrama de Relaciones de Entidades

### Entidades Principales

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │   Contact    │       │   Account    │
│              │       │              │       │              │
│ id           │───┐   │ id           │       │ id           │
│ email        │   │   │ firstName    │       │ name         │
│ password     │   │   │ lastName     │───────│ industry     │
│ role         │   │   │ email        │   │   │ revenue      │
│ team         │   │   │ phone        │   │   │ employees    │
└──────────────┘   │   │ accountId    │───┘   │ parentId     │
                   │   │ ownerId      │───┐   │ ownerId      │───┐
                   │   │ tags         │   │   └──────────────┘   │
                   │   └──────────────┘   │                      │
                   │                      │                      │
                   │   ┌──────────────┐   │                      │
                   │   │ Opportunity  │   │                      │
                   │   │              │   │                      │
                   │   │ id           │   │                      │
                   │   │ name         │   │                      │
                   │   │ value        │   │                      │
                   │   │ stage        │   │                      │
                   │   │ probability  │   │                      │
                   │   │ closeDate    │   │                      │
                   │   │ accountId    │───┘                      │
                   │   │ contactId    │──────┐                   │
                   │   │ ownerId      │──────┼───────────────────┘
                   │   └──────────────┘      │
                   │                         │
                   │   ┌──────────────┐      │
                   │   │  Activity    │      │
                   │   │              │      │
                   │   │ id           │      │
                   │   │ type         │      │
                   │   │ subject      │      │
                   │   │ description  │      │
                   │   │ dueDate      │      │
                   │   │ status       │      │
                   │   │ contactId    │──────┘
                   │   │ accountId    │
                   │   │ opportunityId│
                   │   │ ownerId      │──────┐
                   │   └──────────────┘      │
                   │                         │
                   └─────────────────────────┘
```

---

## Entidades Detalladas

### 1. User (Usuarios)

Representa usuarios del sistema CRM.

```typescript
interface User {
  // Identificación
  id: string;                    // UUID
  email: string;                 // Único, requerido
  password: string;              // Hash bcrypt

  // Información Personal
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;               // URL a imagen

  // Información Laboral
  jobTitle?: string;
  department?: string;
  managerId?: string;            // FK a User (self-reference)
  teamId?: string;               // FK a Team

  // Rol y Permisos
  roleId: string;                // FK a Role
  isActive: boolean;             // Default: true

  // Configuración
  timezone: string;              // Default: 'America/Costa_Rica'
  locale: string;                // Default: 'es-CR'
  dateFormat: string;            // Default: 'DD/MM/YYYY'

  // Tokens
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  // Metadata
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  manager?: User;
  team?: Team;
  role: Role;
  ownedContacts: Contact[];
  ownedAccounts: Account[];
  ownedOpportunities: Opportunity[];
  activities: Activity[];
}
```

**Índices**:
- `email` (UNIQUE)
- `roleId`
- `teamId`
- `isActive`

---

### 2. Role (Roles)

Roles de usuario con permisos asociados.

```typescript
interface Role {
  id: string;                    // UUID
  name: string;                  // Único: 'Admin', 'Sales Manager', 'Sales Rep'
  description?: string;
  permissions: Permission[];     // JSON: { module: string, actions: string[] }[]

  // Metadata
  isSystem: boolean;             // No editable/eliminable
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  users: User[];
}
```

**Roles Predefinidos**:
1. **System Admin**: Acceso completo
2. **Sales Manager**: Gestión de equipo, reportes
3. **Sales Representative**: CRUD propio + lectura del equipo
4. **Marketing User**: Leads, campañas
5. **Service Agent**: Casos, tickets
6. **Read-Only**: Solo lectura

**Ejemplo de Permission JSON**:
```json
[
  { "module": "contacts", "actions": ["create", "read", "update", "delete", "export"] },
  { "module": "opportunities", "actions": ["read", "update"] },
  { "module": "dashboards", "actions": ["read"] }
]
```

---

### 3. Team (Equipos)

Equipos de ventas o departamentos.

```typescript
interface Team {
  id: string;                    // UUID
  name: string;                  // 'North Sales', 'Inside Sales'
  description?: string;
  managerId?: string;            // FK a User

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  manager?: User;
  members: User[];
}
```

---

### 4. Contact (Contactos)

Personas individuales (leads, prospects, clientes).

```typescript
interface Contact {
  // Identificación
  id: string;                    // UUID

  // Información Personal
  firstName: string;             // Requerido
  lastName: string;              // Requerido
  email?: string;                // Índice
  phone?: string;
  mobile?: string;

  // Información Profesional
  jobTitle?: string;
  department?: string;
  accountId?: string;            // FK a Account

  // Dirección
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;              // Default: 'Costa Rica'

  // Social Media
  linkedinUrl?: string;
  twitterHandle?: string;

  // Marketing
  leadSource?: string;           // 'Website', 'Referral', 'Event', 'Cold Call'
  tags: string[];                // ['VIP', 'Decision Maker']

  // Scoring
  score?: number;                // 0-100
  rating?: string;               // 'Hot', 'Warm', 'Cold'

  // Ownership
  ownerId: string;               // FK a User (requerido)

  // Control
  isActive: boolean;             // Default: true (soft delete)

  // Metadata
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;           // FK a User
  updatedById?: string;          // FK a User

  // Relaciones
  account?: Account;
  owner: User;
  opportunities: Opportunity[];
  activities: Activity[];
  notes: Note[];
  documents: Document[];
}
```

**Índices**:
- `email`
- `accountId`
- `ownerId`
- `leadSource`
- `isActive`
- `createdAt` (DESC)

---

### 5. Account (Cuentas/Empresas)

Empresas u organizaciones.

```typescript
interface Account {
  // Identificación
  id: string;                    // UUID
  name: string;                  // Requerido, índice

  // Información Empresarial
  industry?: string;             // 'Technology', 'Healthcare', 'Manufacturing'
  accountType?: string;          // 'Customer', 'Prospect', 'Partner', 'Competitor'
  website?: string;

  // Tamaño
  employeeCount?: number;
  annualRevenue?: number;        // En USD

  // Dirección Sede
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;

  shippingStreet?: string;       // Opcional, si difiere de billing
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;

  // Contacto Principal
  phone?: string;
  fax?: string;

  // Jerarquía
  parentId?: string;             // FK a Account (self-reference)

  // Health Score
  healthScore?: number;          // 0-100

  // Ownership
  ownerId: string;               // FK a User (requerido)

  // Control
  isActive: boolean;             // Default: true

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById?: string;

  // Relaciones
  parent?: Account;
  children: Account[];           // Subsidiarias
  owner: User;
  contacts: Contact[];
  opportunities: Opportunity[];
  activities: Activity[];
  notes: Note[];
  documents: Document[];
}
```

**Índices**:
- `name`
- `industry`
- `accountType`
- `ownerId`
- `parentId`
- `isActive`

---

### 6. Opportunity (Oportunidades de Venta)

Deals o ventas potenciales.

```typescript
interface Opportunity {
  // Identificación
  id: string;                    // UUID
  name: string;                  // Requerido: 'Acme Corp - Q1 2026 Software License'

  // Valor
  amount: number;                // Requerido
  currency: string;              // Default: 'USD' (ISO 4217)

  // Pipeline
  stage: string;                 // Requerido: ver OpportunityStage
  probability: number;           // 0-100, auto-calculado según stage

  // Timing
  closeDate: Date;               // Fecha estimada de cierre (requerido)
  actualCloseDate?: Date;        // Fecha real (cuando se cierra)

  // Tipo
  opportunityType?: string;      // 'New Business', 'Upsell', 'Renewal', 'Cross-sell'

  // Origen
  leadSource?: string;           // Igual que Contact

  // Competencia
  competitors?: string[];        // ['Competitor A', 'Competitor B']

  // Descripción
  description?: string;
  nextSteps?: string;

  // Productos (simplificado para MVP)
  productsJson?: any;            // JSON: [{ product: string, quantity: number, price: number }]

  // Relaciones
  accountId: string;             // FK a Account (requerido)
  contactId?: string;            // FK a Contact (contacto principal)

  // Ownership
  ownerId: string;               // FK a User (requerido)

  // Estado
  isClosed: boolean;             // Default: false
  isWon?: boolean;               // true si ganó, false si perdió, null si abierta
  lostReason?: string;           // Si perdió: 'Price', 'Timing', 'Competitor', 'No decision'

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById?: string;

  // Relaciones
  account: Account;
  contact?: Contact;
  owner: User;
  activities: Activity[];
  notes: Note[];
  documents: Document[];
  stageHistory: OpportunityStageHistory[];
}
```

**Índices**:
- `accountId`
- `contactId`
- `ownerId`
- `stage`
- `closeDate`
- `isClosed`
- `isWon`

---

### 7. OpportunityStage (Etapas del Pipeline)

Etapas configurables del pipeline de ventas.

```typescript
interface OpportunityStage {
  id: string;                    // UUID
  name: string;                  // 'Prospecting', 'Qualification', 'Proposal'
  displayOrder: number;          // Orden visual (1, 2, 3...)
  probability: number;           // 0-100, probabilidad default

  // Configuración
  isActive: boolean;             // Default: true
  isClosed: boolean;             // true para 'Closed Won' y 'Closed Lost'
  isWon?: boolean;               // true para 'Closed Won', false para 'Closed Lost'

  // Business Process
  requiredFields?: string[];     // ['budget_confirmed', 'decision_maker_identified']

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  opportunities: Opportunity[];
}
```

**Etapas Predefinidas**:
1. Lead/Prospecting (10%)
2. Qualification (20%)
3. Needs Analysis (40%)
4. Proposal/Quote (60%)
5. Negotiation (80%)
6. Closed Won (100%)
7. Closed Lost (0%)

---

### 8. OpportunityStageHistory (Historial de Cambios de Etapa)

Audit trail de movimientos en el pipeline.

```typescript
interface OpportunityStageHistory {
  id: string;                    // UUID
  opportunityId: string;         // FK a Opportunity
  fromStageId?: string;          // FK a OpportunityStage (null si es primera etapa)
  toStageId: string;             // FK a OpportunityStage (requerido)

  // Metadata
  changedAt: Date;
  changedById: string;           // FK a User

  // Relaciones
  opportunity: Opportunity;
  fromStage?: OpportunityStage;
  toStage: OpportunityStage;
  changedBy: User;
}
```

---

### 9. Activity (Actividades)

Llamadas, emails, reuniones, tareas, notas.

```typescript
interface Activity {
  // Identificación
  id: string;                    // UUID

  // Tipo
  activityType: string;          // 'Call', 'Email', 'Meeting', 'Task', 'Note'

  // Contenido
  subject: string;               // Requerido
  description?: string;          // Rich text / HTML

  // Timing
  dueDate?: Date;                // Para tasks y reuniones
  startDateTime?: Date;          // Para reuniones
  endDateTime?: Date;            // Para reuniones
  duration?: number;             // En minutos

  // Estado
  status: string;                // 'Planned', 'In Progress', 'Completed', 'Cancelled'
  priority?: string;             // 'High', 'Medium', 'Low'

  // Relaciones (al menos una requerida)
  contactId?: string;            // FK a Contact
  accountId?: string;            // FK a Account
  opportunityId?: string;        // FK a Opportunity

  // Ownership
  ownerId: string;               // FK a User (requerido)

  // Email específico
  emailTo?: string[];            // Para tipo 'Email'
  emailCc?: string[];
  emailBcc?: string[];
  emailAttachments?: string[];   // URLs

  // Call específico
  callDirection?: string;        // 'Inbound', 'Outbound'
  callResult?: string;           // 'Connected', 'Voicemail', 'No Answer'
  callNumber?: string;

  // Meeting específico
  meetingLocation?: string;      // Presencial o URL (Zoom, Meet)
  meetingAttendees?: string[];   // User IDs

  // Metadata
  isCompleted: boolean;          // Default: false
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;

  // Relaciones
  contact?: Contact;
  account?: Account;
  opportunity?: Opportunity;
  owner: User;
}
```

**Índices**:
- `activityType`
- `status`
- `ownerId`
- `contactId`
- `accountId`
- `opportunityId`
- `dueDate`
- `isCompleted`

---

### 10. Note (Notas)

Notas rápidas en registros.

```typescript
interface Note {
  id: string;                    // UUID
  content: string;               // Rich text / HTML

  // Relaciones (al menos una requerida)
  contactId?: string;
  accountId?: string;
  opportunityId?: string;

  // Ownership
  createdById: string;           // FK a User

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  contact?: Contact;
  account?: Account;
  opportunity?: Opportunity;
  createdBy: User;
}
```

---

### 11. Document (Documentos Adjuntos)

Archivos adjuntos a registros.

```typescript
interface Document {
  id: string;                    // UUID
  fileName: string;
  fileUrl: string;               // URL en S3 o storage
  fileSize: number;              // Bytes
  mimeType: string;              // 'application/pdf', 'image/png'

  // Metadata del documento
  title?: string;
  description?: string;

  // Relaciones (al menos una requerida)
  contactId?: string;
  accountId?: string;
  opportunityId?: string;

  // Ownership
  uploadedById: string;          // FK a User

  // Metadata
  uploadedAt: Date;

  // Relaciones
  contact?: Contact;
  account?: Account;
  opportunity?: Opportunity;
  uploadedBy: User;
}
```

---

### 12. Tag (Etiquetas)

Sistema de tags compartidos.

```typescript
interface Tag {
  id: string;                    // UUID
  name: string;                  // Único: 'VIP', 'Decision Maker'
  color?: string;                // HEX: '#0067B2'

  // Metadata
  usageCount: number;            // Cuántas veces se usa
  createdAt: Date;

  // Relaciones many-to-many
  contacts: Contact[];
  accounts: Account[];
  opportunities: Opportunity[];
}
```

---

### 13. Dashboard (Dashboards Personalizados)

Configuración de dashboards guardados.

```typescript
interface Dashboard {
  id: string;                    // UUID
  name: string;
  description?: string;

  // Layout configuration
  layoutJson: any;               // JSON: estructura del grid y widgets

  // Visibilidad
  isPublic: boolean;             // Default: false (personal)
  isDefault: boolean;            // Default dashboard del usuario

  // Ownership
  ownerId: string;               // FK a User

  // Shared with
  sharedWithUserIds?: string[];  // Si no es público
  sharedWithTeamIds?: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  owner: User;
}
```

**Ejemplo de layoutJson**:
```json
{
  "grid": {
    "cols": 12,
    "rows": "auto"
  },
  "widgets": [
    {
      "id": "widget-1",
      "type": "kpi-card",
      "position": { "x": 0, "y": 0, "w": 3, "h": 1 },
      "config": {
        "title": "Revenue MTD",
        "metric": "sum",
        "field": "opportunities.amount",
        "filter": { "closeDate": { "gte": "2026-01-01" } }
      }
    },
    {
      "id": "widget-2",
      "type": "pie-chart",
      "position": { "x": 3, "y": 0, "w": 6, "h": 2 },
      "config": {
        "title": "Pipeline by Stage",
        "dataSource": "opportunities",
        "groupBy": "stage",
        "valueField": "amount"
      }
    }
  ]
}
```

---

### 14. SavedView (Vistas Guardadas)

Configuración de filtros y columnas guardadas.

```typescript
interface SavedView {
  id: string;                    // UUID
  name: string;
  module: string;                // 'contacts', 'accounts', 'opportunities'

  // Configuración
  filtersJson: any;              // JSON: filtros aplicados
  columnsJson: any;              // JSON: columnas visibles y orden
  sortJson: any;                 // JSON: ordenamiento

  // Visibilidad
  isPublic: boolean;             // Default: false
  isSystem: boolean;             // Vistas predefinidas (no editables)

  // Ownership
  ownerId: string;               // FK a User

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  owner: User;
}
```

**Ejemplos de Views Predefinidas**:
- "My Contacts"
- "All Active Contacts"
- "Hot Opportunities"
- "Overdue Tasks"

---

### 15. AuditLog (Historial de Cambios)

Para tracking de cambios en registros importantes.

```typescript
interface AuditLog {
  id: string;                    // UUID

  // Qué se cambió
  entityType: string;            // 'Contact', 'Account', 'Opportunity'
  entityId: string;              // ID del registro

  // Cambio
  action: string;                // 'CREATE', 'UPDATE', 'DELETE', 'SHARE'
  field?: string;                // Campo modificado (si UPDATE)
  oldValue?: any;                // JSON del valor anterior
  newValue?: any;                // JSON del valor nuevo

  // Quién y cuándo
  userId: string;                // FK a User
  timestamp: Date;

  // Contexto
  ipAddress?: string;
  userAgent?: string;

  // Relaciones
  user: User;
}
```

**Índices**:
- Compound: `(entityType, entityId)`
- `userId`
- `timestamp` (DESC)

---

### 16. Notification (Notificaciones)

Sistema de notificaciones in-app.

```typescript
interface Notification {
  id: string;                    // UUID

  // Destinatario
  userId: string;                // FK a User (requerido)

  // Contenido
  type: string;                  // 'mention', 'assignment', 'activity_due', 'stage_change'
  title: string;
  message: string;

  // Link
  linkUrl?: string;              // URL interna al registro relacionado

  // Metadata
  isRead: boolean;               // Default: false
  readAt?: Date;
  createdAt: Date;

  // Relaciones
  user: User;
}
```

**Índices**:
- Compound: `(userId, isRead)`
- `createdAt` (DESC)

---

## Relaciones Detalladas

### Tipos de Relaciones

#### One-to-Many (1:N)

1. **User → Contact** (ownerId)
   - Un usuario posee muchos contactos
   - Un contacto pertenece a un usuario

2. **Account → Contact**
   - Una cuenta tiene muchos contactos
   - Un contacto pertenece a una cuenta (opcional)

3. **User → Opportunity** (ownerId)
   - Un usuario posee muchas oportunidades

4. **Account → Opportunity**
   - Una cuenta tiene muchas oportunidades
   - Una oportunidad pertenece a una cuenta

5. **Opportunity → Activity**
   - Una oportunidad tiene muchas actividades

6. **User → Activity** (ownerId)
   - Un usuario es dueño de muchas actividades

#### Self-Referencing

1. **Account → Account** (parent)
   - Jerarquía de cuentas (matriz → subsidiarias)

2. **User → User** (manager)
   - Jerarquía organizacional

#### Many-to-Many (N:M)

1. **Contact ↔ Tag** (via tabla intermedia ContactTag)
2. **Account ↔ Tag** (via tabla intermedia AccountTag)
3. **Opportunity ↔ Tag** (via tabla intermedia OpportunityTag)

---

## Prisma Schema Preview

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USER & AUTH ====================

model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  password             String
  firstName            String
  lastName             String
  phone                String?
  avatar               String?
  jobTitle             String?
  department           String?

  // Relations
  managerId            String?
  manager              User?     @relation("UserManager", fields: [managerId], references: [id])
  subordinates         User[]    @relation("UserManager")

  teamId               String?
  team                 Team?     @relation(fields: [teamId], references: [id])

  roleId               String
  role                 Role      @relation(fields: [roleId], references: [id])

  // Status
  isActive             Boolean   @default(true)

  // Config
  timezone             String    @default("America/Costa_Rica")
  locale               String    @default("es-CR")
  dateFormat           String    @default("DD/MM/YYYY")

  // Tokens
  refreshToken         String?
  resetPasswordToken   String?
  resetPasswordExpires DateTime?

  // Timestamps
  lastLoginAt          DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Ownership relations
  ownedContacts        Contact[]       @relation("ContactOwner")
  ownedAccounts        Account[]       @relation("AccountOwner")
  ownedOpportunities   Opportunity[]   @relation("OpportunityOwner")
  activities           Activity[]      @relation("ActivityOwner")
  notes                Note[]
  documents            Document[]
  dashboards           Dashboard[]
  savedViews           SavedView[]
  notifications        Notification[]
  auditLogs            AuditLog[]

  @@index([email])
  @@index([roleId])
  @@index([teamId])
  @@index([isActive])
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  permissions Json     // Array of { module: string, actions: string[] }
  isSystem    Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
}

model Team {
  id          String   @id @default(uuid())
  name        String
  description String?

  managerId   String?
  manager     User?    @relation("TeamManager", fields: [managerId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     User[]
}

// ==================== CRM ENTITIES ====================

model Contact {
  id              String    @id @default(uuid())
  firstName       String
  lastName        String
  email           String?
  phone           String?
  mobile          String?
  jobTitle        String?
  department      String?

  // Address
  street          String?
  city            String?
  state           String?
  postalCode      String?
  country         String?   @default("Costa Rica")

  // Social
  linkedinUrl     String?
  twitterHandle   String?

  // Marketing
  leadSource      String?
  tags            String[]
  score           Int?
  rating          String?

  // Relations
  accountId       String?
  account         Account?  @relation(fields: [accountId], references: [id])

  ownerId         String
  owner           User      @relation("ContactOwner", fields: [ownerId], references: [id])

  // Status
  isActive        Boolean   @default(true)

  // Timestamps
  lastContactedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdById     String
  updatedById     String?

  // Reverse relations
  opportunities   Opportunity[]
  activities      Activity[]
  notes           Note[]
  documents       Document[]

  @@index([email])
  @@index([accountId])
  @@index([ownerId])
  @@index([leadSource])
  @@index([isActive])
  @@index([createdAt(sort: Desc)])
}

model Account {
  id                 String    @id @default(uuid())
  name               String
  industry           String?
  accountType        String?
  website            String?
  employeeCount      Int?
  annualRevenue      Float?

  // Billing address
  billingStreet      String?
  billingCity        String?
  billingState       String?
  billingPostalCode  String?
  billingCountry     String?

  // Shipping address
  shippingStreet     String?
  shippingCity       String?
  shippingState      String?
  shippingPostalCode String?
  shippingCountry    String?

  // Contact
  phone              String?
  fax                String?

  // Hierarchy
  parentId           String?
  parent             Account?  @relation("AccountHierarchy", fields: [parentId], references: [id])
  children           Account[] @relation("AccountHierarchy")

  // Health
  healthScore        Int?

  // Relations
  ownerId            String
  owner              User      @relation("AccountOwner", fields: [ownerId], references: [id])

  // Status
  isActive           Boolean   @default(true)

  // Timestamps
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  createdById        String
  updatedById        String?

  // Reverse relations
  contacts           Contact[]
  opportunities      Opportunity[]
  activities         Activity[]
  notes              Note[]
  documents          Document[]

  @@index([name])
  @@index([industry])
  @@index([accountType])
  @@index([ownerId])
  @@index([parentId])
  @@index([isActive])
}

model Opportunity {
  id              String    @id @default(uuid())
  name            String
  amount          Float
  currency        String    @default("USD")

  // Pipeline
  stage           String
  probability     Int

  // Timing
  closeDate       DateTime
  actualCloseDate DateTime?

  // Type
  opportunityType String?
  leadSource      String?
  competitors     String[]

  // Content
  description     String?
  nextSteps       String?
  productsJson    Json?

  // Relations
  accountId       String
  account         Account   @relation(fields: [accountId], references: [id])

  contactId       String?
  contact         Contact?  @relation(fields: [contactId], references: [id])

  ownerId         String
  owner           User      @relation("OpportunityOwner", fields: [ownerId], references: [id])

  // Status
  isClosed        Boolean   @default(false)
  isWon           Boolean?
  lostReason      String?

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdById     String
  updatedById     String?

  // Reverse relations
  activities      Activity[]
  notes           Note[]
  documents       Document[]
  stageHistory    OpportunityStageHistory[]

  @@index([accountId])
  @@index([contactId])
  @@index([ownerId])
  @@index([stage])
  @@index([closeDate])
  @@index([isClosed])
  @@index([isWon])
}

model OpportunityStageHistory {
  id             String    @id @default(uuid())
  opportunityId  String
  opportunity    Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)

  fromStageId    String?
  toStageId      String

  changedAt      DateTime  @default(now())
  changedById    String

  @@index([opportunityId])
}

model Activity {
  id              String    @id @default(uuid())
  activityType    String    // 'Call', 'Email', 'Meeting', 'Task', 'Note'
  subject         String
  description     String?

  // Timing
  dueDate         DateTime?
  startDateTime   DateTime?
  endDateTime     DateTime?
  duration        Int?

  // Status
  status          String    // 'Planned', 'In Progress', 'Completed', 'Cancelled'
  priority        String?

  // Relations
  contactId       String?
  contact         Contact?  @relation(fields: [contactId], references: [id])

  accountId       String?
  account         Account?  @relation(fields: [accountId], references: [id])

  opportunityId   String?
  opportunity     Opportunity? @relation(fields: [opportunityId], references: [id])

  ownerId         String
  owner           User      @relation("ActivityOwner", fields: [ownerId], references: [id])

  // Email specific
  emailTo         String[]
  emailCc         String[]
  emailBcc        String[]
  emailAttachments String[]

  // Call specific
  callDirection   String?
  callResult      String?
  callNumber      String?

  // Meeting specific
  meetingLocation String?
  meetingAttendees String[]

  // Status
  isCompleted     Boolean   @default(false)
  completedAt     DateTime?

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdById     String

  @@index([activityType])
  @@index([status])
  @@index([ownerId])
  @@index([contactId])
  @@index([accountId])
  @@index([opportunityId])
  @@index([dueDate])
  @@index([isCompleted])
}

model Note {
  id            String    @id @default(uuid())
  content       String

  // Relations (at least one required)
  contactId     String?
  contact       Contact?  @relation(fields: [contactId], references: [id])

  accountId     String?
  account       Account?  @relation(fields: [accountId], references: [id])

  opportunityId String?
  opportunity   Opportunity? @relation(fields: [opportunityId], references: [id])

  // Ownership
  createdById   String
  createdBy     User      @relation(fields: [createdById], references: [id])

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([contactId])
  @@index([accountId])
  @@index([opportunityId])
}

model Document {
  id            String    @id @default(uuid())
  fileName      String
  fileUrl       String
  fileSize      Int
  mimeType      String
  title         String?
  description   String?

  // Relations (at least one required)
  contactId     String?
  contact       Contact?  @relation(fields: [contactId], references: [id])

  accountId     String?
  account       Account?  @relation(fields: [accountId], references: [id])

  opportunityId String?
  opportunity   Opportunity? @relation(fields: [opportunityId], references: [id])

  // Ownership
  uploadedById  String
  uploadedBy    User      @relation(fields: [uploadedById], references: [id])

  // Timestamps
  uploadedAt    DateTime  @default(now())

  @@index([contactId])
  @@index([accountId])
  @@index([opportunityId])
}

// ==================== DASHBOARDS & VIEWS ====================

model Dashboard {
  id                String   @id @default(uuid())
  name              String
  description       String?
  layoutJson        Json
  isPublic          Boolean  @default(false)
  isDefault         Boolean  @default(false)
  sharedWithUserIds String[]
  sharedWithTeamIds String[]

  ownerId           String
  owner             User     @relation(fields: [ownerId], references: [id])

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([ownerId])
}

model SavedView {
  id          String   @id @default(uuid())
  name        String
  module      String
  filtersJson Json
  columnsJson Json
  sortJson    Json
  isPublic    Boolean  @default(false)
  isSystem    Boolean  @default(false)

  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([module])
}

// ==================== AUDIT & NOTIFICATIONS ====================

model AuditLog {
  id         String   @id @default(uuid())
  entityType String
  entityId   String
  action     String
  field      String?
  oldValue   Json?
  newValue   Json?

  userId     String
  user       User     @relation(fields: [userId], references: [id])

  timestamp  DateTime @default(now())
  ipAddress  String?
  userAgent  String?

  @@index([entityType, entityId])
  @@index([userId])
  @@index([timestamp(sort: Desc)])
}

model Notification {
  id       String   @id @default(uuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id])

  type     String
  title    String
  message  String
  linkUrl  String?

  isRead   Boolean  @default(false)
  readAt   DateTime?
  createdAt DateTime @default(now())

  @@index([userId, isRead])
  @@index([createdAt(sort: Desc)])
}
```

---

## Índices y Performance

### Índices Críticos

**Para búsquedas frecuentes**:
- `Contact.email`
- `User.email`
- `Account.name`
- `Opportunity.closeDate`

**Para ownership queries**:
- `Contact.ownerId`
- `Account.ownerId`
- `Opportunity.ownerId`

**Para timeline queries**:
- `Activity.(contactId, accountId, opportunityId)`
- Compound: `(Activity.ownerId, Activity.dueDate)`

**Para analytics**:
- `Opportunity.(stage, isClosed, isWon)`
- Compound: `(Opportunity.ownerId, Opportunity.closeDate)`

### Partitioning (Fase 2)

Para tablas que crecen rápidamente:
- `Activity` por fecha (mensual)
- `AuditLog` por fecha (trimestral)
- `Notification` por fecha (mensual)

---

## Data Seeding

Seeds iniciales para desarrollo:

1. **Roles**: 6 roles predefinidos
2. **Users**: 10 usuarios de prueba (1 admin, 2 managers, 7 reps)
3. **Teams**: 3 equipos
4. **OpportunityStages**: 7 etapas
5. **Accounts**: 50 cuentas ficticias
6. **Contacts**: 200 contactos ficticios
7. **Opportunities**: 100 oportunidades en varios stages
8. **Activities**: 500 actividades variadas
9. **Tags**: 20 tags comunes

---

## Validaciones a Nivel de Base de Datos

### Check Constraints

```sql
-- Opportunity probability entre 0 y 100
ALTER TABLE "Opportunity" ADD CONSTRAINT "probability_check"
CHECK ("probability" >= 0 AND "probability" <= 100);

-- Contact score entre 0 y 100
ALTER TABLE "Contact" ADD CONSTRAINT "score_check"
CHECK ("score" >= 0 AND "score" <= 100 OR "score" IS NULL);

-- Account healthScore entre 0 y 100
ALTER TABLE "Account" ADD CONSTRAINT "healthScore_check"
CHECK ("healthScore" >= 0 AND "healthScore" <= 100 OR "healthScore" IS NULL);
```

---

**Última actualización**: 2026-01-15
**Versión**: 0.1.0
