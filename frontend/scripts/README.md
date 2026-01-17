# Scripts - Frontend

## 🎨 generate-favicons.ts

Script para generar todos los favicons, logos y assets necesarios para el proyecto.

### Uso

```bash
npm run generate-icons
```

### Qué genera

- Favicons en múltiples formatos (ICO, SVG, PNG)
- Logos para PWA (192x192, 512x512)
- Apple Touch Icons
- Android Chrome Icons
- Web App Manifest

### Tecnología

- **Sharp**: Librería de procesamiento de imágenes de alto rendimiento
- **SVG**: Formato vectorial para máxima calidad

### Personalización

Edita las constantes SVG en el archivo para cambiar:
- Colores del gradiente
- Tamaño y posición de la letra
- Elementos decorativos

### Estructura del SVG

```typescript
const logoSVG = `
  <svg>
    <defs>
      <linearGradient>...</linearGradient>
    </defs>
    <rect />      <!-- Background -->
    <text>S</text> <!-- Main letter -->
    <circle />     <!-- Accent -->
  </svg>
`;
```

### Output

Todos los archivos se generan en `public/`:
- 10+ imágenes en diferentes tamaños
- manifest.json configurado
- Optimización automática
