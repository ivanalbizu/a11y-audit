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
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"3.5rem", color: conformPct < 40 ? "#FF6B6B" : conformPct < 70 ? "#FFE066" : "#5ED67E", lineHeight:1 }}>{conformPct}%</div>
          <div style={{ fontSize:"0.75rem", color:"#A0A0B8", letterSpacing:"0.08em", textTransform:"uppercase", marginTop:"0.3rem" }}>conformidad</div>
        </div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.1rem", marginBottom:"0.5rem", margin:"0 0 0.5rem" }}>{audit.domain}</h3>
          <div style={{ fontSize:"0.875rem", color:"#A0A0B8", marginBottom:"0.75rem" }}>WCAG 2.2 AA · {audit.auditor} · {new Date(audit.createdAt).toLocaleDateString("es-ES")}</div>
          <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
            <span style={css.tag("#FF6B6B")}>{totalFails} fallan</span>
            <span style={css.tag("#5ED67E")}>{totalPasses} pasan</span>
            <span style={css.tag("#FF6B6B")}>{critFails} críticos con fallo</span>
            <span style={css.tag("#A0A0B8")}>{total-totalDone} pendientes</span>
          </div>
        </div>
        <div style={{ flexShrink:0, width:"130px" }}>
          <div style={{ fontSize:"0.75rem", color:"#A0A0B8", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.4rem" }}>Progreso</div>
          <div style={{ background:"#161626", borderRadius:"3px", height:"6px", overflow:"hidden" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de revisión: ${pct}%`}>
            <div style={{ height:"100%", width:`${pct}%`, background:"#E8FF47", borderRadius:"3px" }} />
          </div>
          <div style={{ fontSize:"0.8rem", color:"#A0A0B8", marginTop:"0.3rem" }}>{pct}% revisado</div>
        </div>
      </div>

      {/* By area */}
      <div style={{ ...css.card }}>
        <h3 style={{ fontSize:"0.8rem", color:"#E8FF47", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, marginBottom:"1rem", margin:"0 0 1rem" }}>Por área WCAG</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
          {statsByArea.map(s => {
            const color = AREA_COLORS[s.area] || "#A0A0B8";
            const donePct = Math.round(((s.fails + s.passes) / s.total) * 100);
            return (
              <div key={s.area} style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <div style={{ width:"145px", fontSize:"0.8rem", color, flexShrink:0, fontWeight:500 }}>{s.area}</div>
                <div style={{ flex:1, background:"#161626", borderRadius:"3px", height:"6px", overflow:"hidden" }} role="progressbar" aria-valuenow={donePct} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.area}: ${donePct}% revisado`}>
                  <div style={{ height:"100%", width:`${donePct}%`, background:color, opacity:0.8, borderRadius:"3px" }} />
                </div>
                <div style={{ display:"flex", gap:"0.4rem", flexShrink:0 }}>
                  <span style={css.tag("#FF6B6B")}>{s.fails}✗</span>
                  <span style={css.tag("#5ED67E")}>{s.passes}✓</span>
                  <span style={{ fontSize:"0.75rem", color:"#A0A0B8", fontFamily:"'DM Mono',monospace" }}>{s.pending}⊘</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical fails */}
      {critFails > 0 && (
        <div style={{ ...css.card, borderColor:"rgba(255,107,107,0.25)" }} role="alert">
          <h3 style={{ fontSize:"0.8rem", color:"#FF6B6B", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, marginBottom:"1rem", margin:"0 0 1rem" }}>Ítems críticos con fallo</h3>
          <ul style={{ display:"flex", flexDirection:"column", gap:"0.4rem", listStyle:"none", padding:0, margin:0 }}>
            {itemList.filter(i => i.sev === "critical" && (checks[i.id]||"pending") === "fail").map(item => (
              <li key={item.id} style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.55rem 0.8rem", background:"rgba(255,107,107,0.08)", border:"1px solid rgba(255,107,107,0.2)", borderRadius:"4px" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", color:"#E8FF47" }}>{item.id}</span>
                <span style={{ flex:1, fontSize:"0.875rem" }}>{item.item}</span>
                <span style={{ fontSize:"0.75rem", color:"#FF6B6B" }}>{item.wcag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
