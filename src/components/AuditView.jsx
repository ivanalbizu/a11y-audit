import { useState } from "react";
import { CHECKLIST } from "../data/checklist";
import { SEV_CONFIG, EFFORT_CONFIG, STATUS_CONFIG, TIPO_CONFIG, NIVEL_CONFIG, AREAS, DEFAULT_SCOPES, SCOPE_COLORS } from "../data/config";
import { css } from "../styles/theme";
import { Badge, TipoBadge, NivelBadge, StatusSelect } from "./StatusBadges";
import SummaryView from "./SummaryView";
import { getWcagUrls } from "../data/wcagLinks";
import VersionsView from "./VersionsView";
import GlossaryView from "./GlossaryView";
import { checkStorageCapacity, getStorageSizeMB, exportSingleAudit } from "../utils/storage";
import { getStatus, getScope, setCheckStatus, setCheckScope, isInherited } from "../utils/checks";

const EMPTY_CUSTOM_ITEM = { item:"", area:"Perceivable", cat:"", wcag:"—", nivel:"A", sev:"medium", tipo:"manual", effort:"medium", who:"", desc:"", fix:"", team:"" };

// Extracted styles for elements rendered inside .map() loops (avoids re-creating objects per render)
const GRID_COLS = "72px 68px 80px 1fr 42px 82px 24px 114px 90px";
const S = {
  hdr: { fontSize:"0.7rem", color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, fontFamily:"'DM Mono',monospace" },
  headerRow: { display:"grid", gridTemplateColumns:GRID_COLS, gap:"0 0.75rem", alignItems:"center", padding:"0.5rem 1rem", position:"sticky", top:0, zIndex:10, background:"var(--bg-main)", borderBottom:"2px solid var(--border)", marginBottom:"4px" },
  rowGrid: { display:"grid", gridTemplateColumns:GRID_COLS, gap:"0 0.75rem", alignItems:"center", padding:"0.65rem 1rem", cursor:"pointer" },
  cellId: { fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", display:"flex", alignItems:"center", gap:"0.25rem" },
  cellWcag: { fontFamily:"'DM Mono',monospace", fontSize:"0.75rem" },
  wcagLink: { color:"var(--accent-blue)", textDecoration:"none" },
  wcagText: { color:"var(--accent-blue)" },
  wcagSep: { color:"var(--text-tertiary)" },
  expandBtn: { background:"none", border:"none", cursor:"pointer", color:"var(--text-tertiary)", fontSize:"0.8rem", padding:0, display:"flex", alignItems:"center", justifyContent:"center" },
  detailPanel: { borderTop:"1px solid var(--border)", padding:"1rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" },
  detailH4: { fontSize:"0.75rem", color:"var(--text-label)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem", margin:0, fontWeight:600 },
  detailDesc: { fontSize:"0.875rem", lineHeight:1.7, color:"var(--text-primary)", margin:"0.4rem 0 0" },
  detailFix: { fontSize:"0.8rem", lineHeight:1.6, color:"var(--success)", margin:"0.4rem 0 0", background:"var(--bg-main)", padding:"0.65rem 0.8rem", borderRadius:"4px", overflowX:"auto", whiteSpace:"pre-wrap", fontFamily:"'DM Mono',monospace" },
  detailTool: { fontSize:"0.875rem", color:"var(--accent-blue)" },
  detailWcagFallback: { fontSize:"0.875rem", color:"var(--text-secondary)" },
  detailWcagLink: { color:"var(--accent-blue)", textDecoration:"underline" },
  ssThumb: { width:"120px", height:"80px", objectFit:"cover", display:"block", cursor:"pointer" },
  ssDeleteBtn: { position:"absolute", top:"2px", right:"2px", background:"var(--bg-main)", border:"1px solid var(--danger)", color:"var(--danger)", borderRadius:"50%", width:"20px", height:"20px", cursor:"pointer", fontSize:"0.7rem", display:"flex", alignItems:"center", justifyContent:"center", padding:0 },
  ssContainer: { position:"relative", border:"1px solid var(--border-hover)", borderRadius:"4px", overflow:"hidden" },
  statVal: { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.6rem", lineHeight:1 },
  statLabel: { fontSize:"0.75rem", color:"var(--text-secondary)", letterSpacing:"0.06em", marginTop:"0.3rem", textTransform:"uppercase" },
  labelStyle: { fontSize:"0.75rem", color:"var(--text-label)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600 },
};

export default function AuditView({ audit, onUpdate, onBack }) {
  const [filterArea, setFilterArea] = useState("Todas");
  const [filterSev, setFilterSev] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterTipo, setFilterTipo] = useState("todas");
  const [filterNivel, setFilterNivel] = useState("todas");
  const [filterScope, setFilterScope] = useState("todas");
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

  const allScopes = [...DEFAULT_SCOPES, ...(audit.customScopes || [])];
  const [newScopeName, setNewScopeName] = useState("");

  const setStatus = (id, status) => onUpdate({ ...audit, checks: setCheckStatus(checks, id, status) });
  const setScopeForItem = (id, scope) => onUpdate({ ...audit, checks: setCheckScope(checks, id, scope) });
  const setNote = (id, note) => onUpdate({ ...audit, notes: { ...notes, [id]: note } });
  const screenshots = audit.screenshots || {};

  const compressImage = (file, maxW = 1200, quality = 0.7) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", quality));
    };
    img.src = URL.createObjectURL(file);
  });

  const handleFileUpload = async (itemId, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const capacity = checkStorageCapacity();
    if (capacity === "full") {
      alert("Almacenamiento lleno. Elimina capturas o exporta datos.");
      return;
    }
    const data = await compressImage(file);
    const updated = { ...screenshots };
    const itemShots = [...(updated[itemId] || [])];
    itemShots.push({ id: `ss-${crypto.randomUUID()}`, data, name: file.name || "captura.webp", addedAt: new Date().toISOString() });
    updated[itemId] = itemShots;
    onUpdate({ ...audit, screenshots: updated });
    if (capacity === "warning") {
      alert(`Aviso: Almacenamiento al ${getStorageSizeMB()} MB. Considera exportar datos.`);
    }
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
    if (filterStatus !== "todas" && (getStatus(checks, item.id)) !== filterStatus) return false;
    if (filterTipo !== "todas" && item.tipo !== filterTipo) return false;
    if (filterNivel !== "todas" && item.nivel !== filterNivel) return false;
    if (filterScope !== "todas") {
      const sc = getScope(checks, item.id);
      if (filterScope === "sin-scope" && sc !== null) return false;
      if (filterScope !== "sin-scope" && sc !== filterScope) return false;
    }
    if (search && !item.item.toLowerCase().includes(search.toLowerCase()) && !item.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const total = allItems.length;
  const statsByArea = AREAS.map(area => {
    const items = allItems.filter(i => i.area === area);
    const fails = items.filter(i => getStatus(checks, i.id) === "fail").length;
    const passes = items.filter(i => getStatus(checks, i.id) === "pass").length;
    const pending = items.filter(i => getStatus(checks, i.id) === "pending").length;
    return { area, total:items.length, fails, passes, pending };
  });
  const totalFails = allItems.filter(i => getStatus(checks, i.id) === "fail").length;
  const totalPasses = allItems.filter(i => getStatus(checks, i.id) === "pass").length;
  const totalDone = allItems.filter(i => getStatus(checks, i.id) !== "pending").length;
  const critFails = allItems.filter(i => i.sev === "critical" && getStatus(checks, i.id) === "fail").length;


  return (
    <section aria-label={`Auditoría: ${audit.domain}`}>
      {/* Breadcrumb + title */}
      <nav aria-label="Navegación de auditoría" style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        <button style={{ ...css.btn("var(--text-secondary)"), padding:"0.3rem 0.75rem" }} onClick={onBack}>← Auditorías</button>
        <span aria-hidden="true" style={{ color:"var(--border-hover)" }}>·</span>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", margin:0 }}>{audit.domain}</h2>
        <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)" }}>· {audit.auditor}</span>
        <span aria-hidden="true" style={{ color:"var(--border-hover)" }}>·</span>
        <div style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
          <label htmlFor="audit-start-date" style={{ fontSize:"0.7rem", color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Inicio</label>
          <input id="audit-start-date" type="date" value={audit.startDate || ""} onChange={e => onUpdate({ ...audit, startDate: e.target.value || null })} style={{ ...css.input, width:"130px", padding:"0.2rem 0.4rem", fontSize:"0.75rem" }} />
          <span style={{ color:"var(--border-hover)", fontSize:"0.8rem" }}>→</span>
          <label htmlFor="audit-end-date" style={{ fontSize:"0.7rem", color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Fin</label>
          <input id="audit-end-date" type="date" value={audit.endDate || ""} onChange={e => onUpdate({ ...audit, endDate: e.target.value || null })} style={{ ...css.input, width:"130px", padding:"0.2rem 0.4rem", fontSize:"0.75rem" }} />
        </div>
        <button style={{ ...css.btn("var(--accent-blue)"), padding:"0.25rem 0.6rem", fontSize:"0.75rem" }} onClick={() => exportSingleAudit(audit)} aria-label="Exportar esta auditoría como JSON">↓ Exportar</button>
        <div style={{ marginLeft:"auto", display:"flex", gap:"0.5rem" }} role="tablist" aria-label="Vista de auditoría">
          <button role="tab" id="tab-checklist" aria-selected={view==="checklist"} aria-controls="panel-checklist" style={{ ...css.btn(view==="checklist"?"var(--accent)":"var(--text-tertiary)") }} onClick={() => setView("checklist")}>Checklist</button>
          <button role="tab" id="tab-summary" aria-selected={view==="summary"} aria-controls="panel-summary" style={{ ...css.btn(view==="summary"?"var(--accent)":"var(--text-tertiary)") }} onClick={() => setView("summary")}>Resumen</button>
          <button role="tab" id="tab-versions" aria-selected={view==="versions"} aria-controls="panel-versions" style={{ ...css.btn(view==="versions"?"var(--accent)":"var(--text-tertiary)") }} onClick={() => setView("versions")}>Versiones{(audit.versions || []).length > 0 ? ` (${(audit.versions || []).length})` : ""}</button>
          <button role="tab" id="tab-glossary" aria-selected={view==="glossary"} aria-controls="panel-glossary" style={{ ...css.btn(view==="glossary"?"var(--accent)":"var(--text-tertiary)") }} onClick={() => setView("glossary")}>Glosario</button>
        </div>
      </nav>

      {view === "glossary" ? (
        <div role="tabpanel" id="panel-glossary" aria-labelledby="tab-glossary"><GlossaryView /></div>
      ) : view === "versions" ? (
        <div role="tabpanel" id="panel-versions" aria-labelledby="tab-versions"><VersionsView audit={audit} onUpdate={onUpdate} allItems={allItems} /></div>
      ) : view === "summary" ? (
        <div role="tabpanel" id="panel-summary" aria-labelledby="tab-summary"><SummaryView audit={audit} checks={checks} statsByArea={statsByArea} totalFails={totalFails} totalPasses={totalPasses} totalDone={totalDone} critFails={critFails} total={total} allItems={allItems} /></div>
      ) : (
        <div role="tabpanel" id="panel-checklist" aria-labelledby="tab-checklist">
          {/* Quick stats bar */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.25rem" }} role="group" aria-label="Resumen rápido">
            {[
              { label:"Fallan", val:totalFails, color:"var(--danger)" },
              { label:"Pasan", val:totalPasses, color:"var(--success)" },
              { label:"Pendientes", val:total-totalDone, color:"var(--text-secondary)" },
              { label:"Críticos con fallo", val:critFails, color:"var(--danger)" },
            ].map(s => (
              <div key={s.label} style={{ ...css.card, padding:"0.9rem", textAlign:"center" }}>
                <div style={{ ...S.statVal, color:s.color }}>{s.val}</div>
                <div style={S.statLabel}>{s.label}</div>
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
            <select style={css.select} value={filterScope} onChange={e => setFilterScope(e.target.value)} aria-label="Filtrar por scope">
              <option value="todas">Todos los scopes</option>
              <option value="sin-scope">Sin scope</option>
              {allScopes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display:"flex", gap:"0.25rem", alignItems:"center" }}>
              <input
                style={{ ...css.input, width:"100px", padding:"0.3rem 0.5rem", fontSize:"0.75rem" }}
                placeholder="Nuevo scope..."
                value={newScopeName}
                onChange={e => setNewScopeName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newScopeName.trim()) {
                    const name = newScopeName.trim();
                    if (!allScopes.includes(name)) {
                      onUpdate({ ...audit, customScopes: [...(audit.customScopes || []), name] });
                    }
                    setNewScopeName("");
                  }
                }}
                aria-label="Crear nuevo scope"
              />
              <button
                style={{ ...css.btn("var(--accent)"), padding:"0.25rem 0.5rem", fontSize:"0.75rem" }}
                onClick={() => {
                  if (!newScopeName.trim()) return;
                  const name = newScopeName.trim();
                  if (!allScopes.includes(name)) {
                    onUpdate({ ...audit, customScopes: [...(audit.customScopes || []), name] });
                  }
                  setNewScopeName("");
                }}
                aria-label="Añadir scope"
              >+</button>
            </div>
            <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)", marginLeft:"auto" }} aria-live="polite">{filtered.length} ítems</span>
            <span style={{ borderLeft:"1px solid var(--border-hover)", height:"20px" }} aria-hidden="true"></span>
            <select
              style={{ ...css.select, fontSize:"0.75rem", padding:"0.3rem 0.5rem" }}
              value=""
              onChange={e => {
                const val = e.target.value;
                if (!val) return;
                const ids = filtered.map(i => i.id);
                if (val.startsWith("scope:")) {
                  const scope = val.replace("scope:", "") || null;
                  if (!window.confirm(`¿Asignar scope "${scope || "ninguno"}" a ${ids.length} ítems?`)) { e.target.value = ""; return; }
                  let updatedChecks = { ...checks };
                  ids.forEach(id => { updatedChecks = setCheckScope(updatedChecks, id, scope); });
                  onUpdate({ ...audit, checks: updatedChecks });
                } else {
                  if (!window.confirm(`¿Marcar ${ids.length} ítems como "${val}"?`)) { e.target.value = ""; return; }
                  let updatedChecks = { ...checks };
                  ids.forEach(id => { updatedChecks = setCheckStatus(updatedChecks, id, val); });
                  onUpdate({ ...audit, checks: updatedChecks });
                }
                e.target.value = "";
              }}
              aria-label="Acción masiva sobre ítems filtrados"
            >
              <option value="">Bulk ▾</option>
              <option value="pass">✓ Marcar pass</option>
              <option value="fail">✗ Marcar fail</option>
              <option value="na">— Marcar N/A</option>
              <option value="pending">↺ Resetear a pendiente</option>
              <option disabled>── Scope ──</option>
              <option value="scope:">Quitar scope</option>
              {allScopes.map(s => <option key={s} value={`scope:${s}`}>Scope: {s}</option>)}
            </select>
          </div>

          {/* Add custom item */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
            <span style={{ fontSize:"0.8rem", color:"var(--text-tertiary)" }}>{customItems.length > 0 ? `${customItems.length} ítem(s) personalizado(s)` : ""}</span>
            <button style={css.btnSolid("var(--accent-purple)")} onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancelar" : "+ Añadir ítem"}
            </button>
          </div>
          {showAddForm && (
            <div style={{ ...css.card, marginBottom:"1rem", padding:"1rem" }}>
              <h4 style={{ fontSize:"0.8rem", color:"var(--accent-purple)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, margin:"0 0 0.75rem" }}>Nuevo ítem personalizado</h4>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Descripción *</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })} placeholder="Descripción del ítem de checklist" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Área</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.area} onChange={e => setNewItem({ ...newItem, area: e.target.value })}>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Categoría</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.cat} onChange={e => setNewItem({ ...newItem, cat: e.target.value })} placeholder="Ej: Formularios" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Criterio WCAG</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.wcag} onChange={e => setNewItem({ ...newItem, wcag: e.target.value })} placeholder="1.1.1 o —" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Nivel</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.nivel} onChange={e => setNewItem({ ...newItem, nivel: e.target.value })}>
                    <option value="A">A</option><option value="AA">AA</option><option value="AAA">AAA</option><option value="—">—</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Severidad</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.sev} onChange={e => setNewItem({ ...newItem, sev: e.target.value })}>
                    {Object.entries(SEV_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Tipo</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.tipo} onChange={e => setNewItem({ ...newItem, tipo: e.target.value })}>
                    {Object.entries(TIPO_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Esfuerzo</label>
                  <select style={{ ...css.select, width:"100%", marginTop:"0.2rem" }} value={newItem.effort} onChange={e => setNewItem({ ...newItem, effort: e.target.value })}>
                    <option value="low">Bajo</option><option value="medium">Medio</option><option value="high">Alto</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Equipo</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.team} onChange={e => setNewItem({ ...newItem, team: e.target.value })} placeholder="Frontend" />
                </div>
                <div>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Afecta a</label>
                  <input style={{ ...css.input, marginTop:"0.2rem" }} value={newItem.who} onChange={e => setNewItem({ ...newItem, who: e.target.value })} placeholder="Ciegos, Motor..." />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Descripción detallada</label>
                  <textarea style={{ ...css.input, marginTop:"0.2rem", fieldSizing:"content", minHeight:"50px", resize:"vertical" }} value={newItem.desc} onChange={e => setNewItem({ ...newItem, desc: e.target.value })} placeholder="Cómo revisar este ítem..." />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"0.7rem", color:"var(--text-secondary)", textTransform:"uppercase" }}>Recomendación / Fix</label>
                  <textarea style={{ ...css.input, marginTop:"0.2rem", fieldSizing:"content", minHeight:"50px", resize:"vertical" }} value={newItem.fix} onChange={e => setNewItem({ ...newItem, fix: e.target.value })} placeholder="Código o instrucciones de corrección..." />
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.75rem", justifyContent:"flex-end" }}>
                <button style={css.btn("var(--text-tertiary)")} onClick={() => { setShowAddForm(false); setNewItem(EMPTY_CUSTOM_ITEM); }}>Cancelar</button>
                <button style={css.btnSolid()} onClick={addCustomItem}>Guardar ítem</button>
              </div>
            </div>
          )}

          {/* Checklist table with aligned columns */}
          {(() => {
            return (
              <div role="table" aria-label="Ítems del checklist">
                {/* Sticky header */}
                <div role="row" style={S.headerRow}>
                  <span role="columnheader" style={S.hdr}>ID</span>
                  <span role="columnheader" style={S.hdr}>Sev.</span>
                  <span role="columnheader" style={S.hdr}>Tipo</span>
                  <span role="columnheader" style={S.hdr}>Descripción</span>
                  <span role="columnheader" style={S.hdr}>Nivel</span>
                  <span role="columnheader" style={S.hdr}>WCAG</span>
                  <span role="columnheader" style={S.hdr} aria-hidden="true"></span>
                  <span role="columnheader" style={S.hdr}>Estado</span>
                  <span role="columnheader" style={S.hdr}>Scope</span>
                </div>

                {/* Rows */}
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  {filtered.map(item => {
                    const status = getStatus(checks, item.id);
                    const isOpen = expanded === item.id;
                    const detailsId = `details-${item.id}`;
                    const wcagUrls = getWcagUrls(item.wcag);
                    return (
                      <div key={item.id} role="row" style={{ background:"var(--bg-card)", border:`1px solid ${isOpen ? "var(--border-hover)" : "var(--border)"}`, borderRadius:"6px", overflow:"hidden", transition:"border-color 0.15s" }}>
                        <div
                          style={S.rowGrid}
                          onClick={() => setExpanded(isOpen ? null : item.id)}
                        >
                          <span role="cell" style={{ ...S.cellId, color: customIds.has(item.id) ? "var(--accent-purple)" : "var(--accent)" }}>
                            {customIds.has(item.id) ? "CUST" : item.id}
                            {isInherited(checks, item.id) && <span title="Heredado de otra auditoría" style={{ fontSize:"0.6rem", opacity:0.7 }}>↩</span>}
                          </span>
                          <span role="cell"><Badge sev={item.sev} /></span>
                          <span role="cell"><TipoBadge tipo={item.tipo} /></span>
                          <span role="cell" style={{ fontSize:"0.875rem", color: status==="fail"?"var(--danger)": status==="pass"?"var(--success)":"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0 }}>{item.item}</span>
                          <span role="cell"><NivelBadge nivel={item.nivel} /></span>
                          <span role="cell" style={S.cellWcag} onClick={e => e.stopPropagation()}>
                            {item.wcag !== "—" && (
                              wcagUrls ? wcagUrls.map((w, i) => (
                                <span key={w.criterion}>{i > 0 && <span style={S.wcagSep}> / </span>}<a href={w.url} target="_blank" rel="noopener noreferrer" style={S.wcagLink} aria-label={`WCAG ${w.criterion} — ver normativa`}>{w.criterion}&thinsp;↗</a></span>
                              )) : (
                                <span style={S.wcagText}>{item.wcag}</span>
                              )
                            )}
                          </span>
                          <button
                            aria-expanded={isOpen}
                            aria-controls={detailsId}
                            aria-label={`${item.id}: ${item.item}`}
                            onClick={e => { e.stopPropagation(); setExpanded(isOpen ? null : item.id); }}
                            style={S.expandBtn}
                          >
                            {isOpen ? "▲" : "▼"}
                          </button>
                          <span role="cell" onClick={e => e.stopPropagation()}>
                            <StatusSelect value={status} onChange={v => setStatus(item.id, v)} />
                          </span>
                          <span role="cell" onClick={e => e.stopPropagation()}>
                            <select
                              value={getScope(checks, item.id) || ""}
                              onChange={e => setScopeForItem(item.id, e.target.value || null)}
                              aria-label={`Scope de ${item.id}`}
                              style={{ ...css.select, fontSize:"0.7rem", padding:"0.2rem 0.3rem", color: SCOPE_COLORS[getScope(checks, item.id)] || "var(--text-tertiary)" }}
                            >
                              <option value="">—</option>
                              {allScopes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </span>
                        </div>

                        {isOpen && (
                          <div id={detailsId} style={S.detailPanel}>
                            <div>
                              <h4 style={S.detailH4}>Descripción / Cómo revisar</h4>
                              <p style={S.detailDesc}>{item.desc}</p>
                            </div>
                            <div>
                              <h4 style={S.detailH4}>Recomendación / Fix</h4>
                              <pre style={S.detailFix}>{item.fix}</pre>
                            </div>
                            <div>
                              <h4 style={S.detailH4}>Criterio WCAG</h4>
                              {wcagUrls ? (
                                <span style={{ fontSize:"0.875rem" }}>
                                  {wcagUrls.map((w, i) => (
                                    <span key={w.criterion}>{i > 0 && <span style={S.wcagSep}> · </span>}<a href={w.url} target="_blank" rel="noopener noreferrer" style={S.detailWcagLink}>WCAG {w.criterion} ({item.nivel}) — Understanding ↗</a></span>
                                  ))}
                                </span>
                              ) : (
                                <span style={S.detailWcagFallback}>{item.wcag}</span>
                              )}
                            </div>
                            <div>
                              <h4 style={S.detailH4}>Herramienta sugerida</h4>
                              <span style={S.detailTool}>{item.tool}</span>
                            </div>
                            <div>
                              <h4 style={S.detailH4}>Equipo · Esfuerzo · Afecta a</h4>
                              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginTop:"0.4rem" }}>
                                <span style={css.tag("var(--accent-purple)")}>{item.team}</span>
                                <span style={css.tag(EFFORT_CONFIG[item.effort]?.color || "var(--text-secondary)")}>{EFFORT_CONFIG[item.effort]?.label}</span>
                                <span style={css.tag("var(--text-secondary)")}>{item.who}</span>
                              </div>
                            </div>
                            {customIds.has(item.id) && (
                              <div style={{ gridColumn:"1/-1", display:"flex", justifyContent:"flex-end" }}>
                                <button style={{ ...css.btn("var(--danger)"), padding:"0.25rem 0.6rem", fontSize:"0.75rem" }} onClick={() => deleteCustomItem(item.id)}>Eliminar ítem personalizado</button>
                              </div>
                            )}
                            <div style={{ gridColumn:"1/-1" }}>
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.4rem" }}>
                                <label htmlFor={`notes-${item.id}`} style={S.labelStyle}>Notas / Evidencia</label>
                                <label htmlFor={`file-${item.id}`} style={{ ...css.btn("var(--accent-blue)"), cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"0.3rem", padding:"0.25rem 0.6rem", fontSize:"0.75rem" }}>
                                  Adjuntar captura
                                  <input id={`file-${item.id}`} type="file" accept="image/*" aria-label={`Adjuntar captura para ${item.id}`} style={{ position:"absolute", width:"1px", height:"1px", overflow:"hidden", clip:"rect(0,0,0,0)" }}
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
                                    <div key={ss.id} style={S.ssContainer}>
                                      <img src={ss.data} alt={ss.name} style={S.ssThumb}
                                        onClick={() => window.open(ss.data, "_blank")}
                                      />
                                      <button
                                        onClick={() => deleteScreenshot(item.id, ss.id)}
                                        style={S.ssDeleteBtn}
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
        </div>
      )}
    </section>
  );
}
