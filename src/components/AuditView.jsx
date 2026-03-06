import { useState } from "react";
import { CHECKLIST } from "../data/checklist";
import { SEV_CONFIG, EFFORT_CONFIG, STATUS_CONFIG, TIPO_CONFIG, NIVEL_CONFIG, AREAS } from "../data/config";
import { css } from "../styles/theme";
import { Badge, TipoBadge, NivelBadge, StatusSelect } from "./StatusBadges";
import SummaryView from "./SummaryView";
import { getWcagUrls } from "../data/wcagLinks";
import VersionsView from "./VersionsView";
import GlossaryView from "./GlossaryView";
import { checkStorageCapacity, getStorageSizeMB, exportSingleAudit } from "../utils/storage";

const EMPTY_CUSTOM_ITEM = { item:"", area:"Perceivable", cat:"", wcag:"—", nivel:"A", sev:"medium", tipo:"manual", effort:"medium", who:"", desc:"", fix:"", team:"" };

export default function AuditView({ audit, onUpdate, onBack }) {
  const [filterArea, setFilterArea] = useState("Todas");
  const [filterSev, setFilterSev] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterTipo, setFilterTipo] = useState("todas");
  const [filterNivel, setFilterNivel] = useState("todas");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState("checklist");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_CUSTOM_ITEM);

  const customItems = audit.customItems || [];
  const allItems = [...CHECKLIST, ...customItems];
  const customIds = new Set(customItems.map(i => i.id));

  const checks = audit.checks || {};
  const notes = audit.notes || {};

  const setStatus = (id, status) => onUpdate({ ...audit, checks: { ...checks, [id]: status } });
  const setNote = (id, note) => onUpdate({ ...audit, notes: { ...notes, [id]: note } });
  const screenshots = audit.screenshots || {};

  const handleFileUpload = (itemId, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 500 * 1024) {
      alert("Imagen demasiado grande. Máximo 500 KB por captura.");
      return;
    }
    const capacity = checkStorageCapacity();
    if (capacity === "full") {
      alert("Almacenamiento lleno. Elimina capturas o exporta datos.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = { ...screenshots };
      const itemShots = [...(updated[itemId] || [])];
      itemShots.push({ id: `ss-${Date.now()}`, data: e.target.result, name: file.name || "captura.png", addedAt: new Date().toISOString() });
      updated[itemId] = itemShots;
      onUpdate({ ...audit, screenshots: updated });
      if (capacity === "warning") {
        alert(`Aviso: Almacenamiento al ${getStorageSizeMB()} MB. Considera exportar datos.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (itemId, e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const clipItem of items) {
      if (clipItem.type.startsWith("image/")) {
        e.preventDefault();
        handleFileUpload(itemId, clipItem.getAsFile());
        break;
      }
    }
  };

  const deleteScreenshot = (itemId, ssId) => {
    const updated = { ...screenshots };
    updated[itemId] = (updated[itemId] || []).filter(s => s.id !== ssId);
    if (updated[itemId].length === 0) delete updated[itemId];
    onUpdate({ ...audit, screenshots: updated });
  };

  const addCustomItem = () => {
    if (!newItem.item.trim()) { alert("La descripción es obligatoria."); return; }
    const item = { ...newItem, id: `CUST-${crypto.randomUUID()}`, item: newItem.item.trim() };
    onUpdate({ ...audit, customItems: [...customItems, item] });
    setNewItem(EMPTY_CUSTOM_ITEM);
    setShowAddForm(false);
  };

  const deleteCustomItem = (id) => {
    if (!window.confirm("¿Eliminar este ítem personalizado?")) return;
    const updatedCustom = customItems.filter(i => i.id !== id);
    const updatedChecks = { ...checks };
    const updatedNotes = { ...notes };
    const updatedScreenshots = { ...screenshots };
    delete updatedChecks[id];
    delete updatedNotes[id];
    delete updatedScreenshots[id];
    onUpdate({ ...audit, customItems: updatedCustom, checks: updatedChecks, notes: updatedNotes, screenshots: updatedScreenshots });
  };

  const filtered = allItems.filter(item => {
    if (filterArea !== "Todas" && item.area !== filterArea) return false;
    if (filterSev !== "todas" && item.sev !== filterSev) return false;
    if (filterStatus !== "todas" && (checks[item.id] || "pending") !== filterStatus) return false;
    if (filterTipo !== "todas" && item.tipo !== filterTipo) return false;
    if (filterNivel !== "todas" && item.nivel !== filterNivel) return false;
    if (search && !item.item.toLowerCase().includes(search.toLowerCase()) && !item.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const total = allItems.length;
  const statsByArea = AREAS.map(area => {
    const items = allItems.filter(i => i.area === area);
    const fails = items.filter(i => (checks[i.id]||"pending") === "fail").length;
    const passes = items.filter(i => (checks[i.id]||"pending") === "pass").length;
    const pending = items.filter(i => (checks[i.id]||"pending") === "pending").length;
    return { area, total:items.length, fails, passes, pending };
  });
  const totalFails = allItems.filter(i => (checks[i.id]||"pending") === "fail").length;
  const totalPasses = allItems.filter(i => (checks[i.id]||"pending") === "pass").length;
  const totalDone = allItems.filter(i => (checks[i.id]||"pending") !== "pending").length;
  const critFails = allItems.filter(i => i.sev === "critical" && (checks[i.id]||"pending") === "fail").length;


  return (
    <section aria-label={`Auditoría: ${audit.domain}`}>
      {/* Breadcrumb + title */}
      <nav aria-label="Navegación de auditoría" style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        <button style={{ ...css.btn("#A0A0B8"), padding:"0.3rem 0.75rem" }} onClick={onBack}>← Auditorías</button>
        <span aria-hidden="true" style={{ color:"#3A3A50" }}>·</span>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", margin:0 }}>{audit.domain}</h2>
        <span style={{ fontSize:"0.8rem", color:"#A0A0B8" }}>· {audit.auditor}</span>
        <span aria-hidden="true" style={{ color:"#3A3A50" }}>·</span>
        <div style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
          <input type="date" value={audit.startDate || ""} onChange={e => onUpdate({ ...audit, startDate: e.target.value || null })} style={{ ...css.input, width:"130px", padding:"0.2rem 0.4rem", fontSize:"0.75rem" }} aria-label="Fecha de inicio" />
          <span style={{ color:"#3A3A50", fontSize:"0.8rem" }}>→</span>
          <input type="date" value={audit.endDate || ""} onChange={e => onUpdate({ ...audit, endDate: e.target.value || null })} style={{ ...css.input, width:"130px", padding:"0.2rem 0.4rem", fontSize:"0.75rem" }} aria-label="Fecha de fin" />
        </div>
        <button style={{ ...css.btn("#6CB4FF"), padding:"0.25rem 0.6rem", fontSize:"0.75rem" }} onClick={() => exportSingleAudit(audit)} aria-label="Exportar esta auditoría como JSON">↓ Exportar</button>
        <div style={{ marginLeft:"auto", display:"flex", gap:"0.5rem" }} role="tablist" aria-label="Vista de auditoría">
          <button role="tab" aria-selected={view==="checklist"} style={{ ...css.btn(view==="checklist"?"#E8FF47":"#7A7A94") }} onClick={() => setView("checklist")}>Checklist</button>
          <button role="tab" aria-selected={view==="summary"} style={{ ...css.btn(view==="summary"?"#E8FF47":"#7A7A94") }} onClick={() => setView("summary")}>Resumen</button>
          <button role="tab" aria-selected={view==="versions"} style={{ ...css.btn(view==="versions"?"#E8FF47":"#7A7A94") }} onClick={() => setView("versions")}>Versiones{(audit.versions || []).length > 0 ? ` (${(audit.versions || []).length})` : ""}</button>
          <button role="tab" aria-selected={view==="glossary"} style={{ ...css.btn(view==="glossary"?"#E8FF47":"#7A7A94") }} onClick={() => setView("glossary")}>Glosario</button>
        </div>
      </nav>

      {view === "glossary" ? (
        <GlossaryView />
      ) : view === "versions" ? (
        <VersionsView audit={audit} onUpdate={onUpdate} allItems={allItems} />
      ) : view === "summary" ? (
        <SummaryView audit={audit} checks={checks} statsByArea={statsByArea} totalFails={totalFails} totalPasses={totalPasses} totalDone={totalDone} critFails={critFails} total={total} allItems={allItems} />
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
            <select style={css.select} value={filterNivel} onChange={e => setFilterNivel(e.target.value)} aria-label="Filtrar por nivel WCAG">
              <option value="todas">Todos los niveles</option>
              {Object.entries(NIVEL_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span style={{ fontSize:"0.8rem", color:"#A0A0B8", marginLeft:"auto" }} aria-live="polite">{filtered.length} ítems</span>
          </div>

          {/* Add custom item */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
            <span style={{ fontSize:"0.8rem", color:"#7A7A94" }}>{customItems.length > 0 ? `${customItems.length} ítem(s) personalizado(s)` : ""}</span>
            <button style={css.btnSolid("#C88AFF")} onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancelar" : "+ Añadir ítem"}
            </button>
          </div>
          {showAddForm && (
            <div style={{ ...css.card, marginBottom:"1rem", padding:"1rem" }}>
              <h4 style={{ fontSize:"0.8rem", color:"#C88AFF", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, margin:"0 0 0.75rem" }}>Nuevo ítem personalizado</h4>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Descripción *</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })} placeholder="Descripción del ítem de checklist" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Área</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.area} onChange={e => setNewItem({ ...newItem, area: e.target.value })}>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Categoría</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.cat} onChange={e => setNewItem({ ...newItem, cat: e.target.value })} placeholder="Ej: Formularios" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Criterio WCAG</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.wcag} onChange={e => setNewItem({ ...newItem, wcag: e.target.value })} placeholder="1.1.1 o —" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Nivel</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.nivel} onChange={e => setNewItem({ ...newItem, nivel: e.target.value })}>
                    <option value="A">A</option><option value="AA">AA</option><option value="AAA">AAA</option><option value="—">—</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Severidad</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.sev} onChange={e => setNewItem({ ...newItem, sev: e.target.value })}>
                    {Object.entries(SEV_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Tipo</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.tipo} onChange={e => setNewItem({ ...newItem, tipo: e.target.value })}>
                    {Object.entries(TIPO_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Esfuerzo</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.effort} onChange={e => setNewItem({ ...newItem, effort: e.target.value })}>
                    <option value="low">Bajo</option><option value="medium">Medio</option><option value="high">Alto</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Equipo</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.team} onChange={e => setNewItem({ ...newItem, team: e.target.value })} placeholder="Frontend" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Afecta a</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.who} onChange={e => setNewItem({ ...newItem, who: e.target.value })} placeholder="Ciegos, Motor..." />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Descripción detallada</label>
                  <textarea style={{ ...css.input, marginTop:"0.2rem", fieldSizing:"content", minHeight:"50px", resize:"vertical" }} value={newItem.desc} onChange={e => setNewItem({ ...newItem, desc: e.target.value })} placeholder="Cómo revisar este ítem..." />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"0.7rem", color:"#A0A0B8", textTransform:"uppercase" }}>Recomendación / Fix</label>
                  <textarea style={{ ...css.input, marginTop:"0.2rem", fieldSizing:"content", minHeight:"50px", resize:"vertical" }} value={newItem.fix} onChange={e => setNewItem({ ...newItem, fix: e.target.value })} placeholder="Código o instrucciones de corrección..." />
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.75rem", justifyContent:"flex-end" }}>
                <button style={css.btn("#7A7A94")} onClick={() => { setShowAddForm(false); setNewItem(EMPTY_CUSTOM_ITEM); }}>Cancelar</button>
                <button style={css.btnSolid()} onClick={addCustomItem}>Guardar ítem</button>
              </div>
            </div>
          )}

          {/* Checklist table with aligned columns */}
          {(() => {
            const gridCols = "72px 68px 80px 1fr 42px 82px 24px 114px";
            const hdrStyle = { fontSize:"0.7rem", color:"#7A7A94", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, fontFamily:"'DM Mono',monospace" };
            return (
              <div role="table" aria-label="Ítems del checklist">
                {/* Sticky header */}
                <div role="row" style={{ display:"grid", gridTemplateColumns:gridCols, gap:"0 0.75rem", alignItems:"center", padding:"0.5rem 1rem", position:"sticky", top:0, zIndex:10, background:"#0A0A12", borderBottom:"2px solid #2A2A3E", marginBottom:"4px" }}>
                  <span role="columnheader" style={hdrStyle}>ID</span>
                  <span role="columnheader" style={hdrStyle}>Sev.</span>
                  <span role="columnheader" style={hdrStyle}>Tipo</span>
                  <span role="columnheader" style={hdrStyle}>Descripción</span>
                  <span role="columnheader" style={hdrStyle}>Nivel</span>
                  <span role="columnheader" style={hdrStyle}>WCAG</span>
                  <span role="columnheader" style={hdrStyle} aria-hidden="true"></span>
                  <span role="columnheader" style={hdrStyle}>Estado</span>
                </div>

                {/* Rows */}
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  {filtered.map(item => {
                    const status = checks[item.id] || "pending";
                    const isOpen = expanded === item.id;
                    const detailsId = `details-${item.id}`;
                    const wcagUrls = getWcagUrls(item.wcag);
                    return (
                      <div key={item.id} role="row" style={{ background:"#10101C", border:`1px solid ${isOpen ? "#3A3A50" : "#2A2A3E"}`, borderRadius:"6px", overflow:"hidden", transition:"border-color 0.15s" }}>
                        <div
                          style={{ display:"grid", gridTemplateColumns:gridCols, gap:"0 0.75rem", alignItems:"center", padding:"0.65rem 1rem", cursor:"pointer" }}
                          onClick={() => setExpanded(isOpen ? null : item.id)}
                        >
                          <span role="cell" style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", color: customIds.has(item.id) ? "#C88AFF" : "#E8FF47", display:"flex", alignItems:"center", gap:"0.25rem" }}>
                            {customIds.has(item.id) ? "CUST" : item.id}
                          </span>
                          <span role="cell"><Badge sev={item.sev} /></span>
                          <span role="cell"><TipoBadge tipo={item.tipo} /></span>
                          <span role="cell" style={{ fontSize:"0.875rem", color: status==="fail"?"#FF6B6B": status==="pass"?"#5ED67E":"#E8E8F0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0 }}>{item.item}</span>
                          <span role="cell"><NivelBadge nivel={item.nivel} /></span>
                          <span role="cell" style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem" }} onClick={e => e.stopPropagation()}>
                            {item.wcag !== "—" && (
                              wcagUrls ? wcagUrls.map((w, i) => (
                                <span key={w.criterion}>{i > 0 && <span style={{ color:"#888" }}> / </span>}<a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color:"#6CB4FF", textDecoration:"none" }} aria-label={`WCAG ${w.criterion} — ver normativa`}>{w.criterion}&thinsp;↗</a></span>
                              )) : (
                                <span style={{ color:"#6CB4FF" }}>{item.wcag}</span>
                              )
                            )}
                          </span>
                          <button
                            aria-expanded={isOpen}
                            aria-controls={detailsId}
                            aria-label={`${item.id}: ${item.item}`}
                            onClick={e => { e.stopPropagation(); setExpanded(isOpen ? null : item.id); }}
                            style={{ background:"none", border:"none", cursor:"pointer", color:"#7A7A94", fontSize:"0.8rem", padding:0, display:"flex", alignItems:"center", justifyContent:"center" }}
                          >
                            {isOpen ? "▲" : "▼"}
                          </button>
                          <span role="cell" onClick={e => e.stopPropagation()}>
                            <StatusSelect value={status} onChange={v => setStatus(item.id, v)} />
                          </span>
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
                              <h4 style={{ fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem", margin:0, fontWeight:600 }}>Criterio WCAG</h4>
                              {wcagUrls ? (
                                <span style={{ fontSize:"0.875rem" }}>
                                  {wcagUrls.map((w, i) => (
                                    <span key={w.criterion}>{i > 0 && <span style={{ color:"#888" }}> · </span>}<a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color:"#6CB4FF", textDecoration:"underline" }}>WCAG {w.criterion} ({item.nivel}) — Understanding ↗</a></span>
                                  ))}
                                </span>
                              ) : (
                                <span style={{ fontSize:"0.875rem", color:"#A0A0B8" }}>{item.wcag}</span>
                              )}
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
                            {customIds.has(item.id) && (
                              <div style={{ gridColumn:"1/-1", display:"flex", justifyContent:"flex-end" }}>
                                <button style={{ ...css.btn("#FF6B6B"), padding:"0.25rem 0.6rem", fontSize:"0.75rem" }} onClick={() => deleteCustomItem(item.id)}>Eliminar ítem personalizado</button>
                              </div>
                            )}
                            <div style={{ gridColumn:"1/-1" }}>
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.4rem" }}>
                                <label htmlFor={`notes-${item.id}`} style={{ fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600 }}>Notas / Evidencia</label>
                                <label style={{ ...css.btn("#6CB4FF"), cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"0.3rem", padding:"0.25rem 0.6rem", fontSize:"0.75rem" }}>
                                  Adjuntar captura
                                  <input type="file" accept="image/*" style={{ position:"absolute", width:"1px", height:"1px", overflow:"hidden", clip:"rect(0,0,0,0)" }}
                                    onChange={e => { handleFileUpload(item.id, e.target.files[0]); e.target.value = ""; }}
                                  />
                                </label>
                              </div>
                              <textarea
                                id={`notes-${item.id}`}
                                value={notes[item.id] || ""}
                                onChange={e => setNote(item.id, e.target.value)}
                                onPaste={e => handlePaste(item.id, e)}
                                placeholder="Escribe notas o pega capturas con Ctrl+V..."
                                style={{ ...css.input, fieldSizing:"content", minHeight:"70px", resize:"vertical" }}
                                onClick={e => e.stopPropagation()}
                              />
                              {(screenshots[item.id] || []).length > 0 && (
                                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginTop:"0.5rem" }}>
                                  {screenshots[item.id].map(ss => (
                                    <div key={ss.id} style={{ position:"relative", border:"1px solid #3A3A50", borderRadius:"4px", overflow:"hidden" }}>
                                      <img src={ss.data} alt={ss.name} style={{ width:"120px", height:"80px", objectFit:"cover", display:"block", cursor:"pointer" }}
                                        onClick={() => window.open(ss.data, "_blank")}
                                      />
                                      <button
                                        onClick={() => deleteScreenshot(item.id, ss.id)}
                                        style={{ position:"absolute", top:"2px", right:"2px", background:"rgba(10,10,18,0.85)", border:"1px solid #FF6B6B", color:"#FF6B6B", borderRadius:"50%", width:"20px", height:"20px", cursor:"pointer", fontSize:"0.7rem", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}
                                        aria-label={`Eliminar captura ${ss.name}`}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </section>
  );
}
