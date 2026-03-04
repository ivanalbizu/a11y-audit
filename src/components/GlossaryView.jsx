import { useState } from "react";
import { GLOSSARY } from "../data/glossary";
import { css } from "../styles/theme";

export default function GlossaryView() {
  const [search, setSearch] = useState("");

  const filtered = GLOSSARY.filter(g => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.term.toLowerCase().includes(q) || g.full.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q);
  });

  const hdrStyle = { fontSize:"0.7rem", color:"#7A7A94", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, fontFamily:"'DM Mono',monospace", padding:"0.5rem 0.75rem" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.05rem", margin:0 }}>Glosario de acrónimos</h3>
        <input
          style={{ ...css.input, width:"220px", padding:"0.4rem 0.65rem" }}
          placeholder="Buscar término..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Buscar en glosario"
        />
      </div>

      <div style={{ ...css.card, padding:0, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"100px 280px 1fr", background:"#0A0A12", borderBottom:"2px solid #2A2A3E" }}>
          <span style={hdrStyle}>Acrónimo</span>
          <span style={hdrStyle}>Significado</span>
          <span style={hdrStyle}>Descripción</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding:"2rem", textAlign:"center", color:"#A0A0B8", fontSize:"0.875rem" }}>Sin resultados para "{search}"</div>
        ) : (
          filtered.map(g => (
            <div key={g.term} style={{ display:"grid", gridTemplateColumns:"100px 280px 1fr", borderBottom:"1px solid #1A1A2E", alignItems:"center" }}>
              <span style={{ padding:"0.6rem 0.75rem", fontFamily:"'DM Mono',monospace", fontSize:"0.85rem", color:"#E8FF47", fontWeight:700 }}>{g.term}</span>
              <span style={{ padding:"0.6rem 0.75rem", fontSize:"0.85rem", color:"#C0C0D0" }}>{g.full}</span>
              <span style={{ padding:"0.6rem 0.75rem", fontSize:"0.83rem", color:"#A0A0B8", lineHeight:1.5 }}>{g.desc}</span>
            </div>
          ))
        )}
      </div>
      <div style={{ marginTop:"0.75rem", fontSize:"0.75rem", color:"#7A7A94" }}>{filtered.length} de {GLOSSARY.length} términos</div>
    </div>
  );
}
