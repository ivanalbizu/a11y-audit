# A11Y Audit Manager

Aplicación web para gestionar auditorías de accesibilidad siguiendo el estándar **WCAG 2.2 nivel AA**. Permite crear, revisar y exportar auditorías completas con un checklist de **122 ítems** organizados en 7 áreas.

## Funcionalidades

- **Dashboard** — Vista general de todas las auditorías con progreso y estadísticas
- **Checklist interactivo** — 122 criterios de verificación con filtros por área, severidad, estado, tipo y nivel WCAG (A/AA/AAA)
- **Ítems personalizados** — Añadir ítems propios a cada auditoría con formulario completo (área, WCAG, severidad, tipo, etc.)
- **Vista resumen** — Estadísticas por área WCAG, porcentaje de conformidad y listado de fallos críticos
- **Historial de versiones** — Snapshots del estado de la auditoría con comparativa entre versiones
- **Capturas de pantalla** — Adjuntar imágenes por ítem (archivo o Ctrl+V) con galería de miniaturas
- **Glosario** — Referencia rápida de 18 acrónimos de accesibilidad (AT, ARIA, WCAG, SR, EAA…)
- **Enlaces normativos** — Cada criterio WCAG enlaza directamente a su página W3C Understanding
- **Fechas de auditoría** — Inicio y fin editables, visibles en dashboard, sidebar y vista de auditoría
- **URLs por auditoría** — Cada auditoría tiene su propia URL con hash routing (`#/audit/{id}`)
- **Exportar / Importar JSON** — Respaldo global o por auditoría individual, con detección de duplicados al importar
- **Sidebar** — Navegación rápida entre auditorías con indicador de progreso y fechas
- **Notas y evidencias** — Textarea auto-creciente por ítem para documentar hallazgos
- **Scopes** — Clasificar cada ítem del checklist por scope (Global, Header, Footer o personalizado)
- **Herencia de checks** — Al crear auditoría de un dominio existente, importar checks compartidos (scoped)
- **Capturas a nivel de auditoría** — Documentar el estado visual de la web entre auditorías, con descripción y fecha
- **Lightbox** — Vista ampliada de capturas con overlay (click para cerrar)
- **Generación de informe** — Informe HTML autónomo con resumen, stats, fallos, capturas y checklist completo, listo para imprimir como PDF
- **IndexedDB para capturas** — Almacenamiento de imágenes en IndexedDB (cientos de MB) en vez de localStorage
- **Compresión de capturas** — Imágenes comprimidas automáticamente a WebP (max 1200px, calidad 0.7)
- **Temas claro/oscuro** — Automático via `prefers-color-scheme`, con colores ajustados para contraste AA
- **Error Boundary** — Fallback UI ante crashes de componentes con opción de reintentar o limpiar datos
- **Control de almacenamiento** — Indicador de uso en MB, aviso al 4 MB, bloqueo al 9 MB
- **Persistencia en localStorage + IndexedDB** — Datos ligeros en localStorage, capturas en IndexedDB

## Áreas del checklist

| Área | Descripción |
|------|-------------|
| Percepción | Alternativas de texto, multimedia, contraste, adaptabilidad |
| Operabilidad | Navegación por teclado, tiempo, convulsiones, gestos |
| Comprensibilidad | Legibilidad, predictibilidad, errores en formularios |
| Robustez | Compatibilidad con tecnologías asistivas |
| Móvil/Táctil | Tamaños de toque, orientación, gestos táctiles |
| Contenido | Lenguaje claro, estructura de encabezados, idioma |
| Procesos | Autenticación, errores, ayuda contextual |

Cada ítem incluye: severidad (crítico/alto/medio/bajo), tipo (automático/manual/híbrido), criterio WCAG asociado, nivel (A/AA/AAA), herramienta sugerida, equipo responsable, esfuerzo estimado y recomendación de corrección.

## Scopes

Los scopes permiten clasificar cada ítem del checklist según dónde aplica dentro del sitio web. Esto es especialmente útil cuando se auditan múltiples páginas del mismo dominio.

### Scopes predefinidos

| Scope | Uso típico |
|-------|-----------|
| **Global** | Tipografía, colores, idioma, skip links... aspectos transversales |
| **Header** | Navegación principal, logo, orden de enlaces |
| **Footer** | Enlaces del footer, landmarks, contraste |

### Scopes personalizados

El auditor puede crear scopes adicionales (ej: "Banner cookies", "Formulario contacto", "Sidebar") desde la barra de filtros del checklist, escribiendo el nombre y pulsando Enter o el botón +.

### Herencia entre auditorías

