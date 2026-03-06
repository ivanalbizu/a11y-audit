import { useState } from "react";
import { CHECKLIST } from "../data/checklist";
import { css } from "../styles/theme";

function formatDateRange(audit) {
  const start = audit.startDate ? new Date(audit.startDate).toLocaleDateString("es-ES") : null;
  const end = audit.endDate ? new Date(audit.endDate).toLocaleDateString("es-ES") : null;
  if (start && end) return `${start} → ${end}`;
  if (start) return `Desde ${start}`;
  return new Date(audit.createdAt).toLocaleDateString("es-ES");
}

export default function Dashboard({ audits, onSelect, onCreate }) {
  const [newDomain, setNewDomain] = useState("");
  const [newAuditor, setNewAuditor] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [creating, setCreating] = useState(false);

  const doCreate = () => {
    if (!newDomain.trim()) return;
    onCreate(newDomain.trim(), newAuditor.trim() || "Sin especificar", newStartDate || null, newEndDate || null);
    setNewDomain(""); setNewAuditor(""); setNewStartDate(""); setNewEndDate(""); setCreating(false);
  };

  const totalItems = CHECKLIST.length;

  return (
    <section aria-label="Panel de auditorías">
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:"0.75rem", marginBottom:"0.4rem" }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.6rem", margin:0, color:"var(--text-primary)" }}>Auditorías</h2>
          <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)", letterSpacing:"0.08em" }}>{audits.length} registradas</span>
        </div>
        <p style={{ color:"var(--text-secondary)", fontSize:"0.875rem", margin:0 }}>Gestiona auditorías de accesibilidad por dominio · {totalItems} ítems · WCAG 2.2 AA</p>
      </div>

      {creating ? (
        <div style={{ ...css.card, border:"1px solid color-mix(in srgb, var(--accent) 30%, transparent)", marginBottom:"1.5rem" }} role="form" aria-label="Nueva auditoría">
          <div style={{ fontSize:"0.8rem", color:"var(--accent)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>Nueva auditoría</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
            <div>
              <label htmlFor="audit-domain" style={{ fontSize:"0.75rem", color:"var(--text-label)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}>Dominio / URL</label>
              <input id="audit-domain" style={css.input} placeholder="https://shopnova.es" value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => e.key === "Enter" && doCreate()} autoFocus />
            </div>
            <div>
              <label htmlFor="audit-auditor" style={{ fontSize:"0.75rem", color:"var(--text-label)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}>Auditor/a</label>
              <input id="audit-auditor" style={css.input} placeholder="Nombre del auditor" value={newAuditor} onChange={e => setNewAuditor(e.target.value)} onKeyDown={e => e.key === "Enter" && doCreate()} />
            </div>
            <div>
              <label htmlFor="audit-start" style={{ fontSize:"0.75rem", color:"var(--text-label)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}>Fecha inicio</label>
              <input id="audit-start" type="date" style={css.input} value={newStartDate} onChange={e => setNewStartDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="audit-end" style={{ fontSize:"0.75rem", color:"var(--text-label)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}>Fecha fin prevista</label>
              <input id="audit-end" type="date" style={css.input} value={newEndDate} onChange={e => setNewEndDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            <button style={css.btnSolid()} onClick={doCreate}>Crear auditoría</button>
            <button style={css.btn("var(--text-secondary)")} onClick={() => setCreating(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button style={{ ...css.btnSolid(), marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.4rem" }} onClick={() => setCreating(true)}>
          + Nueva auditoría
        </button>
      )}

      {audits.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 2rem", color:"var(--text-secondary)", border:"1px dashed var(--border)", borderRadius:"8px" }}>
          <div style={{ fontSize:"2rem", marginBottom:"1rem" }} aria-hidden="true">📋</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.1rem", color:"var(--text-label)", marginBottom:"0.5rem" }}>Sin auditorías todavía</div>
          <div style={{ fontSize:"0.875rem" }}>Crea tu primera auditoría para comenzar</div>
        </div>
      ) : (
        <ul style={{ display:"grid", gap:"0.75rem", listStyle:"none", padding:0, margin:0 }}>
          {audits.map(audit => {
            const checks = Object.values(audit.checks || {});
            const total = CHECKLIST.length;
            const done = checks.filter(s => s !== "pending").length;
            const fails = checks.filter(s => s === "fail").length;
            const passes = checks.filter(s => s === "pass").length;
            const pct = Math.round((done / total) * 100);
            return (
              <li key={audit.id}>
                <button
                  onClick={() => onSelect(audit.id)}
                  aria-label={`${audit.domain} — ${pct}% completado, ${fails} fallan, ${passes} pasan`}
                  className="audit-card"
                  style={{ ...css.card, cursor:"pointer", width:"100%", textAlign:"left", display:"block" }}
                >
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", marginBottom:"0.25rem", color:"var(--text-primary)" }}>{audit.domain}</div>
                      <div style={{ fontSize:"0.8rem", color:"var(--text-secondary)", marginBottom:"0.75rem" }}>
                        {audit.auditor} · {formatDateRange(audit)} · WCAG 2.2 AA
                      </div>
                      <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
                        <span style={css.tag("var(--danger)")}>{fails} fallan</span>
                        <span style={css.tag("var(--success)")}>{passes} pasan</span>
                        <span style={css.tag("var(--text-secondary)")}>{total - done} pendientes</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.8rem", color: pct < 30 ? "var(--danger)" : pct < 70 ? "var(--warning)" : "var(--success)", lineHeight:1 }}>{pct}%</div>
                      <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", letterSpacing:"0.08em", marginTop:"0.25rem" }}>completado</div>
                    </div>
                  </div>
                  <div style={{ marginTop:"0.75rem", background:"var(--bg-input)", borderRadius:"3px", height:"5px", overflow:"hidden" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: ${pct}%`}>
                    <div style={{ height:"100%", width:`${pct}%`, background: pct < 30 ? "var(--danger)" : pct < 70 ? "var(--warning)" : "var(--success)", borderRadius:"3px", transition:"width 0.3s" }} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
