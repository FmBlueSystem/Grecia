# STIA CRM - Design System

## Identidad Visual

### Logo
- **Ubicación**: `assets/logos/stia-logo.png`
- **Tamaño base**: 150x150px
- **Formato**: PNG
- **URL fuente**: https://stia.net/wp-content/uploads/2025/02/logo.png

**Pendiente**:
- [ ] Obtener logo en SVG para mejor escalabilidad
- [ ] Crear variantes de tamaño (32x32, 64x64, 128x128, 256x256, 512x512)
- [ ] Crear versiones para fondos claros y oscuros
- [ ] Crear favicon (.ico + PNG en múltiples tamaños)

---

## Paleta de Colores

### Colores Primarios

```css
/* Azul Corporativo STIA */
--color-primary: #0067B2;
--color-primary-light: #3385C2;  /* +20% lightness */
--color-primary-lighter: #66A3D2; /* +40% lightness */
--color-primary-dark: #00538F;   /* -20% lightness */
--color-primary-darker: #003F6C;  /* -40% lightness */

/* Blanco */
--color-white: #FFFFFF;

/* Negro */
--color-black: #000000;
```

### Colores Secundarios

```css
/* Gris Claro */
--color-gray-light: #ABB8C3;

/* Gris Corporativo */
--color-gray: #777777;

/* Gris WordPress (para botones) */
--color-gray-dark: #32373C;
```

### Colores de Estado

**Pendiente extraer del sitio o definir**:

```css
/* Success - Verde */
--color-success: #10B981;        /* Sugerido: Modern green */
--color-success-light: #34D399;
--color-success-dark: #059669;

/* Warning - Amarillo/Naranja */
--color-warning: #F59E0B;        /* Sugerido: Amber */
--color-warning-light: #FBBF24;
--color-warning-dark: #D97706;

/* Error/Danger - Rojo */
--color-error: #EF4444;          /* Sugerido: Modern red */
--color-error-light: #F87171;
--color-error-dark: #DC2626;

/* Info - Azul (puede usar primary) */
--color-info: #3B82F6;           /* Sugerido: Blue */
--color-info-light: #60A5FA;
--color-info-dark: #2563EB;
```

### Escala de Grises

```css
/* Escala de grises (de claro a oscuro) */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Colores de Texto

```css
/* Texto */
--text-primary: #111827;         /* Gray-900 */
--text-secondary: #6B7280;       /* Gray-500 */
--text-tertiary: #9CA3AF;        /* Gray-400 */
--text-disabled: #D1D5DB;        /* Gray-300 */
--text-inverse: #FFFFFF;
```

### Colores de Fondo

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;         /* Gray-50 */
--bg-tertiary: #F3F4F6;          /* Gray-100 */
--bg-inverse: #111827;           /* Gray-900 */
--bg-overlay: rgba(0, 0, 0, 0.5);
```

### Paleta para Gráficos

```css
/* Colores para charts (inspirados en primary) */
--chart-color-1: #0067B2;  /* Primary */
--chart-color-2: #3B82F6;  /* Info */
--chart-color-3: #10B981;  /* Success */
--chart-color-4: #F59E0B;  /* Warning */
--chart-color-5: #EF4444;  /* Error */
--chart-color-6: #8B5CF6;  /* Purple */
--chart-color-7: #EC4899;  /* Pink */
--chart-color-8: #14B8A6;  /* Teal */
--chart-color-9: #F97316;  /* Orange */
--chart-color-10: #06B6D4; /* Cyan */
```

### Gradientes

```css
/* Gradientes para gráficos y backgrounds */
--gradient-primary: linear-gradient(135deg, #3385C2 0%, #00538F 100%);
--gradient-success: linear-gradient(135deg, #34D399 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #FBBF24 0%, #D97706 100%);
--gradient-error: linear-gradient(135deg, #F87171 0%, #DC2626 100%);
```

---

## Tipografía

### Fuentes del Sistema

Según el análisis de stia.net, el sitio utiliza fuentes del sistema (`font-family: inherit`).

**Recomendación para el CRM**:

```css
/* Sans-serif moderna para UI */
--font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                     "Helvetica Neue", Arial, sans-serif;

/* Monospace para código y datos numéricos */
--font-family-mono: ui-monospace, Menlo, Monaco, "Cascadia Code",
                     "Courier New", monospace;
```

**Alternativa**: Usar **Inter** de Google Fonts (moderna, excelente para dashboards)

```css
/* Si usamos Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Pesos de Fuente

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Tamaños de Fuente

```css
/* Scale de tipografía (basada en 16px base) */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

---

## Espaciado

Sistema de espaciado basado en múltiplos de 4px:

```css
--spacing-0: 0;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
```

---

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Completamente redondo */
```

---

## Sombras (Box Shadow)

Basado en lo detectado en stia.net:

```css
/* Sombras sutiles */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
               0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* Natural (6px 6px 9px) */
--shadow-md: 6px 6px 9px rgba(0, 0, 0, 0.15);

/* Deep (12px 12px 50px) */
--shadow-lg: 12px 12px 50px rgba(0, 0, 0, 0.2);