Al crear una nueva auditoría para un dominio que ya tiene auditorías previas:

1. La app detecta los checks que tienen scope asignado
2. Aparece un diálogo preguntando si quieres importar los checks compartidos
3. Los checks importados se marcan como **heredados** (icono ↩ junto al ID)
4. A partir de ahí son **independientes**: modificar un check en la nueva auditoría no afecta a la original
5. Los scopes personalizados de auditorías previas también se importan

### Modelo de datos

```js
// Cada check almacena status + scope
checks: {
  "PERC-01": { status: "pass", scope: "Global" },
  "PERC-05": { status: "fail", scope: "Header" },
  "PERC-10": { status: "pass", scope: null },     // sin scope = específico de página
}
```

### Resumen por scope

En la vista Resumen, la sección "Por scope" muestra el progreso (pass/fail/pendiente) desglosado por cada scope que tiene ítems asignados.

## Tech stack

- **React 19** — Componentes funcionales con hooks
- **Vite 7** — Bundler y servidor de desarrollo
- **pnpm** — Gestor de paquetes

Sin dependencias externas de UI. Estilos inline mediante un sistema de tema centralizado. Temas claro/oscuro automáticos via `prefers-color-scheme` con ratios de contraste WCAG AA verificados.

## Estructura del proyecto

```
src/
├── data/
│   ├── checklist.js    # 122 ítems del checklist WCAG 2.2
│   ├── config.js       # Configuración de severidad, estados, niveles, áreas y colores
│   ├── glossary.js     # 18 acrónimos de accesibilidad con definiciones
│   └── wcagLinks.js    # Mapa de criterios WCAG → URLs W3C Understanding
├── styles/
│   └── theme.js        # Sistema de estilos inline (paleta, tipografía, componentes)
├── utils/
│   ├── storage.js      # Persistencia localStorage + IndexedDB, exportar/importar JSON, control de capacidad
│   ├── checks.js       # Helpers del modelo de checks (status + scope, migración)
│   ├── screenshotDb.js # Wrapper IndexedDB para almacenamiento de capturas
│   └── reportGenerator.js # Generador de informe HTML autónomo para clientes
├── components/
│   ├── Topbar.jsx      # Barra superior con exportar/importar/eliminar + indicador de almacenamiento
│   ├── Sidebar.jsx     # Navegación lateral con lista de auditorías y fechas
│   ├── Dashboard.jsx   # Vista principal con tarjetas de auditorías y formulario de creación
│   ├── AuditView.jsx   # Checklist con filtros, grid tabulado, ítems custom y capturas
│   ├── SummaryView.jsx # Resumen estadístico por área WCAG
│   ├── VersionsView.jsx# Historial de versiones con snapshots y comparativa
│   ├── GlossaryView.jsx# Glosario de acrónimos con búsqueda
│   ├── StatusBadges.jsx# Badges de severidad, tipo, nivel WCAG y selector de estado
│   └── ErrorBoundary.jsx # Fallback UI ante crashes de componentes
├── App.jsx             # Orquestador principal con hash routing
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales y focus-visible
```

## Inicio rápido

```bash
pnpm install
pnpm dev
```

La aplicación se abre en `http://localhost:5173`.

## Datos de demo

El archivo `demo-audits.json` en la raíz del proyecto contiene 3 auditorías de ejemplo. Para cargarlas, usa el botón **↑ Importar JSON** en la barra superior. La importación detecta duplicados y solo añade auditorías nuevas.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | Build de producción en `dist/` |
| `pnpm preview` | Previsualización del build |
| `pnpm lint` | Linter con ESLint |

## TODO

### UX / Funcionalidad

- [x] **Exportar CSV** — Exportar checklist como CSV para abrir en Excel/Google Sheets
- [x] **Copiar como tabla** — Botón que copia datos al portapapeles como tabla HTML (pegar en Sheets/Notion/email)
- [x] **Filtros persistentes** — Recordar filtros activos por sesión al cambiar entre auditorías
- [x] **Ordenar columnas** — Click en cabecera del checklist para ordenar por severidad, estado, WCAG, etc.

### Accesibilidad

- [ ] **Focus trap en lightbox** — Atrapar foco dentro del dialog y cerrar con Escape
- [ ] **Skip link** — Enlace "Saltar al contenido" para usuarios de teclado
- [ ] **Focus visible personalizado** — Estilo `:focus-visible` para botones e interactivos

### Técnico

- [ ] **Indicador de almacenamiento real** — El contador de MB en Topbar solo mide localStorage; debería sumar IndexedDB (`navigator.storage.estimate()`)
