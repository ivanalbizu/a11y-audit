import { CHECKLIST } from "./checklist";

// Pill colors use CSS custom properties for light/dark support
// pill() backgrounds/borders use color-mix() for transparency
export const SEV_CONFIG = {
  critical: { label:"Crítico", color:"var(--danger)",  bg:"color-mix(in srgb, var(--danger) 15%, transparent)",  border:"color-mix(in srgb, var(--danger) 35%, transparent)" },
  high:     { label:"Alto",    color:"var(--warning)",  bg:"color-mix(in srgb, var(--warning) 15%, transparent)", border:"color-mix(in srgb, var(--warning) 35%, transparent)" },
  medium:   { label:"Medio",   color:"var(--warning)",  bg:"color-mix(in srgb, var(--warning) 12%, transparent)", border:"color-mix(in srgb, var(--warning) 30%, transparent)" },
  low:      { label:"Bajo",    color:"var(--success)",  bg:"color-mix(in srgb, var(--success) 12%, transparent)", border:"color-mix(in srgb, var(--success) 30%, transparent)" },
};

export const EFFORT_CONFIG = {
  low:    { label:"Bajo",  color:"var(--success)" },
  medium: { label:"Medio", color:"var(--warning)" },
  high:   { label:"Alto",  color:"var(--warning)" },
};

export const TIPO_CONFIG = {
  auto:   { label:"🤖 Auto",   color:"var(--accent-blue)" },
  manual: { label:"👁 Manual",  color:"var(--accent-purple)" },
  both:   { label:"⚡ Ambos",   color:"var(--warning)" },
};

export const NIVEL_CONFIG = {
  A:   { label: "A",   color: "var(--success)",      bg: "color-mix(in srgb, var(--success) 12%, transparent)",      border: "color-mix(in srgb, var(--success) 30%, transparent)" },
  AA:  { label: "AA",  color: "var(--accent-blue)",   bg: "color-mix(in srgb, var(--accent-blue) 12%, transparent)",  border: "color-mix(in srgb, var(--accent-blue) 30%, transparent)" },
  AAA: { label: "AAA", color: "var(--accent-purple)", bg: "color-mix(in srgb, var(--accent-purple) 12%, transparent)", border: "color-mix(in srgb, var(--accent-purple) 30%, transparent)" },
};

export const STATUS_CONFIG = {
  pending:  { label:"Pendiente", color:"var(--text-secondary)", icon:"○" },
  pass:     { label:"Pasa",      color:"var(--success)",        icon:"✅" },
  fail:     { label:"Falla",     color:"var(--danger)",         icon:"❌" },
  partial:  { label:"Parcial",   color:"var(--warning)",        icon:"⚠" },
  na:       { label:"N/A",       color:"var(--text-secondary)", icon:"—" },
};

export const AREAS = [...new Set(CHECKLIST.map(i => i.area))];

export const DEFAULT_SCOPES = ["Global", "Header", "Footer"];

export const SCOPE_COLORS = {
  Global:  "var(--accent)",
  Header:  "var(--accent-blue)",
  Footer:  "var(--accent-purple)",
};

export const AREA_COLORS = {
  "Perceivable":   "var(--accent-blue)",
  "Operable":      "var(--accent)",
  "Comprensible":  "var(--accent-purple)",
  "Robusto":       "var(--danger)",
  "Móvil / Touch": "var(--warning)",
  "Contenido":     "var(--success)",
  "Proceso y QA":  "var(--danger)",
};
