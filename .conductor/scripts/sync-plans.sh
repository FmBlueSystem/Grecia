#!/bin/bash

# Script de Verificación de Sincronización de Planes Conductor
# Este script ayuda a verificar que los planes están sincronizados con el código

set -e

echo "🔍 Verificación de Sincronización Conductor"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Función para verificar existencia de archivo
check_file() {
    local file=$1
    local description=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description: $file"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description: $file (FALTANTE)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Función para verificar directorio
check_dir() {
    local dir=$1
    local description=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description: $dir"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description: $dir (FALTANTE)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Verificar estructura Conductor
echo "📁 Verificando Estructura Conductor..."
check_file ".conductor/product.md" "Product Vision"
check_file ".conductor/tech-stack.md" "Tech Stack"
check_file ".conductor/product-guidelines.md" "Guidelines"
check_file ".conductor/workflow.md" "Workflow"
check_file ".conductor/tracks.md" "Tracks Registry"
check_file ".conductor/CONDUCTOR_METHODOLOGY.md" "Methodology Doc"
echo ""

# Verificar tracks
echo "🛤️  Verificando Tracks..."
for track_dir in .conductor/tracks/*/; do
    if [ -d "$track_dir" ]; then
        track_name=$(basename "$track_dir")
        echo "  Track: $track_name"
        check_file "${track_dir}spec.md" "  └─ Spec"
        check_file "${track_dir}plan.md" "  └─ Plan"
    fi
done
echo ""

# Verificar archivos de entorno
echo "🔐 Verificando Archivos de Entorno..."
check_file "backend/.env.example" "Backend .env.example"
check_file "frontend/.env.example" "Frontend .env.example"
echo ""

# Verificar estructura de código backend
echo "⚙️  Verificando Backend..."
check_dir "backend/src" "Backend Source"
check_dir "backend/src/routes" "Backend Routes"
check_file "backend/src/index.ts" "Backend Entry Point"
check_file "backend/package.json" "Backend Package"
check_file "backend/tsconfig.json" "Backend TypeScript Config"
echo ""

# Verificar estructura de código frontend
echo "🎨 Verificando Frontend..."
check_dir "frontend/src" "Frontend Source"
check_dir "frontend/src/components" "Frontend Components"
check_dir "frontend/src/pages" "Frontend Pages"
check_file "frontend/src/main.tsx" "Frontend Entry Point"
check_file "frontend/package.json" "Frontend Package"
check_file "frontend/tsconfig.json" "Frontend TypeScript Config"
echo ""

# Verificar rutas backend implementadas
echo "🔌 Verificando APIs Backend..."
BACKEND_ROUTES=(
    "backend/src/routes/auth.routes.ts:Auth"
    "backend/src/routes/contacts.routes.ts:Contacts"
    "backend/src/routes/accounts.routes.ts:Accounts"
    "backend/src/routes/opportunities.routes.ts:Opportunities"
    "backend/src/routes/activities.routes.ts:Activities"
    "backend/src/routes/leads.routes.ts:Leads"
    "backend/src/routes/dashboard.routes.ts:Dashboard"
)

for route_info in "${BACKEND_ROUTES[@]}"; do
    IFS=':' read -r route_file route_name <<< "$route_info"
    check_file "$route_file" "  └─ $route_name API"
done
echo ""

# Verificar páginas frontend implementadas
echo "📱 Verificando Páginas Frontend..."
FRONTEND_PAGES=(
    "frontend/src/pages/Login.tsx:Login"
    "frontend/src/pages/Dashboard.tsx:Dashboard"
    "frontend/src/pages/Contacts.tsx:Contacts"
    "frontend/src/pages/Accounts.tsx:Accounts"
    "frontend/src/pages/Pipeline.tsx:Pipeline"
)

for page_info in "${FRONTEND_PAGES[@]}"; do
    IFS=':' read -r page_file page_name <<< "$page_info"
    check_file "$page_file" "  └─ $page_name Page"
done
echo ""

# Resumen
echo "=========================================="
echo "📊 Resumen de Verificación"
echo "=========================================="
echo "Total de verificaciones: $TOTAL_CHECKS"
echo -e "${GREEN}Pasadas: $PASSED_CHECKS${NC}"
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}Fallidas: $FAILED_CHECKS${NC}"
fi
echo ""

# Calcular porcentaje
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}✅ Proyecto 100% sincronizado con Conductor${NC}"
    exit 0
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Proyecto ${PERCENTAGE}% sincronizado - Algunas mejoras necesarias${NC}"
    exit 0
else
    echo -e "${RED}❌ Proyecto ${PERCENTAGE}% sincronizado - Requiere atención${NC}"
    exit 1
fi
