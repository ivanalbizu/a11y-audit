import { useState } from "react";
import { CHECKLIST } from "../data/checklist";
import { css } from "../styles/theme";

export default function Dashboard({ audits, onSelect, onCreate }) {
  const [newDomain, setNewDomain] = useState("");
  const [newAuditor, setNewAuditor] = useState("");
  const [creating, setCreating] = useState(false);

  const doCreate = () => {
    if (!newDomain.trim()) return;
    onCreate(newDomain.trim(), newAuditor.trim() || "Sin especificar");
    setNewDomain(""); setNewAuditor(""); setCreating(false);
  };

  const totalItems = CHECKLIST.length;

  return (
    <section aria-label="Panel de auditorías">
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:"0.75rem", marginBottom:"0.4rem" }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.6rem", margin:0, color:"#E8E8F0" }}>Auditorías</h2>
          <span style={{ fontSize:"0.8rem", color:"#A0A0B8", letterSpacing:"0.08em" }}>{audits.length} registradas</span>
        </div>
        <p style={{ color:"#A0A0B8", fontSize:"0.875rem", margin:0 }}>Gestiona auditorías de accesibilidad por dominio · {totalItems} ítems · WCAG 2.2 AA</p>
      </div>

      {creating ? (
        <div style={{ ...css.card, border:"1px solid rgba(232,255,71,0.3)", marginBottom:"1.5rem" }} role="form" aria-label="Nueva auditoría">
          <div style={{ fontSize:"0.8rem", color:"#E8FF47", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>Nueva auditoría</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
            <div>
              <label htmlFor="audit-domain" style={{ fontSize:"0.75rem", color:"#C0C0D0", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}>Dominio / URL</label>
              <input id="audit-domain" style={css.input} placeholder="https://shopnova.es" value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => e.key === "Enter" && doCreate()} autoFocus />
            </div>
            <div>
              <label htmlFor="audit-auditor" style={{ fontSize:"0.75rem", color:"#C0C0D0", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}>Auditor/a</label>
              <input id="audit-auditor" style={css.input} placeholder="Nombre del auditor" value={newAuditor} onChange={e => setNewAuditor(e.target.value)} onKeyDown={e => e.key === "Enter" && doCreate()} />
            </div>
          </div>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            <button style={css.btnSolid()} onClick={doCreate}>Crear auditoría</button>
            <button style={css.btn("#A0A0B8")} onClick={() => setCreating(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button style={{ ...css.btnSolid(), marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"0.4rem" }} onClick={() => setCreating(true)}>
          + Nueva auditoría
        </button>
      )}

      {audits.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 2rem", color:"#A0A0B8", border:"1px dashed #2A2A3E", borderRadius:"8px" }}>
          <div style={{ fontSize:"2rem", marginBottom:"1rem" }} aria-hidden="true">📋</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.1rem", color:"#C0C0D0", marginBottom:"0.5rem" }}>Sin auditorías todavía</div>
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
                  style={{ ...css.card, cursor:"pointer", transition:"border-color 0.15s", borderColor:"#2A2A3E", width:"100%", textAlign:"left", display:"block" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#3A3A50"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#2A2A3E"}
                >
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", marginBottom:"0.25rem", color:"#E8E8F0" }}>{audit.domain}</div>
                      <div style={{ fontSize:"0.8rem", color:"#A0A0B8", marginBottom:"0.75rem" }}>
                        {audit.auditor} · {new Date(audit.createdAt).toLocaleDateString("es-ES")} · WCAG 2.2 AA
                      </div>
                      <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
                        <span style={css.tag("#FF6B6B")}>{fails} fallan</span>
                        <span style={css.tag("#5ED67E")}>{passes} pasan</span>
                        <span style={css.tag("#A0A0B8")}>{total - done} pendientes</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.8rem", color: pct < 30 ? "#FF6B6B" : pct < 70 ? "#FFE066" : "#5ED67E", lineHeight:1 }}>{pct}%</div>
                      <div style={{ fontSize:"0.75rem", color:"#A0A0B8", letterSpacing:"0.08em", marginTop:"0.25rem" }}>completado</div>
                    </div>
                  </div>
                  <div style={{ marginTop:"0.75rem", background:"#161626", borderRadius:"3px", height:"5px", overflow:"hidden" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: ${pct}%`}>
                    <div style={{ height:"100%", width:`${pct}%`, background: pct < 30 ? "#FF6B6B" : pct < 70 ? "#FFE066" : "#5ED67E", borderRadius:"3px", transition:"width 0.3s" }} />
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
