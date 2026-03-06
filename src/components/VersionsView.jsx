import { useState } from "react";
import { CHECKLIST } from "../data/checklist";
import { css } from "../styles/theme";
import { getStatus } from "../utils/checks";

function nextVersionId() {
  return `v-${crypto.randomUUID()}`;
}

export default function VersionsView({ audit, onUpdate, allItems }) {
  const itemList = allItems || CHECKLIST;
  const versions = audit.versions || [];
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [compareIdx, setCompareIdx] = useState(null);

  const handleCreate = () => {
    if (!window.confirm("¿Guardar una snapshot del estado actual como nueva versión?")) return;
    const checks = audit.checks || {};
    const totalDone = itemList.filter(i => getStatus(checks, i.id) !== "pending").length;
    const totalPasses = itemList.filter(i => getStatus(checks, i.id) === "pass").length;
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
    for (const item of itemList) {
      const statusA = getStatus(a.checks, item.id);
      const statusB = getStatus(b.checks, item.id);
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

  const headingStyle = { fontSize:"0.75rem", color:"var(--text-label)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.5rem", fontWeight:600 };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", margin:0 }}>Historial de versiones</h3>
        <button style={css.btnSolid()} onClick={handleCreate}>+ Nueva versión</button>
      </div>

      {versions.length === 0 ? (
        <div style={{ textAlign:"center", padding:"3rem 2rem", color:"var(--text-secondary)", border:"1px dashed var(--border)", borderRadius:"8px" }}>
          <div style={{ fontSize:"1.5rem", marginBottom:"0.75rem" }} aria-hidden="true">📸</div>
          <div style={{ fontSize:"0.9rem", color:"var(--text-label)", marginBottom:"0.4rem" }}>Sin versiones guardadas</div>
          <div style={{ fontSize:"0.8rem" }}>Crea una versión para guardar el estado actual del checklist</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
          {versions.map((v, idx) => {
            const isSelected = selectedIdx === idx;
            const isCompare = compareIdx === idx;
            return (
              <div key={v.versionId} style={{ ...css.card, padding:"0.75rem 1rem", borderColor: isSelected ? "var(--accent)" : isCompare ? "var(--accent-blue)" : "var(--border)", cursor:"pointer", display:"flex", alignItems:"center", gap:"1rem" }}
                onClick={() => setSelectedIdx(isSelected ? null : idx)}
              >
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1rem", color: isSelected ? "var(--accent)" : "var(--text-primary)", minWidth:"36px" }}>
                  {v.label}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.8rem", color:"var(--text-secondary)" }}>
                    {new Date(v.snapshotDate).toLocaleDateString("es-ES", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                  </div>
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", color: v.conformity < 40 ? "var(--danger)" : v.conformity < 70 ? "var(--warning)" : "var(--success)" }}>
                  {v.conformity}%
                </div>
                {selectedIdx !== null && selectedIdx !== idx && (
                  <button
                    style={css.btn(isCompare ? "var(--accent-blue)" : "var(--text-tertiary)")}
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
              const done = itemList.filter(i => getStatus(checks, i.id) !== "pending").length;
              const fails = itemList.filter(i => getStatus(checks, i.id) === "fail").length;
              const passes = itemList.filter(i => getStatus(checks, i.id) === "pass").length;
              return [
                { label:"Fallan", val:fails, color:"var(--danger)" },
                { label:"Pasan", val:passes, color:"var(--success)" },
                { label:"Pendientes", val:itemList.length - done, color:"var(--text-secondary)" },
                { label:"Conformidad", val:`${selectedVersion.conformity}%`, color: selectedVersion.conformity < 40 ? "var(--danger)" : selectedVersion.conformity < 70 ? "var(--warning)" : "var(--success)" },
              ].map(s => (
                <div key={s.label} style={{ textAlign:"center", padding:"0.5rem" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.3rem", color:s.color, lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", marginTop:"0.2rem", textTransform:"uppercase" }}>{s.label}</div>
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
            <div style={{ fontSize:"0.875rem", color:"var(--text-secondary)" }}>Sin cambios entre estas versiones</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.25rem", maxHeight:"300px", overflowY:"auto" }}>
              {comparison.map(c => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.4rem 0.5rem", background:"var(--bg-main)", borderRadius:"4px", fontSize:"0.8rem" }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", color:"var(--accent)", width:"68px", flexShrink:0 }}>{c.id}</span>
                  <span style={{ flex:1, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.item}</span>
                  <span style={{ color: c.from === "fail" ? "var(--danger)" : c.from === "pass" ? "var(--success)" : "var(--text-secondary)", fontFamily:"'DM Mono',monospace" }}>{c.from}</span>
                  <span style={{ color:"var(--border-hover)" }}>→</span>
                  <span style={{ color: c.to === "fail" ? "var(--danger)" : c.to === "pass" ? "var(--success)" : "var(--text-secondary)", fontFamily:"'DM Mono',monospace" }}>{c.to}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
