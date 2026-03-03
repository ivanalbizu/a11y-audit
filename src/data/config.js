import { CHECKLIST } from "./checklist";

// All pill text colors verified ≥4.5:1 on their pill background
// Pill backgrounds are semi-transparent on card bg #10101C
export const SEV_CONFIG = {
  critical: { label:"Crítico", color:"#FF6B6B", bg:"rgba(255,68,68,0.15)", border:"rgba(255,68,68,0.35)" },
  high:     { label:"Alto",    color:"#FFB347", bg:"rgba(255,149,0,0.15)", border:"rgba(255,149,0,0.35)" },
  medium:   { label:"Medio",   color:"#FFE066", bg:"rgba(255,214,10,0.12)", border:"rgba(255,214,10,0.30)" },
  low:      { label:"Bajo",    color:"#5ED67E", bg:"rgba(52,199,89,0.12)",  border:"rgba(52,199,89,0.30)" },
};

export const EFFORT_CONFIG = {
  low:    { label:"Bajo",  color:"#5ED67E" },
  medium: { label:"Medio", color:"#FFE066" },
  high:   { label:"Alto",  color:"#FFB347" },
};

export const TIPO_CONFIG = {
  auto:   { label:"🤖 Auto",   color:"#6CB4FF" },
  manual: { label:"👁 Manual",  color:"#C88AFF" },
  both:   { label:"⚡ Ambos",   color:"#FFB347" },
};

export const NIVEL_CONFIG = {
  A:   { label: "A",   color: "#5ED67E", bg: "rgba(52,199,89,0.12)",   border: "rgba(52,199,89,0.30)" },
  AA:  { label: "AA",  color: "#6CB4FF", bg: "rgba(108,180,255,0.12)", border: "rgba(108,180,255,0.30)" },
  AAA: { label: "AAA", color: "#C88AFF", bg: "rgba(200,138,255,0.12)", border: "rgba(200,138,255,0.30)" },
};

export const STATUS_CONFIG = {
  pending:  { label:"Pendiente", color:"#A0A0B8", icon:"○" },
  pass:     { label:"Pasa",      color:"#5ED67E", icon:"✅" },
  fail:     { label:"Falla",     color:"#FF6B6B", icon:"❌" },
  partial:  { label:"Parcial",   color:"#FFB347", icon:"⚠" },
  na:       { label:"N/A",       color:"#A0A0B8", icon:"—" },
};

export const AREAS = [...new Set(CHECKLIST.map(i => i.area))];

export const AREA_COLORS = {
  "Perceivable":   "#6CB4FF",
  "Operable":      "#E8FF47",
  "Comprensible":  "#C88AFF",
  "Robusto":       "#FF6B6B",
  "Móvil / Touch": "#FFB347",
  "Contenido":     "#5ED67E",
  "Proceso y QA":  "#FF6B6B",
};
