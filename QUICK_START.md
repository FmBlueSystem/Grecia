# 🚀 STIA CRM - Quick Start Guide

## ✅ Lo que está Configurado

- ✅ Frontend: React + TypeScript + Vite + Tailwind CSS
- ✅ Backend: Fastify + TypeScript + Prisma
- ✅ Base de Datos: PostgreSQL (Docker)
- ✅ Cache: Redis (Docker)
- ✅ Modelo de Datos: 7 entidades core (User, Role, Team, Contact, Account, Opportunity, Activity)

---

## 📋 Requisitos Previos

- Node.js 20+ LTS
- Docker Desktop (para PostgreSQL y Redis)
- npm o yarn

---

## 🏃 Pasos para Ejecutar

### 1. Iniciar Base de Datos (Docker)

```bash
# En el directorio raíz del proyecto
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker ps
```

Deberías ver:
- `stia-crm-postgres` en puerto 5432
- `stia-crm-redis` en puerto 6379

---

### 2. Configurar Backend

```bash
# Ir al directorio backend
cd backend

# Generar el cliente de Prisma
npx prisma generate

# Crear la base de datos y ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Abrir Prisma Studio para ver la DB
npx prisma studio
```

---

### 3. Iniciar Backend

```bash
# Desde /backend
npm run dev
```

El backend estará en: **http://localhost:3000**

---

### 4. Iniciar Frontend

```bash
# Desde el directorio raíz, abrir una nueva terminal
cd frontend

# Instalar dependencias si aún no lo has hecho
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en: **http://localhost:5173**

---

## 🔧 Comandos Útiles

### Docker

```bash
# Iniciar contenedores
docker-compose up -d

# Detener contenedores
docker-compose down

# Ver logs
docker-compose logs -f

# Detener y eliminar volúmenes (¡CUIDADO! Borra los datos)
docker-compose down -v
```

### Prisma

```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos
npx prisma migrate reset

# Abrir Prisma Studio (GUI)
npx prisma studio
```

### Backend

```bash
# Desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 📁 Estructura del Proyecto

```
Grecia/
├── frontend/              # React App
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # Fastify API
│   ├── src/               # (próximamente)
│   ├── prisma/
│   │   └── schema.prisma  # Modelo de datos
│   ├── package.json
│   └── .env
│
├── docker-compose.yml     # PostgreSQL + Redis
├── docs/                  # Documentación completa
├── design-system/         # Design System de STIA
└── planning/              # Plan de trabajo
```

---

## 🗄️ Base de Datos

### Conectarse a PostgreSQL

```bash
# Con psql
psql -h localhost -p 5432 -U stia_crm -d stia_crm

# Password: dev_password_change_in_production
```

### Conectarse a Redis

```bash
# Con redis-cli
redis-cli -h localhost -p 6379
```

---

## 🐛 Troubleshooting

### Error: Puerto 5432 ya en uso

```bash
# Detener PostgreSQL local
brew services stop postgresql
# O
sudo systemctl stop postgresql
```

### Error: Cannot connect to Docker

```bash
# Verificar que Docker Desktop esté corriendo
docker ps

# Si no responde, reiniciar Docker Desktop
```

### Error: Prisma client not generated

```bash
cd backend
npx prisma generate
```

---

## 📝 Próximos Pasos

1. ✅ **Base configurada** - Ya está todo listo
2. ⏳ **Crear seed data** - Usuarios, roles, datos de prueba
3. ⏳ **Implementar autenticación** - JWT login/logout
4. ⏳ **Crear API endpoints** - CRUD para entidades
5. ⏳ **Desarrollar UI** - Login, Dashboard, módulos

---

## 🆘 Ayuda

Si algo no funciona:

1. Verifica que Docker esté corriendo: `docker ps`
2. Verifica las migraciones: `cd backend && npx prisma migrate status`
3. Revisa los logs: `docker-compose logs -f postgres`
4. Verifica las variables de entorno en `backend/.env`

---

**Última actualización**: 2026-01-16
**Estado**: ✅ Ready to code!
