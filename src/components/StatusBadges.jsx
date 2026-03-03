import { SEV_CONFIG, TIPO_CONFIG, STATUS_CONFIG, NIVEL_CONFIG } from "../data/config";
import { css } from "../styles/theme";

export function Badge({ sev }) {
  const c = SEV_CONFIG[sev];
  return <span style={css.pill(c.color, c.bg, c.border)}>{c.label}</span>;
}

export function TipoBadge({ tipo }) {
  const c = TIPO_CONFIG[tipo];
  return <span style={{ ...css.pill(c.color, "transparent", "transparent") }}>{c.label}</span>;
}

export function NivelBadge({ nivel }) {
  const c = NIVEL_CONFIG[nivel];
  if (!c) return null;
  return <span style={css.pill(c.color, c.bg, c.border)}>{c.label}</span>;
}

export function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label="Estado del ítem"
      style={{ ...css.select, color: STATUS_CONFIG[value]?.color || "#E8E8F0", fontWeight:600 }}
    >
      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
        <option key={k} value={k}>{v.icon} {v.label}</option>
      ))}
    </select>
  );
}
