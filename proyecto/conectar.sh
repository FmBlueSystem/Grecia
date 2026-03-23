#!/bin/bash
# Portal STIA - Conexion AWS
# Servidor: 3.212.155.164 (EC2 us-east-1)

PEM="$(dirname "$0")/KP-STIA.pem"
HOST="ubuntu@3.212.155.164"

case "${1:-shell}" in
  shell)
    echo "Conectando a servidor STIA..."
    ssh -i "$PEM" "$HOST"
    ;;
  logs-legacy)
    ssh -i "$PEM" "$HOST" "pm2 logs portal-stia --lines 50"
    ;;
  logs-v2)
    ssh -i "$PEM" "$HOST" "pm2 logs portal-sveltekit --lines 50"
    ;;
  status)
    ssh -i "$PEM" "$HOST" "pm2 list"
    ;;
  deploy-v2)
    ssh -i "$PEM" "$HOST" "cd /data/portal-sveltekit && npm run build && pm2 restart portal-sveltekit"
    ;;
  db)
    ssh -i "$PEM" "$HOST" "PGPASSWORD=jI0ruuKrOdoE6cT0HRL82lBFdlh0pLjF psql -U postgres -h localhost -d stia_portal_clientes"
    ;;
  upload)
    # Uso: ./conectar.sh upload archivo.js /data/portal-sveltekit/src/
    scp -i "$PEM" "$2" "$HOST:$3"
    ;;
  *)
    echo "Uso: ./conectar.sh [comando]"
    echo ""
    echo "Comandos:"
    echo "  shell        - SSH al servidor (default)"
    echo "  status       - Ver procesos PM2"
    echo "  logs-legacy  - Logs del portal Express (puerto 3000)"
    echo "  logs-v2      - Logs del portal SvelteKit (puerto 3001)"
    echo "  deploy-v2    - Build y restart SvelteKit"
    echo "  db           - Conectar a PostgreSQL"
    echo "  upload F D   - Subir archivo F a directorio D"
    ;;
esac
