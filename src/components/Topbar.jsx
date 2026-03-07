import { CHECKLIST } from "../data/checklist";
import { css } from "../styles/theme";
import { exportAudits, importAudits, getStorageSizeMB, checkStorageCapacity } from "../utils/storage";

const topBtn = (accent) => ({ ...css.btn(accent), display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:"140px", height:"32px", boxSizing:"border-box" });

export default function Topbar({ audits, activeAuditId, onImport, onDelete }) {
  return (
    <header style={css.topbar} role="banner">
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
        <span style={css.logo} aria-hidden="true">A11Y</span>
        <span style={css.logoSub}>Audit Manager · WCAG 2.2</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
        <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)" }}>{audits.length} auditorías · {CHECKLIST.length} ítems</span>
        <span style={{ fontSize:"0.75rem", color: checkStorageCapacity() === "warning" ? "var(--warning)" : checkStorageCapacity() === "full" ? "var(--danger)" : "var(--text-tertiary)", fontFamily:"'DM Mono',monospace" }}>{getStorageSizeMB()} MB</span>
        <button style={topBtn("var(--accent-blue)")} onClick={() => exportAudits(audits)} aria-label="Exportar auditorías como JSON" disabled={audits.length === 0}>
          ↓ Exportar JSON
        </button>
        <button style={topBtn("var(--accent-purple)")} onClick={() => document.getElementById("import-json-input").click()} aria-label="Importar auditorías desde archivo JSON">
          ↑ Importar JSON
        </button>
        <input id="import-json-input" type="file" accept=".json" style={{ position:"absolute", width:"1px", height:"1px", overflow:"hidden", clip:"rect(0,0,0,0)" }} onChange={e => { if(e.target.files[0]) importAudits(e.target.files[0], onImport); e.target.value=""; }} aria-label="Seleccionar archivo JSON para importar" />
        {activeAuditId && (
          <button style={topBtn("var(--danger)")} onClick={() => { if (window.confirm("¿Eliminar esta auditoría? Esta acción no se puede deshacer.")) onDelete(activeAuditId); }} aria-label="Eliminar auditoría actual">
            Eliminar
          </button>
        )}
      </div>
    </header>
  );
}
