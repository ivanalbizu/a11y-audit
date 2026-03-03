import { CHECKLIST } from "../data/checklist";
import { css } from "../styles/theme";

export default function Sidebar({ audits, activeAuditId, onSelectAudit }) {
  return (
    <nav style={css.sidebar} aria-label="Lista de auditorías">
      <div style={{ padding:"0.75rem 1rem 0.5rem", fontSize:"0.75rem", color:"#A0A0B8", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600 }}>Auditorías</div>
      <button
        onClick={() => onSelectAudit(null)}
        aria-current={!activeAuditId ? "page" : undefined}
        style={{ margin:"0 0.5rem 0.25rem", padding:"0.55rem 0.8rem", background: !activeAuditId ? "rgba(232,255,71,0.1)" : "transparent", border:`1px solid ${!activeAuditId ? "rgba(232,255,71,0.25)" : "transparent"}`, borderRadius:"5px", cursor:"pointer", textAlign:"left", color: !activeAuditId ? "#E8FF47" : "#C0C0D0", fontFamily:"'DM Mono',monospace", fontSize:"0.8rem" }}>
        <span aria-hidden="true">📋 </span>Todas
      </button>
      {audits.map(a => {
        const total = CHECKLIST.length;
        const done = Object.values(a.checks || {}).filter(s => s !== "pending").length;
        const pct = Math.round((done / total) * 100);
        const isActive = activeAuditId === a.id;
        const domain = a.domain.replace(/^https?:\/\//, "");
        return (
          <button key={a.id} onClick={() => onSelectAudit(a.id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`${domain} — ${pct}% completado`}
            style={{ margin:"0 0.5rem 0.25rem", padding:"0.55rem 0.8rem", background: isActive ? "rgba(232,255,71,0.08)" : "transparent", border:`1px solid ${isActive ? "rgba(232,255,71,0.2)" : "transparent"}`, borderRadius:"5px", cursor:"pointer", textAlign:"left", width:"calc(100% - 1rem)" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.8rem", color: isActive ? "#E8FF47" : "#C0C0D0", marginBottom:"0.15rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {domain}
            </div>
            {a.startDate && (
              <div style={{ fontSize:"0.7rem", color:"#7A7A94", fontFamily:"'DM Mono',monospace", marginBottom:"0.2rem" }}>
                {new Date(a.startDate).toLocaleDateString("es-ES", { day:"2-digit", month:"short" })}
                {a.endDate && ` → ${new Date(a.endDate).toLocaleDateString("es-ES", { day:"2-digit", month:"short" })}`}
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
              <div style={{ flex:1, background:"#1E1E30", borderRadius:"2px", height:"4px", overflow:"hidden" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: ${pct}%`}>
                <div style={{ height:"100%", width:`${pct}%`, background: pct < 30 ? "#FF6B6B" : pct < 70 ? "#FFE066" : "#5ED67E" }} />
              </div>
              <span style={{ fontSize:"0.75rem", color:"#A0A0B8", fontFamily:"'DM Mono',monospace" }}>{pct}%</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
