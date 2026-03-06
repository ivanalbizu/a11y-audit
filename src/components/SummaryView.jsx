import { CHECKLIST } from "../data/checklist";
import { AREA_COLORS } from "../data/config";
import { css } from "../styles/theme";

export default function SummaryView({ audit, checks, statsByArea, totalFails, totalPasses, totalDone, critFails, total, allItems }) {
  const itemList = allItems || CHECKLIST;
  const pct = Math.round((totalDone / total) * 100);
  const conformPct = totalDone > 0 ? Math.round((totalPasses / totalDone) * 100) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {/* Score */}
      <div style={{ ...css.card, display:"flex", alignItems:"center", gap:"2rem", padding:"1.5rem" }}>
        <div style={{ textAlign:"center", flexShrink:0 }} aria-label={`Conformidad: ${conformPct}%`}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"3.5rem", color: conformPct < 40 ? "var(--danger)" : conformPct < 70 ? "var(--warning)" : "var(--success)", lineHeight:1 }}>{conformPct}%</div>
          <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", letterSpacing:"0.08em", textTransform:"uppercase", marginTop:"0.3rem" }}>conformidad</div>
        </div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.1rem", marginBottom:"0.5rem", margin:"0 0 0.5rem" }}>{audit.domain}</h3>
          <div style={{ fontSize:"0.875rem", color:"var(--text-secondary)", marginBottom:"0.75rem" }}>WCAG 2.2 AA · {audit.auditor} · {new Date(audit.createdAt).toLocaleDateString("es-ES")}</div>
          <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
            <span style={css.tag("var(--danger)")}>{totalFails} fallan</span>
            <span style={css.tag("var(--success)")}>{totalPasses} pasan</span>
            <span style={css.tag("var(--danger)")}>{critFails} críticos con fallo</span>
            <span style={css.tag("var(--text-secondary)")}>{total-totalDone} pendientes</span>
          </div>
        </div>
        <div style={{ flexShrink:0, width:"130px" }}>
          <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.4rem" }}>Progreso</div>
          <div style={{ background:"var(--bg-input)", borderRadius:"3px", height:"6px", overflow:"hidden" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de revisión: ${pct}%`}>
            <div style={{ height:"100%", width:`${pct}%`, background:"var(--accent)", borderRadius:"3px" }} />
          </div>
          <div style={{ fontSize:"0.8rem", color:"var(--text-secondary)", marginTop:"0.3rem" }}>{totalDone}/{total} ({pct}%) analizados</div>
        </div>
      </div>

      {/* By area */}
      <div style={{ ...css.card }}>
        <h3 style={{ fontSize:"0.8rem", color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, marginBottom:"1rem", margin:"0 0 1rem" }}>Por área WCAG</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
          {statsByArea.map(s => {
            const color = AREA_COLORS[s.area] || "var(--text-secondary)";
            const donePct = Math.round(((s.fails + s.passes) / s.total) * 100);
            return (
              <div key={s.area} style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <div style={{ width:"145px", fontSize:"0.8rem", color, flexShrink:0, fontWeight:500 }}>{s.area}</div>
                <div style={{ flex:1, background:"var(--bg-input)", borderRadius:"3px", height:"6px", overflow:"hidden" }} role="progressbar" aria-valuenow={donePct} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.area}: ${donePct}% revisado`}>
                  <div style={{ height:"100%", width:`${donePct}%`, background:color, opacity:0.8, borderRadius:"3px" }} />
                </div>
                <div style={{ display:"flex", gap:"0.4rem", flexShrink:0 }}>
                  <span style={css.tag("var(--danger)")}>{s.fails}✗</span>
                  <span style={css.tag("var(--success)")}>{s.passes}✓</span>
                  <span style={{ fontSize:"0.75rem", color:"var(--text-secondary)", fontFamily:"'DM Mono',monospace" }}>{s.pending}⊘</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical fails */}
      {critFails > 0 && (
        <div style={{ ...css.card, borderColor:"color-mix(in srgb, var(--danger) 25%, transparent)" }} role="alert">
          <h3 style={{ fontSize:"0.8rem", color:"var(--danger)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, marginBottom:"1rem", margin:"0 0 1rem" }}>Ítems críticos con fallo</h3>
          <ul style={{ display:"flex", flexDirection:"column", gap:"0.4rem", listStyle:"none", padding:0, margin:0 }}>
            {itemList.filter(i => i.sev === "critical" && (checks[i.id]||"pending") === "fail").map(item => (
              <li key={item.id} style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.55rem 0.8rem", background:"color-mix(in srgb, var(--danger) 8%, transparent)", border:"1px solid color-mix(in srgb, var(--danger) 20%, transparent)", borderRadius:"4px" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", color:"var(--accent)" }}>{item.id}</span>
                <span style={{ flex:1, fontSize:"0.875rem" }}>{item.item}</span>
                <span style={{ fontSize:"0.75rem", color:"var(--danger)" }}>{item.wcag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
