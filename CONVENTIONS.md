# Convenciones y Reglas del Proyecto (Conventions)

> Reglas de oro para mantener la calidad y consistencia del código en **Grecia**.

## 📝 Estándares de Codificación

### TypeScript & JavaScript
*   Usar `const` por defecto, `let` solo si es necesario reasignar. Nunca `var`.
*   Nombres de variables/funciones: `camelCase`.
*   Nombres de componentes/clases: `PascalCase`.
*   Interfaces/Tipos: `PascalCase`, sin prefijo `I` (ej. `User`, no `IUser`).
*   **Exportaciones**: Preferir `export const` (named exports) sobre `export default`, excepto para páginas `lazy` loaded.

### React
*   **Componentes Funcionales**: Siempre. Clases están prohibidas.
*   **Props**: Usar interfaces para definir props. Desestructurar en los argumentos.
*   **Hooks**: Reglas de hooks estándar. Custom hooks deben empezar con `use`.

### Tailwind CSS
*   Orden de clases: Layout -> Box Model -> Typography -> Visual -> Misc. (O usar plugin de ordenamiento).
*   No usar `@apply` excesivamente. Preferir clases utilitarias en el JSX.

## 📂 Estructura de Carpetas (Conductor Compliant)
```text
/
├── CONTEXT.md          # Visión y Dominio
├── TECH_STACK.md       # Tecnologías
├── CONVENTIONS.md      # Estas reglas
├── plan.md             # Plan de ejecución activo (The Track)
├── src/
│   ├── features/       # Feature-based architecture
│   │   ├── auth/
│   │   ├── contacts/
│   ├── ui/             # Componentes compartidos (Design System)
│   ├── lib/            # Utilidades core
```

## 🤖 Reglas para el Agente (IA)
1.  **Lee el Contexto**: Antes de proponer cambios grandes, lee `CONTEXT.md`.
2.  **Actualiza el Plan**: Si terminas una tarea, márcala en `plan.md`. Si surgen nuevas tareas, agrégalas.
3.  **No rompas el build**: Verifica tipos antes de confirmar código.
4.  **Estética**: Si generas UI, asegúrate de que se vea "Premium" (sombras suaves, bordes redondeados, espaciado generoso).
