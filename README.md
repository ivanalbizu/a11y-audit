# A11Y Audit Manager

Aplicación web para gestionar auditorías de accesibilidad siguiendo el estándar **WCAG 2.2 nivel AA**. Permite crear, revisar y exportar auditorías completas con un checklist de **83 ítems** organizados en 7 áreas.

## Funcionalidades

- **Dashboard** — Vista general de todas las auditorías con progreso y estadísticas
- **Checklist interactivo** — 83 criterios de verificación con filtros por área, severidad, estado, tipo y nivel WCAG (A/AA/AAA)
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
- **Control de almacenamiento** — Indicador de uso en MB, aviso al 4 MB, bloqueo al 9 MB
- **Persistencia en localStorage** — Los datos se guardan automáticamente en el navegador

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

## Tech stack

- **React 19** — Componentes funcionales con hooks
- **Vite 7** — Bundler y servidor de desarrollo
- **pnpm** — Gestor de paquetes

Sin dependencias externas de UI. Estilos inline mediante un sistema de tema centralizado con paleta oscura y ratios de contraste verificados (WCAG AA).

## Estructura del proyecto

```
src/
├── data/
│   ├── checklist.js    # 83 ítems del checklist WCAG 2.2
│   ├── config.js       # Configuración de severidad, estados, niveles, áreas y colores
│   ├── glossary.js     # 18 acrónimos de accesibilidad con definiciones
│   └── wcagLinks.js    # Mapa de criterios WCAG → URLs W3C Understanding
├── styles/
│   └── theme.js        # Sistema de estilos inline (paleta, tipografía, componentes)
├── utils/
│   └── storage.js      # Persistencia localStorage, exportar/importar JSON, control de capacidad
├── components/
│   ├── Topbar.jsx      # Barra superior con exportar/importar/eliminar + indicador de almacenamiento
│   ├── Sidebar.jsx     # Navegación lateral con lista de auditorías y fechas
│   ├── Dashboard.jsx   # Vista principal con tarjetas de auditorías y formulario de creación
│   ├── AuditView.jsx   # Checklist con filtros, grid tabulado, ítems custom y capturas
│   ├── SummaryView.jsx # Resumen estadístico por área WCAG
│   ├── VersionsView.jsx# Historial de versiones con snapshots y comparativa
│   ├── GlossaryView.jsx# Glosario de acrónimos con búsqueda
│   └── StatusBadges.jsx# Badges de severidad, tipo, nivel WCAG y selector de estado
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
