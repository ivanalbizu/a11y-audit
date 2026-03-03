# A11Y Audit Manager

Aplicación web para gestionar auditorías de accesibilidad siguiendo el estándar **WCAG 2.2 nivel AA**. Permite crear, revisar y exportar auditorías completas con un checklist de **74 ítems** organizados en 7 áreas.

## Funcionalidades

- **Dashboard** — Vista general de todas las auditorías con progreso y estadísticas
- **Checklist interactivo** — 74 criterios de verificación con filtros por área, severidad, estado y tipo
- **Vista resumen** — Estadísticas por área WCAG, porcentaje de conformidad y listado de fallos críticos
- **Sidebar** — Navegación rápida entre auditorías con indicador de progreso
- **Notas y evidencias** — Campo de texto por cada ítem para documentar selectores, URLs o capturas
- **Exportar / Importar JSON** — Respaldo y portabilidad de datos entre equipos
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

Cada ítem incluye: severidad (crítico/alto/medio/bajo), tipo (automático/manual/híbrido), criterio WCAG asociado, herramienta sugerida, equipo responsable, esfuerzo estimado y recomendación de corrección.

## Tech stack

- **React 19** — Componentes funcionales con hooks
- **Vite 7** — Bundler y servidor de desarrollo
- **pnpm** — Gestor de paquetes

Sin dependencias externas de UI. Estilos inline mediante un sistema de tema centralizado con paleta oscura y ratios de contraste verificados (WCAG AA).

## Estructura del proyecto

```
src/
├── data/
│   ├── checklist.js    # 74 ítems del checklist WCAG 2.2
│   └── config.js       # Configuración de severidad, estados, áreas y colores
├── styles/
│   └── theme.js        # Sistema de estilos inline (paleta, tipografía, componentes)
├── utils/
│   └── storage.js      # Persistencia en localStorage, exportar/importar JSON
├── components/
│   ├── Topbar.jsx      # Barra superior con exportar/importar/eliminar
│   ├── Sidebar.jsx     # Navegación lateral con lista de auditorías
│   ├── Dashboard.jsx   # Vista principal con tarjetas de auditorías
│   ├── AuditView.jsx   # Checklist con filtros y vista detallada por ítem
│   ├── SummaryView.jsx # Resumen estadístico por área WCAG
│   └── StatusBadges.jsx# Badges de severidad, tipo y selector de estado
├── App.jsx             # Orquestador principal
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

El archivo `demo-audits.json` en la raíz del proyecto contiene 3 auditorías de ejemplo. Para cargarlas, usa el botón **↑ Importar JSON** en la barra superior.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | Build de producción en `dist/` |
| `pnpm preview` | Previsualización del build |
| `pnpm lint` | Linter con ESLint |
