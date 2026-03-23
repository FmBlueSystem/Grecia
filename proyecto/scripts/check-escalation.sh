#!/usr/bin/env bash
# =============================================================
# check-escalation.sh
# Invoca el endpoint de escalamiento y reporta fallos.
# Uso: colocar en /opt/stia/ y ejecutar via crontab cada 5 min.
# =============================================================

set -euo pipefail

# --- Configuracion ---
APP_URL="${APP_URL:-https://casos.stia.net}"
CRON_SECRET="${CRON_SECRET:?Variable CRON_SECRET no definida}"
LOG_FILE="${LOG_FILE:-/var/log/stia-escalation.log}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@stia.net}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"

ENDPOINT="${APP_URL}/api/escalation/check"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# --- Ejecutar ---
HTTP_CODE=$(curl -s -o /tmp/stia-esc-response.json -w '%{http_code}' \
  -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  --connect-timeout 10 \
  --max-time 30 \
  2>/dev/null || echo "000")

BODY=$(cat /tmp/stia-esc-response.json 2>/dev/null || echo "{}")

# --- Log ---
echo "[$TIMESTAMP] HTTP=$HTTP_CODE response=$BODY" >> "$LOG_FILE"

# --- Alerta si fallo ---
if [ "$HTTP_CODE" != "200" ]; then
  MSG="[STIA Escalation FAIL] $TIMESTAMP - HTTP $HTTP_CODE - $ENDPOINT"

  # Intentar enviar por email (mailx)
  if command -v mailx &>/dev/null && [ -n "$ALERT_EMAIL" ]; then
    echo "$MSG" | mailx -s "STIA Escalation Error HTTP $HTTP_CODE" "$ALERT_EMAIL" 2>/dev/null || true
  fi

  # Intentar enviar por webhook (Slack/Teams/etc)
  if [ -n "$ALERT_WEBHOOK" ]; then
    curl -s -X POST "$ALERT_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"$MSG\"}" \
      --connect-timeout 5 --max-time 10 2>/dev/null || true
  fi

  echo "[$TIMESTAMP] ALERTA ENVIADA: HTTP $HTTP_CODE" >> "$LOG_FILE"
  exit 1
fi

exit 0
