# Conexion AWS - Portal STIA

## Servidor
- **IP:** 3.212.155.164
- **Cloud:** AWS EC2 (us-east-1)
- **OS:** Ubuntu 24.04.3 LTS
- **SSH:** `ssh -i "KP-STIA.pem" ubuntu@3.212.155.164`

## Acceso Rapido

```bash
# Desde esta carpeta:
./conectar.sh              # SSH al servidor
./conectar.sh status       # Ver procesos PM2
./conectar.sh logs-v2      # Logs SvelteKit
./conectar.sh logs-legacy  # Logs Express
./conectar.sh deploy-v2    # Build + restart SvelteKit
./conectar.sh db           # Conectar PostgreSQL
```

## Servicios en el Servidor

| Servicio | Puerto | PM2 ID | Ruta |
|----------|--------|--------|------|
| Portal Legacy (Express) | 3000 | 3 | /data/portal |
| Portal SvelteKit v2 | 3001 | 5 | /data/portal-sveltekit |
| PostgreSQL | 5432 | - | DB: stia_portal_clientes |
| Nginx (SSL) | 443 | - | Reverse proxy |

## URLs

- Legacy: https://3.212.155.164/
- SvelteKit v2: https://3.212.155.164/v2/
- Login v2: https://3.212.155.164/v2/login

## Base de Datos

```bash
PGPASSWORD=jI0ruuKrOdoE6cT0HRL82lBFdlh0pLjF psql -U postgres -h localhost -d stia_portal_clientes
```

## Credenciales de Prueba

| Usuario | Password |
|---------|----------|
| fmolinam | Stia2026! |

## Si No Puedes Conectar

1. **Cambio de IP/red:** AWS Console > EC2 > Security Groups > editar Inbound Rules > actualizar tu IP para SSH (puerto 22)
2. Verificar: `ping 3.212.155.164`
3. Verificar llave: `ls -la KP-STIA.pem` (debe ser `-r--------`)
4. Fix permisos: `chmod 400 KP-STIA.pem`

## Stack del Proyecto

| Capa | Tecnologia |
|------|-----------|
| Runtime | Node.js 22 |
| Frontend v2 | SvelteKit + Svelte 5 + Tailwind v4 |
| Backend Legacy | Express 4 |
| DB | PostgreSQL 16 |
| SAP | Service Layer (skyinone.net:50000) |
| Auth | JWT + cookies HttpOnly |
