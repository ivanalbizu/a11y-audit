import { CHECKLIST } from "../data/checklist";
import { css } from "../styles/theme";
import { exportAudits, importAudits } from "../utils/storage";

export default function Topbar({ audits, activeAuditId, onImport, onDelete }) {
  return (
    <header style={css.topbar} role="banner">
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
        <span style={css.logo} aria-hidden="true">A11Y</span>
        <span style={css.logoSub}>Audit Manager · WCAG 2.2</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
        <span style={{ fontSize:"0.8rem", color:"#A0A0B8" }}>{audits.length} auditorías · {CHECKLIST.length} ítems</span>
        <button style={css.btn("#6CB4FF")} onClick={() => exportAudits(audits)} aria-label="Exportar auditorías como JSON">
          ↓ Exportar JSON
        </button>
        <label style={{ ...css.btn("#C88AFF"), cursor:"pointer", display:"inline-flex", alignItems:"center" }} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") e.currentTarget.querySelector("input").click(); }}>
          ↑ Importar JSON
          <input type="file" accept=".json" style={{ position:"absolute", width:"1px", height:"1px", overflow:"hidden", clip:"rect(0,0,0,0)" }} onChange={e => { if(e.target.files[0]) importAudits(e.target.files[0], onImport); e.target.value=""; }} aria-label="Seleccionar archivo JSON para importar" />
        </label>
        {activeAuditId && (
          <button style={css.btn("#A0A0B8")} onClick={() => onDelete(activeAuditId)} aria-label="Eliminar auditoría actual">
            Eliminar
          </button>
        )}
      </div>
    </header>
  );
}
