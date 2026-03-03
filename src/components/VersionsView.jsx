import { useState } from "react";
import { CHECKLIST } from "../data/checklist";
import { css } from "../styles/theme";

let versionCounter = 0;
function nextVersionId() {
  versionCounter += 1;
  return `v-${versionCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function VersionsView({ audit, onUpdate }) {
  const versions = audit.versions || [];
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [compareIdx, setCompareIdx] = useState(null);

  const handleCreate = () => {
    if (!window.confirm("¿Guardar una snapshot del estado actual como nueva versión?")) return;
    const checks = audit.checks || {};
    const totalDone = CHECKLIST.filter(i => (checks[i.id] || "pending") !== "pending").length;
    const totalPasses = CHECKLIST.filter(i => (checks[i.id] || "pending") === "pass").length;
    const conformity = totalDone > 0 ? Math.round((totalPasses / totalDone) * 100) : 0;
    const version = {
      versionId: nextVersionId(),
      snapshotDate: new Date().toISOString(),
      label: `v${versions.length + 1}`,
      checks: { ...checks },
      notes: { ...(audit.notes || {}) },
      conformity,
    };
    onUpdate({ ...audit, versions: [...versions, version] });
  };

  const getComparison = (a, b) => {
    const changes = [];
    for (const item of CHECKLIST) {
      const statusA = a.checks[item.id] || "pending";
      const statusB = b.checks[item.id] || "pending";
      if (statusA !== statusB) {
        changes.push({ id: item.id, item: item.item, from: statusA, to: statusB });
      }
    }
    return changes;
  };

  const selectedVersion = selectedIdx !== null ? versions[selectedIdx] : null;
  const comparison = (compareIdx !== null && selectedIdx !== null && compareIdx !== selectedIdx)
    ? getComparison(versions[compareIdx], versions[selectedIdx])
    : null;

  const headingStyle = { fontSize:"0.75rem", color:"#C0C0D0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.5rem", fontWeight:600 };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", margin:0 }}>Historial de versiones</h3>
        <button style={css.btnSolid()} onClick={handleCreate}>+ Nueva versión</button>
      </div>

      {versions.length === 0 ? (
        <div style={{ textAlign:"center", padding:"3rem 2rem", color:"#A0A0B8", border:"1px dashed #2A2A3E", borderRadius:"8px" }}>
          <div style={{ fontSize:"1.5rem", marginBottom:"0.75rem" }} aria-hidden="true">📸</div>
          <div style={{ fontSize:"0.9rem", color:"#C0C0D0", marginBottom:"0.4rem" }}>Sin versiones guardadas</div>
          <div style={{ fontSize:"0.8rem" }}>Crea una versión para guardar el estado actual del checklist</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
          {versions.map((v, idx) => {
            const isSelected = selectedIdx === idx;
            const isCompare = compareIdx === idx;
            return (
              <div key={v.versionId} style={{ ...css.card, padding:"0.75rem 1rem", borderColor: isSelected ? "#E8FF47" : isCompare ? "#6CB4FF" : "#2A2A3E", cursor:"pointer", display:"flex", alignItems:"center", gap:"1rem" }}
                onClick={() => setSelectedIdx(isSelected ? null : idx)}
              >
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1rem", color: isSelected ? "#E8FF47" : "#E8E8F0", minWidth:"36px" }}>
                  {v.label}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.8rem", color:"#A0A0B8" }}>
                    {new Date(v.snapshotDate).toLocaleDateString("es-ES", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                  </div>
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", color: v.conformity < 40 ? "#FF6B6B" : v.conformity < 70 ? "#FFE066" : "#5ED67E" }}>
                  {v.conformity}%
                </div>
                {selectedIdx !== null && selectedIdx !== idx && (
                  <button
                    style={css.btn(isCompare ? "#6CB4FF" : "#7A7A94")}
                    onClick={e => { e.stopPropagation(); setCompareIdx(isCompare ? null : idx); }}
                  >
                    {isCompare ? "✓ Comparar" : "Comparar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected version detail */}
      {selectedVersion && (
        <div style={{ ...css.card, marginTop:"1rem" }}>
          <div style={headingStyle}>{selectedVersion.label} — Detalle de la snapshot</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1rem" }}>
            {(() => {
              const checks = selectedVersion.checks;
              const done = CHECKLIST.filter(i => (checks[i.id] || "pending") !== "pending").length;
              const fails = CHECKLIST.filter(i => (checks[i.id] || "pending") === "fail").length;
              const passes = CHECKLIST.filter(i => (checks[i.id] || "pending") === "pass").length;
              return [
                { label:"Fallan", val:fails, color:"#FF6B6B" },
                { label:"Pasan", val:passes, color:"#5ED67E" },
                { label:"Pendientes", val:CHECKLIST.length - done, color:"#A0A0B8" },
                { label:"Conformidad", val:`${selectedVersion.conformity}%`, color: selectedVersion.conformity < 40 ? "#FF6B6B" : selectedVersion.conformity < 70 ? "#FFE066" : "#5ED67E" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center", padding:"0.5rem" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.3rem", color:s.color, lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:"0.75rem", color:"#A0A0B8", marginTop:"0.2rem", textTransform:"uppercase" }}>{s.label}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Comparison */}
      {comparison && (
        <div style={{ ...css.card, marginTop:"1rem" }}>
          <div style={headingStyle}>
            Comparando {versions[compareIdx].label} → {versions[selectedIdx].label} · {comparison.length} cambios
          </div>
          {comparison.length === 0 ? (
            <div style={{ fontSize:"0.875rem", color:"#A0A0B8" }}>Sin cambios entre estas versiones</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.25rem", maxHeight:"300px", overflowY:"auto" }}>
              {comparison.map(c => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.4rem 0.5rem", background:"#0A0A12", borderRadius:"4px", fontSize:"0.8rem" }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", color:"#E8FF47", width:"68px", flexShrink:0 }}>{c.id}</span>
                  <span style={{ flex:1, color:"#D0D0E0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.item}</span>
                  <span style={{ color: c.from === "fail" ? "#FF6B6B" : c.from === "pass" ? "#5ED67E" : "#A0A0B8", fontFamily:"'DM Mono',monospace" }}>{c.from}</span>
                  <span style={{ color:"#3A3A50" }}>→</span>
                  <span style={{ color: c.to === "fail" ? "#FF6B6B" : c.to === "pass" ? "#5ED67E" : "#A0A0B8", fontFamily:"'DM Mono',monospace" }}>{c.to}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
