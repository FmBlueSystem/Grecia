# Configuracion Cron - Escalamiento Automatico

## 1. Variables de entorno

Agregar al `.env.production` en `/data/casos/.env.production`:

```bash
# Generar secreto unico:
openssl rand -hex 32

# Agregar al .env.production:
CRON_SECRET=<valor-generado>

# WhatsApp (opcional - solo si notify_whatsapp esta habilitado)
WHATSAPP_API_URL=https://your-provider.com/api/send
WHATSAPP_API_TOKEN=<token-del-proveedor>
```

Reiniciar la app despues de agregar variables:
```bash
cd /data/casos && pm2 restart casos-stia
```

## 2. Instalar script

```bash
sudo mkdir -p /opt/stia
sudo cp scripts/check-escalation.sh /opt/stia/
sudo chmod +x /opt/stia/check-escalation.sh

# Crear log file con permisos
sudo touch /var/log/stia-escalation.log
sudo chown $(whoami) /var/log/stia-escalation.log
```

## 3. Configurar crontab

Opcion A — Variables inline en crontab (recomendado):

```bash
crontab -e
```

Agregar:
```cron
# STIA - Escalamiento automatico cada 5 minutos
CRON_SECRET=<mismo-valor-del-env>
APP_URL=https://casos.stia.net
ALERT_EMAIL=admin@stia.net

*/5 * * * * /opt/stia/check-escalation.sh >> /var/log/stia-escalation.log 2>&1
```

Opcion B — Cargar desde archivo de entorno:

```bash
# Crear archivo de variables del cron
sudo tee /etc/stia-cron.env << 'EOF'
CRON_SECRET=<valor>
APP_URL=https://casos.stia.net
ALERT_EMAIL=admin@stia.net
ALERT_WEBHOOK=
EOF
sudo chmod 600 /etc/stia-cron.env
```

Crontab:
```cron
*/5 * * * * . /etc/stia-cron.env && /opt/stia/check-escalation.sh
```

## 4. Verificar

```bash
# Test manual del script
CRON_SECRET=<valor> /opt/stia/check-escalation.sh && echo "OK" || echo "FALLO"

# Ver logs
tail -f /var/log/stia-escalation.log

# Verificar que el cron esta registrado
crontab -l | grep stia

# Ver ultimo resultado
tail -1 /var/log/stia-escalation.log
```

## 5. Logrotate (opcional pero recomendado)

```bash
sudo tee /etc/logrotate.d/stia-escalation << 'EOF'
/var/log/stia-escalation.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF
```

## Endpoint protegido

El endpoint `POST /api/escalation/check` acepta dos tipos de auth:
- **Cron:** Header `Authorization: Bearer <CRON_SECRET>`
- **Admin:** Session cookie de usuario con role=admin

Response exitoso:
```json
{
  "processed": 15,
  "escalated": { "level1": 3, "level2": 1, "level3": 0 },
  "errors": []
}
```
