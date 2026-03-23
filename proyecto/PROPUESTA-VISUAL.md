# Propuesta: Unificacion Visual del Portal STIA

## Resumen Ejecutivo

El portal actualmente tiene dos identidades visuales distintas:
- **Login**: Tema oscuro con animaciones 3D (particulas flotantes)
- **Resto del sitio**: Tema claro tradicional

Esta propuesta busca unificar la experiencia visual bajo una identidad coherente y premium.

---

## Analisis Situacional

### Estado Actual

| Componente | Login | Portal |
|------------|-------|--------|
| Fondo | `#0A0A10` (oscuro) | `#FAFAFC` (claro) |
| Animacion | Particulas 3D Three.js | Ninguna |
| Tarjetas | Glassmorphism oscuro | Glassmorphism claro |
| Sidebar | N/A | Blanco/gris |
| Tipografia | Moderna | Inter (sans) |

### Problemas Identificados

1. **Inconsistencia visual** - Transicion abrupta entre login y portal
2. **Perdida de identidad** - Las animaciones 3D del login no se aprovechan en el resto
3. **Experiencia genérica** - El portal parece una aplicacion cualquiera, no una extension del login

---

## Propuesta: Dark Theme Premium Unificado

### Concepto

Mantener el tema oscuro elegante del login en TODO el portal, con:
- Fondo oscuro con particulas animadas sutiles
- Glassmorphism consistente
- Colores STIA iluminados sobre fondo oscuro
- Transiciones fluidas entre paginas

### Paleta de Colores Propuesta

```css
/* Colores STIA sobre fondo oscuro */
--background: #0A0A10;        /* Fondo principal (como login) */
--surface: #12121A;           /* Tarjetas/paneles */
--surface-elevated: #1A1A25;   /* Elementos elevados */

--primary: #0067B2;           /* STIA Corporate Blue */
--primary-light: #109BC4;     /* STIA Light Blue */
--accent: #F2B90D;             /* STIA Gold/Yellow */

--text-primary: #FFFFFF;
--text-secondary: #A0A0B0;
--text-muted: #606070;

/* Estados */
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Componentes a Modificar

#### 1. Fondo Global (`globals.css`)

```css
/*替换现有的 light theme */
body {
  background: #0A0A10;
  color: #FFFFFF;
}

/* Particulas animadas de fondo */
.portal-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: radial-gradient(ellipse at top, #151520 0%, #0A0A10 100%);
}
```

#### 2. Layout del Portal (`layout.tsx`)

- Agregar `AnimatedBackground` del login
- Usar glassmorphism oscuro en sidebar y header
- Cambiar header de `glass-panel` a version oscura

#### 3. Sidebar (`sidebar.tsx`)

```css
/* De: bg-white/70 */
/* A: bg-[#12121A]/80 con borde sutil */
.sidebar {
  background: linear-gradient(180deg, #12121A 0%, #0D0D15 100%);
  border-right: 1px solid rgba(255,255,255,0.08);
}
```

#### 4. Tarjetas y Paneles

```css
/* Glassmorphism oscuro */
.card-dark {
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

#### 5. KPI Cards

- Fondo oscuro con borde sutil azul
- Numeros en blanco/primary
- Animaciones de entrada保持

#### 6. Tablas

- Fondo de fila alternado oscuro
- Hover con tinte azul sutil
- Encabezados en texto secundario

---

## Plan de Implementacion

### Fase 1: Foundation (1 dia)

- [ ] Modificar `globals.css` para tema oscuro global
- [ ] Crear `PortalBackground` component (version ligera de particulas)
- [ ] Actualizar `layout.tsx` con nuevo theme

### Fase 2: Componentes (1 dia)

- [ ] Actualizar `sidebar.tsx` a tema oscuro
- [ ] Actualizar `glass-panel` y `glass-card` para modo oscuro
- [ ] Actualizar KPI cards
- [ ] Actualizar tablas y listas

### Fase 3: Paginas (1 dia)

- [ ] Dashboard - verificar consistencia
- [ ] Casos (lista y detalle)
- [ ] Estadisticas (charts en modo oscuro)
- [ ] Alertas

### Fase 4: Detalles (0.5 dia)

- [ ] Transiciones entre paginas
- [ ] Loading states oscuros
- [ ] Formularios y inputs
- [ ] Testing y ajustes

---

## Beneficios

1. **Experiencia unificada** - Transicion fluida login → portal
2. **Premium feel** - Apariencia moderna y profesional
3. **Diferenciacion** - Se destaca visualmente de portales genericos
4. **Consistencia STIA** - Refuerza identidad de marca

---

## Consideraciones

- **Rendimiento**: Las particulas 3D pueden afectar performance en dispositivos debiles → version ligera opcional
- **Accesibilidad**: El texto sobre fondo oscuro debe mantener contraste adequado
- **Charts**: Recharts soporta modo oscuro nativamente

---

## Timeline Estimado

| Fase | Duracion | Total |
|------|----------|-------|
| Foundation | 1 dia | 1 dia |
| Componentes | 1 dia | 2 dias |
| Paginas | 1 dia | 3 dias |
| Detalles | 0.5 dia | 3.5 dias |

**Total estimado: 3.5 dias**

---

## Alternativa: Modo Claro Premium

Si el cliente prefiere mantener tema claro,，我们可以 crear una version "Premium Light" con:
- Fondo blanco/crema suave
- Sombras elegantes
- Bordes sutiles
- Micro-interacciones suaves

Pero la recomendacion es el **tema oscuro** por:
1. Consistencia con login existente
2. Apariencia mas premium/moderna
3. Menor fatiga visual en uso prolongado
