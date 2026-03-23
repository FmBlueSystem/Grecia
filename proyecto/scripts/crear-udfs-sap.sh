#!/bin/bash
# =============================================================================
# crear-udfs-sap.sh
# Crea los UDFs de OSCL en SAP B1 para los 5 países de STIA
# Sprint S3 (U_SubEstado) + Sprint S6 (U_IME_*)
#
# Uso:
#   ./scripts/crear-udfs-sap.sh
#   ./scripts/crear-udfs-sap.sh --pais CR       (solo un país)
#   ./scripts/crear-udfs-sap.sh --dry-run        (muestra sin ejecutar)
#
# Requiere: curl
# =============================================================================

SAP_URL="https://sap-stiacmzdr-sl.skyinone.net:50000"
SAP_USER="Consultas"
SAP_PASS='Stia123*'
DRY_RUN=false
PAIS_FILTER=""

# Parsear args
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --pais)    PAIS_FILTER="$2"; shift 2 ;;
    *) echo "Arg desconocido: $1"; exit 1 ;;
  esac
done

# Países y sus DBs (separados por |)
PAISES_KEYS=(CR SV GT HN PA)
declare -A PAISES
PAISES["CR"]="SBO_STIACR_PROD"
PAISES["SV"]="SBO_SV_STIA_FINAL"
PAISES["GT"]="SBO_GT_STIA_PROD"
PAISES["HN"]="SBO_HO_STIA_PROD"
PAISES["PA"]="SBO_PA_STIA_PROD"

# ---------------------------------------------------------------------------
# Definición de UDFs a crear en OSCL
# Formato: "Nombre|Tipo|Largo|Descripcion"
# Tipos: db_Alpha, db_Memo, db_Float, db_Date
# ---------------------------------------------------------------------------
UDFS=(
  "SubEstado|db_Alpha|50|Sub-Estado del caso"
  "PortalUser|db_Alpha|100|ID usuario portal asignado (no-tecnico SAP)"
  "IME_Producto|db_Alpha|100|F069: Nombre del producto"
  "IME_CodMaterial|db_Alpha|50|F069: Codigo de material SAP"
  "IME_Lote|db_Alpha|50|F069: Numero de lote"
  "IME_Factura|db_Alpha|50|F069: Numero de factura"
  "IME_CantInicial|db_Float|0|F069: Cantidad inicial"
  "IME_CantReclamo|db_Float|0|F069: Cantidad reclamada"
  "IME_ReportadoPor|db_Alpha|100|F069: Reportado por"
  "IME_CnsecSGI|db_Alpha|20|F069 Calidad: Consecutivo SGI"
  "IME_CausaReclamo|db_Memo|0|F069 Calidad: Causa del reclamo"
  "IME_PlanAccion|db_Memo|0|F069 Calidad: Plan de accion"
  "IME_AccionCorrectiva|db_Memo|0|F069 Calidad: Accion correctiva"
  "IME_GestionadoPor|db_Alpha|100|F069 Calidad: Gestionado por"
  "IME_VerificadoPor|db_Alpha|100|F069 Calidad: Verificado por"
  "IME_FechaVerif|db_Date|0|F069 Calidad: Fecha de verificacion"
  "IME_Retroalim|db_Memo|0|F069 Calidad: Retroalimentacion"
  "IME_VentasResp|db_Alpha|100|F069 Calidad: Resp. ventas"
)

TOTAL_OK=0
TOTAL_SKIP=0
TOTAL_ERR=0

# ---------------------------------------------------------------------------
# Extraer valor de campo JSON simple (sin jq)
json_get() {
  local json="$1"
  local key="$2"
  echo "$json" | grep -oP "\"${key}\"\\s*:\\s*\"\\K[^\"]*" | head -1
}

