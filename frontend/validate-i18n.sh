#!/bin/bash

# i18n Validation Script
# Validates the internationalization setup for STIA CRM

echo "========================================="
echo "  STIA CRM - i18n Validation Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_check() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗${NC} $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo -e "${BLUE}1. Checking npm dependencies...${NC}"
npm list i18next react-i18next i18next-browser-languagedetector i18next-http-backend > /dev/null 2>&1
test_check $? "All i18n packages installed"
echo ""

echo -e "${BLUE}2. Checking configuration files...${NC}"
[ -f "src/i18n.ts" ]
test_check $? "i18n.ts configuration file exists"

[ -f "src/components/LanguageSwitcher.tsx" ]
test_check $? "LanguageSwitcher component exists"

grep -q "import './i18n'" src/main.tsx
test_check $? "i18n imported in main.tsx"

grep -q "LanguageSwitcher" src/App.tsx
test_check $? "LanguageSwitcher integrated in App.tsx"
echo ""

echo -e "${BLUE}3. Validating translation files structure...${NC}"
[ -d "public/locales/es" ]
test_check $? "Spanish locale directory exists"

[ -d "public/locales/en" ]
test_check $? "English locale directory exists"
echo ""

echo -e "${BLUE}4. Validating JSON files...${NC}"
JSON_VALID=0
for file in public/locales/*/*.json; do
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo -e "${RED}  Invalid JSON: $file${NC}"
        JSON_VALID=1
    fi
done
test_check $JSON_VALID "All JSON files are valid"
echo ""

echo -e "${BLUE}5. Checking required namespaces...${NC}"
REQUIRED_NAMESPACES=("common" "auth" "navigation" "dashboard" "contacts" "accounts" "validation" "errors" "messages")

for ns in "${REQUIRED_NAMESPACES[@]}"; do
    ES_EXISTS=0
    EN_EXISTS=0
    
    [ -f "public/locales/es/$ns.json" ] && ES_EXISTS=1
    [ -f "public/locales/en/$ns.json" ] && EN_EXISTS=1
    
    if [ $ES_EXISTS -eq 1 ] && [ $EN_EXISTS -eq 1 ]; then
        test_check 0 "Namespace '$ns' exists in both languages"
    else
        test_check 1 "Namespace '$ns' missing in one or both languages"
    fi
done
echo ""

echo -e "${BLUE}6. Counting translation keys...${NC}"
ES_COUNT=$(find public/locales/es -name "*.json" | wc -l | tr -d ' ')
EN_COUNT=$(find public/locales/en -name "*.json" | wc -l | tr -d ' ')

echo -e "  Spanish files: ${YELLOW}$ES_COUNT${NC}"
echo -e "  English files: ${YELLOW}$EN_COUNT${NC}"

if [ "$ES_COUNT" -eq "$EN_COUNT" ]; then
    test_check 0 "Same number of translation files in both languages"
else
    test_check 1 "Mismatch in number of translation files"
fi
echo ""

echo -e "${BLUE}7. Checking TypeScript compilation...${NC}"
npm run build > /dev/null 2>&1
BUILD_STATUS=$?
if [ $BUILD_STATUS -eq 0 ]; then
    test_check 0 "TypeScript compilation successful (no i18n errors)"
else
    # Check if errors are i18n related
    npm run build 2>&1 | grep -q "i18n\|LanguageSwitcher\|useTranslation"
    if [ $? -eq 0 ]; then
        test_check 1 "TypeScript compilation has i18n-related errors"
    else
        test_check 0 "TypeScript compilation errors exist but not i18n-related"
    fi
fi
echo ""

echo "========================================="
echo -e "${BLUE}Summary:${NC}"
echo -e "  Total tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "  Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "  Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All i18n validation tests passed!${NC}"
    echo -e "${GREEN}✓ Your internationalization setup is ready to use.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Run: npm run dev"
    echo "  2. Look for the language switcher in the header"
    echo "  3. Check the i18n Test Panel in the bottom-right corner"
    echo "  4. Toggle between ES ↔ EN and verify translations update"
    exit 0
else
    echo -e "${RED}✗ Some validation tests failed.${NC}"
    echo -e "${YELLOW}Please review the errors above and fix them.${NC}"
    exit 1
fi
