import { useState } from "react";
import { CHECKLIST } from "../data/checklist";
import { SEV_CONFIG, EFFORT_CONFIG, STATUS_CONFIG, TIPO_CONFIG, AREAS } from "../data/config";
import { css } from "../styles/theme";
import { Badge, TipoBadge, StatusSelect } from "./StatusBadges";
import SummaryView from "./SummaryView";

export default function AuditView({ audit, onUpdate, onBack }) {
  const [filterArea, setFilterArea] = useState("Todas");
  const [filterSev, setFilterSev] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterTipo, setFilterTipo] = useState("todas");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState("checklist");

  const checks = audit.checks || {};
  const notes = audit.notes || {};

  const setStatus = (id, status) => onUpdate({ ...audit, checks: { ...checks, [id]: status } });
  const setNote = (id, note) => onUpdate({ ...audit, notes: { ...notes, [id]: note } });

  const filtered = CHECKLIST.filter(item => {
    if (filterArea !== "Todas" && item.area !== filterArea) return false;
    if (filterSev !== "todas" && item.sev !== filterSev) return false;
    if (filterStatus !== "todas" && (checks[item.id] || "pending") !== filterStatus) return false;
    if (filterTipo !== "todas" && item.tipo !== filterTipo) return false;
    if (search && !item.item.toLowerCase().includes(search.toLowerCase()) && !item.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const total = CHECKLIST.length;
  const statsByArea = AREAS.map(area => {
    const items = CHECKLIST.filter(i => i.area === area);
    const fails = items.filter(i => (checks[i.id]||"pending") === "fail").length;
    const passes = items.filter(i => (checks[i.id]||"pending") === "pass").length;
    const pending = items.filter(i => (checks[i.id]||"pending") === "pending").length;
    return { area, total:items.length, fails, passes, pending };
  });
  const totalFails = CHECKLIST.filter(i => (checks[i.id]||"pending") === "fail").length;
  const totalPasses = CHECKLIST.filter(i => (checks[i.id]||"pending") === "pass").length;
  const totalDone = CHECKLIST.filter(i => (checks[i.id]||"pending") !== "pending").length;
  const critFails = CHECKLIST.filter(i => i.sev === "critical" && (checks[i.id]||"pending") === "fail").length;

  const sectionLabel = `Sección de etiquetas para ${view === "checklist" ? "checklist" : "resumen"}`;

  return (
    <section aria-label={`Auditoría: ${audit.domain}`}>
      {/* Breadcrumb + title */}
      <nav aria-label="Navegación de auditoría" style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        <button style={{ ...css.btn("#A0A0B8"), padding:"0.3rem 0.75rem" }} onClick={onBack}>← Auditorías</button>
        <span aria-hidden="true" style={{ color:"#3A3A50" }}>·</span>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", margin:0 }}>{audit.domain}</h2>
        <span style={{ fontSize:"0.8rem", color:"#A0A0B8" }}>· {audit.auditor}</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:"0.5rem" }} role="tablist" aria-label="Vista de auditoría">
          <button role="tab" aria-selected={view==="checklist"} style={{ ...css.btn(view==="checklist"?"#E8FF47":"#7A7A94") }} onClick={() => setView("checklist")}>Checklist</button>
          <button role="tab" aria-selected={view==="summary"} style={{ ...css.btn(view==="summary"?"#E8FF47":"#7A7A94") }} onClick={() => setView("summary")}>Resumen</button>
        </div>
      </nav>

      {view === "summary" ? (
        <SummaryView audit={audit} checks={checks} statsByArea={statsByArea} totalFails={totalFails} totalPasses={totalPasses} totalDone={totalDone} critFails={critFails} total={total} />
      ) : (
        <>
          {/* Quick stats bar */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.25rem" }} role="group" aria-label="Resumen rápido">
            {[
              { label:"Fallan", val:totalFails, color:"#FF6B6B" },
              { label:"Pasan", val:totalPasses, color:"#5ED67E" },
              { label:"Pendientes", val:total-totalDone, color:"#A0A0B8" },
              { label:"Críticos con fallo", val:critFails, color:"#FF6B6B" },
            ].map(s => (
              <div key={s.label} style={{ ...css.card, padding:"0.9rem", textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.6rem", color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:"0.75rem", color:"#A0A0B8", letterSpacing:"0.06em", marginTop:"0.3rem", textTransform:"uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ ...css.card, padding:"0.75rem 1rem", marginBottom:"1rem", display:"flex", gap:"0.5rem", flexWrap:"wrap", alignItems:"center" }} role="search" aria-label="Filtros del checklist">
            <input style={{ ...css.input, width:"200px", padding:"0.4rem 0.65rem" }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Buscar ítems" />
            <select style={css.select} value={filterArea} onChange={e => setFilterArea(e.target.value)} aria-label="Filtrar por área">
              <option value="Todas">Todas las áreas</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select style={css.select} value={filterSev} onChange={e => setFilterSev(e.target.value)} aria-label="Filtrar por severidad">
              <option value="todas">Todas las sev.</option>
              {Object.entries(SEV_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select style={css.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filtrar por estado">
              <option value="todas">Todos los estados</option>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select style={css.select} value={filterTipo} onChange={e => setFilterTipo(e.target.value)} aria-label="Filtrar por tipo">
              <option value="todas">Todos los tipos</option>
              {Object.entries(TIPO_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span style={{ fontSize:"0.8rem", color:"#A0A0B8", marginLeft:"auto" }} aria-live="polite">{filtered.length} ítems</span>
          </div>

          {/* Checklist items */}
          <div style={{ display:"flex", flexDirection:"column", gap:"4px" }} role="list" aria-label="Ítems del checklist">
            {filtered.map(item => {
              const status = checks[item.id] || "pending";
              const isOpen = expanded === item.id;
              const detailsId = `details-${item.id}`;
              return (
                <div key={item.id} role="listitem" style={{ background:"#10101C", border:`1px solid ${isOpen ? "#3A3A50" : "#2A2A3E"}`, borderRadius:"6px", overflow:"hidden", transition:"border-color 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.65rem 1rem" }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      aria-controls={detailsId}
                      aria-label={`${item.id}: ${item.item}`}
                      style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.75rem", flex:1, padding:0, textAlign:"left", color:"inherit", minWidth:0 }}
                    >
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", color:"#E8FF47", width:"68px", flexShrink:0 }}>{item.id}</span>
                      <Badge sev={item.sev} />
                      <TipoBadge tipo={item.tipo} />
                      <span style={{ flex:1, fontSize:"0.875rem", color: status==="fail"?"#FF6B6B": status==="pass"?"#5ED67E":"#E8E8F0", minWidth:0, overflow:"hidden", textOverflow:"ellipsis" }}>{item.item}</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", color:"#6CB4FF", flexShrink:0 }}>{item.wcag !== "—" ? item.wcag : ""}</span>
                      <span aria-hidden="true" style={{ color:"#7A7A94", fontSize:"0.8rem", flexShrink:0 }}>{isOpen ? "▲" : "▼"}</span>
                    </button>
                    <div onClick={e => e.stopPropagation()}>
                      <StatusSelect value={status} onChange={v => setStatus(item.id, v)} />
                    </div>
                  </div>

                  {isOpen && (
                    <div id={detailsId} style={{ borderTop:"1px solid #2A2A3E", padding:"1rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                      <div>
                        <h4 style={{ fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem", margin:0, fontWeight:600 }}>Descripción / Cómo revisar</h4>
                        <p style={{ fontSize:"0.875rem", lineHeight:1.7, color:"#D0D0E0", margin:"0.4rem 0 0" }}>{item.desc}</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem", margin:0, fontWeight:600 }}>Recomendación / Fix</h4>
                        <pre style={{ fontSize:"0.8rem", lineHeight:1.6, color:"#5ED67E", margin:"0.4rem 0 0", background:"#0A0A12", padding:"0.65rem 0.8rem", borderRadius:"4px", overflowX:"auto", whiteSpace:"pre-wrap", fontFamily:"'DM Mono',monospace" }}>{item.fix}</pre>
                      </div>
                      <div>
                        <h4 style={{ fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem", margin:0, fontWeight:600 }}>Herramienta sugerida</h4>
                        <span style={{ fontSize:"0.875rem", color:"#6CB4FF" }}>{item.tool}</span>
                      </div>
                      <div>
                        <h4 style={{ fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem", margin:0, fontWeight:600 }}>Equipo · Esfuerzo · Afecta a</h4>
                        <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginTop:"0.4rem" }}>
                          <span style={css.tag("#C88AFF")}>{item.team}</span>
                          <span style={css.tag(EFFORT_CONFIG[item.effort]?.color || "#A0A0B8")}>{EFFORT_CONFIG[item.effort]?.label}</span>
                          <span style={css.tag("#A0A0B8")}>{item.who}</span>
                        </div>
                      </div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label htmlFor={`notes-${item.id}`} style={{ fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:"0.4rem", fontWeight:600 }}>Notas / Evidencia</label>
                        <textarea
                          id={`notes-${item.id}`}
                          value={notes[item.id] || ""}
                          onChange={e => setNote(item.id, e.target.value)}
                          placeholder="Escribe el selector afectado, URL, ratio encontrado, descripción del error..."
                          style={{ ...css.input, height:"70px", resize:"vertical" }}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