/* Sombras adicionales */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Sombra interna */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* Sin sombra */
--shadow-none: 0 0 0 0 rgba(0, 0, 0, 0);
```

---

## Breakpoints Responsive

Basado en los breakpoints de Elementor detectados en stia.net:

```css
/* Mobile first approach */
--breakpoint-sm: 640px;    /* Small devices */
--breakpoint-md: 768px;    /* Medium devices (tablets) */
--breakpoint-lg: 1024px;   /* Large devices (laptops) */
--breakpoint-xl: 1280px;   /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px;  /* 2X large devices */
```

**Media Queries**:

```css
/* Mobile: hasta 767px (de stia.net) */
@media (max-width: 767px) { }

/* Tablet: 768px a 1024px (de stia.net) */
@media (min-width: 768px) and (max-width: 1024px) { }

/* Desktop: 1025px+ (de stia.net) */
@media (min-width: 1025px) { }
```

---

## Anchos de Contenedor

```css
/* Anchos máximos de contenedor */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* De stia.net */
--container-content: 800px;   /* Para contenido de texto */
--container-full: 1200px;     /* Para layout completo */
```

---

## Z-Index Scale

```css
/* Escala de z-index para mantener orden */
--z-0: 0;
--z-10: 10;
--z-20: 20;
--z-30: 30;
--z-40: 40;
--z-50: 50;        /* Dropdowns, tooltips */
--z-modal: 100;    /* Modals */
--z-popover: 200;  /* Popovers */
--z-toast: 300;    /* Notifications/toasts */
--z-tooltip: 400;  /* Tooltips */
--z-overlay: 999;  /* Overlays de carga */
--z-max: 9999;     /* Absolute maximum */
```

---

## Animaciones y Transiciones

```css
/* Duraciones */
--duration-fast: 150ms;
--duration-base: 200ms;   /* De stia.net */
--duration-slow: 300ms;
--duration-slower: 500ms;

/* Easing functions */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Componentes Base

### Botones

#### Primary Button
```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-base) var(--ease-in-out);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  background-color: var(--color-primary-darker);
  box-shadow: var(--shadow-sm);
  transform: translateY(0);
}

.btn-primary:disabled {
  background-color: var(--gray-300);
  color: var(--text-disabled);
  cursor: not-allowed;
  box-shadow: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-base) var(--ease-in-out);
}

.btn-secondary:hover {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}
```

#### Ghost Button
```css
.btn-ghost {
  background-color: transparent;
  color: var(--color-primary);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-base) var(--ease-in-out);
}

.btn-ghost:hover {
  background-color: var(--gray-100);
}
```

#### Tamaños de Botones
```css
.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
}

.btn-md {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--text-base);
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--text-lg);
}
```

### Cards

```css
.card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--spacing-6);
  transition: all var(--duration-base) var(--ease-in-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: var(--spacing-4);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  color: var(--text-secondary);
}

.card-footer {
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--gray-200);
  margin-top: var(--spacing-4);
}
```

### Form Elements

#### Input Fields
```css
.input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 103, 178, 0.1);
}

.input:disabled {
  background-color: var(--gray-100);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-success {
  border-color: var(--color-success);
}
```

#### Labels
```css
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
}

.label-required::after {
  content: "*";
  color: var(--color-error);
  margin-left: var(--spacing-1);
}
```

#### Helper Text
```css
.helper-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-2);
}

.error-text {
  font-size: var(--text-sm);
  color: var(--color-error);
  margin-top: var(--spacing-2);
}
```

---

## Iconografía

**Pendiente**: Determinar librería de iconos

**Opciones recomendadas**:
1. **Heroicons** (moderno, limpio, gratis)
2. **Lucide** (fork de Feather, muy popular)
3. **Material Icons** (amplia variedad)
4. **Font Awesome** (más completo pero pesado)

**Decisión sugerida**: **Lucide** o **Heroicons** (más modernas y ligeras)

---

## Gráficos y Visualizaciones

### Paleta de Colores para Charts

```javascript
// Array de colores para gráficos
const chartColors = [
  '#0067B2', // Primary
  '#3B82F6', // Info
  '#10B981', // Success
  '#F59E0B', // Warning
  '#EF4444', // Error
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#06B6D4', // Cyan
];
```

### Gradientes para Area Charts

```javascript
const chartGradients = {
  primary: 'rgba(0, 103, 178, 0.3)',
  success: 'rgba(16, 185, 129, 0.3)',
  warning: 'rgba(245, 158, 11, 0.3)',
  error: 'rgba(239, 68, 68, 0.3)',
};
```

---

## Tareas Pendientes

- [ ] Obtener logo en formato SVG
- [ ] Crear variantes del logo en diferentes tamaños
- [ ] Crear favicon
- [ ] Validar paleta de colores de estado con stakeholders
- [ ] Decidir fuente tipográfica (Sistema vs Inter vs otra)
- [ ] Seleccionar librería de iconos
- [ ] Crear mockups de componentes principales
- [ ] Diseñar templates de dashboards
- [ ] Crear guía de uso de gráficos

---

**Última actualización**: 2026-01-15
**Versión**: 0.1.0