# ---------------------------------------------------------------------------
create_udf() {
  local SESSION="$1"
  local UDF_LINE="$2"

  IFS='|' read -r NAME TYPE SIZE DESC <<< "$UDF_LINE"

  # Construir JSON según tipo
  local BODY
  if [[ "$TYPE" == "db_Alpha" ]]; then
    BODY="{\"Name\":\"${NAME}\",\"TableName\":\"OSCL\",\"Type\":\"${TYPE}\",\"EditSize\":${SIZE},\"Description\":\"${DESC}\"}"
  else
    BODY="{\"Name\":\"${NAME}\",\"TableName\":\"OSCL\",\"Type\":\"${TYPE}\",\"Description\":\"${DESC}\"}"
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    printf "  [DRY-RUN] %-25s  %s\n" "U_${NAME}" "$TYPE"
    return 0
  fi

  # Llamar API
  local TMPFILE
  TMPFILE=$(mktemp)
  local HTTP_CODE
  HTTP_CODE=$(curl -sk \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: B1SESSION=${SESSION}" \
    -d "$BODY" \
    -o "$TMPFILE" \
    -w "%{http_code}" \
    "${SAP_URL}/b1s/v1/UserFieldsMD")
  local RESPONSE
  RESPONSE=$(cat "$TMPFILE")
  rm -f "$TMPFILE"

  if [[ "$HTTP_CODE" == "201" ]]; then
    printf "    ✅ U_%-25s creado\n" "${NAME}"
    ((TOTAL_OK++))
  else
    # Detectar "ya existe" por mensaje de error
    if echo "$RESPONSE" | grep -qi "already exist\|ya existe\|duplicate\|\-1\]"; then
      printf "    ⏭️  U_%-25s ya existe (skip)\n" "${NAME}"
      ((TOTAL_SKIP++))
    else
      local ERR
      ERR=$(echo "$RESPONSE" | grep -oP '"value"\s*:\s*"\K[^"]*' | head -1)
      printf "    ❌ U_%-25s ERROR %s: %s\n" "${NAME}" "$HTTP_CODE" "$ERR"
      ((TOTAL_ERR++))
    fi
  fi
}

# ---------------------------------------------------------------------------
process_country() {
  local CODE="$1"
  local DB="${PAISES[$CODE]}"

  echo ""
  echo "════════════════════════════════════════"
  printf "  País: %-5s — DB: %s\n" "$CODE" "$DB"
  echo "════════════════════════════════════════"

  if [[ "$DRY_RUN" == "true" ]]; then
    printf "  [DRY-RUN] Login en %s\n" "$DB"
    for UDF in "${UDFS[@]}"; do
      create_udf "" "$UDF"
    done
    return
  fi

  # Login
  printf "  → Iniciando sesión en %s...\n" "$DB"
  local TMPFILE
  TMPFILE=$(mktemp)
  local HTTP_CODE
  HTTP_CODE=$(curl -sk \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"CompanyDB\":\"${DB}\",\"UserName\":\"${SAP_USER}\",\"Password\":\"${SAP_PASS}\"}" \
    -o "$TMPFILE" \
    -w "%{http_code}" \
    "${SAP_URL}/b1s/v1/Login")
  local LOGIN_RESP
  LOGIN_RESP=$(cat "$TMPFILE")
  rm -f "$TMPFILE"

  if [[ "$HTTP_CODE" != "200" ]]; then
    local ERR
    ERR=$(echo "$LOGIN_RESP" | grep -oP '"value"\s*:\s*"\K[^"]*' | head -1)
    printf "  ❌ Login fallido (HTTP %s): %s\n" "$HTTP_CODE" "$ERR"
    return 1
  fi

  local SESSION
  SESSION=$(echo "$LOGIN_RESP" | grep -oP '"SessionId"\s*:\s*"\K[^"]*' | head -1)

  if [[ -z "$SESSION" ]]; then
    echo "  ❌ No se pudo obtener SessionId"
    return 1
  fi

  printf "  ✅ Sesión: %s...\n" "${SESSION:0:8}"

  # Crear UDFs
  for UDF in "${UDFS[@]}"; do
    create_udf "$SESSION" "$UDF"
  done

  # Logout
  curl -sk -X POST \
    -H "Cookie: B1SESSION=${SESSION}" \
    "${SAP_URL}/b1s/v1/Logout" > /dev/null
  echo "  → Logout OK"
}

# ---------------------------------------------------------------------------
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Crear UDFs OSCL — STIA 5 Países           ║"
echo "╚══════════════════════════════════════════════╝"
printf "  URL SAP:      %s\n" "$SAP_URL"
printf "  UDFs a crear: %d por país\n" "${#UDFS[@]}"
[[ "$DRY_RUN" == "true" ]] && echo "  MODO: DRY-RUN (sin cambios reales)"
[[ -n "$PAIS_FILTER" ]] && printf "  Filtro:       solo %s\n" "$PAIS_FILTER"

if [[ -n "$PAIS_FILTER" ]]; then
  if [[ -z "${PAISES[$PAIS_FILTER]}" ]]; then
    printf "Error: país '%s' no reconocido. Opciones: CR SV GT HN PA\n" "$PAIS_FILTER"
    exit 1
  fi
  process_country "$PAIS_FILTER"
else
  for CODE in "${PAISES_KEYS[@]}"; do
    process_country "$CODE"
  done
fi

echo ""
echo "════════════════════════════════════════"
echo "  RESUMEN"
printf "  ✅ Creados:      %d\n" "$TOTAL_OK"
printf "  ⏭️  Ya existían:  %d\n" "$TOTAL_SKIP"
printf "  ❌ Errores:      %d\n" "$TOTAL_ERR"
echo "════════════════════════════════════════"
