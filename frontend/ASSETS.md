# Assets Generados - STIA CRM

## 📦 Favicons y Logos

Este proyecto incluye un conjunto completo de favicons y logos para diferentes plataformas y casos de uso.

### Archivos Generados

```
public/
├── favicon.ico              # Favicon tradicional (32x32)
├── favicon.svg              # Favicon SVG moderno
├── favicon-16x16.png        # Favicon pequeño
├── favicon-32x32.png        # Favicon estándar
├── apple-touch-icon.png     # iOS home screen icon (180x180)
├── logo-192.png             # PWA icon pequeño
├── logo-512.png             # PWA icon grande
├── android-chrome-192x192.png  # Android Chrome pequeño
├── android-chrome-512x512.png  # Android Chrome grande
├── logo.svg                 # Logo principal en SVG
├── manifest.json            # Web App Manifest
├── robots.txt               # SEO: robots file
└── sitemap.xml              # SEO: sitemap
```

## 🎨 Diseño del Logo

El logo de STIA utiliza:
- **Gradiente**: Indigo (#4F46E5) a Púrpura (#7C3AED)
- **Letra**: "S" en blanco, bold, centrada
- **Acento**: Círculo amarillo (#FBBF24) en la esquina superior derecha
- **Estilo**: Moderno, limpio, profesional

## 🔄 Regenerar Assets

Si necesitas regenerar los favicons y logos:

```bash
npm run generate-icons
```

Este comando ejecuta el script `scripts/generate-favicons.ts` que utiliza Sharp para generar todas las variantes necesarias desde SVG.

## 📱 Soporte de Plataformas

### Navegadores Web
- ✅ Chrome/Edge (favicon.ico, favicon.svg)
- ✅ Firefox (favicon.ico, favicon.svg)
- ✅ Safari (favicon.ico, apple-touch-icon.png)

### Dispositivos Móviles
- ✅ iOS (apple-touch-icon.png)
- ✅ Android (android-chrome-*.png)

### PWA (Progressive Web App)
- ✅ Manifest completo con iconos 192x192 y 512x512
- ✅ Theme color: #4F46E5
- ✅ Background color: #0F172A

## 🔍 SEO

### Meta Tags Incluidos
- ✅ Primary meta tags (title, description, keywords)
- ✅ Open Graph (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Theme color para navegadores móviles

### Archivos SEO
- ✅ robots.txt configurado
- ✅ sitemap.xml básico

## 🛠️ Tecnologías Utilizadas

- **Sharp**: Procesamiento de imágenes de alta calidad
- **SVG**: Formato vectorial escalable
- **TypeScript**: Script de generación tipado

## 📝 Personalización

Para personalizar el logo, edita el archivo:
```
scripts/generate-favicons.ts
```

Modifica las variables SVG:
- `logoSVG`: Logo principal (512x512)
- `faviconSVG`: Favicon (64x64)
- `appleTouchIconSVG`: Apple icon (180x180)

Luego ejecuta `npm run generate-icons` para regenerar.

## 🎯 Mejores Prácticas

1. **SVG primero**: Siempre trabaja desde SVG para mejor calidad
2. **Múltiples tamaños**: Proveer varios tamaños mejora la experiencia
3. **Manifest**: Esencial para PWAs y agregar a home screen
4. **Meta tags**: Mejora compartir en redes sociales
5. **Nombres estándar**: Usar nombres convencionales facilita el reconocimiento

## ✨ Resultado

Todos los navegadores y plataformas ahora mostrarán el logo profesional de STIA CRM con el gradiente indigo-púrpura característico.
