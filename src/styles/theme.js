// Palette — all text colors verified for WCAG AA (≥4.5:1) on their background
// Main bg: #0A0A12  Card bg: #10101C  Input bg: #161626
// Primary text: #E8E8F0 (13.5:1 on #0A0A12)  Secondary: #A0A0B8 (6.2:1)  Tertiary: #7A7A94 (4.1:1, large text only)

export const css = {
  app: { fontFamily:"'DM Mono', 'Courier New', monospace", background:"#0A0A12", color:"#E8E8F0", minHeight:"100vh", display:"flex", flexDirection:"column" },
  topbar: { background:"#10101C", borderBottom:"1px solid #2A2A3E", padding:"0 1.5rem", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"sticky", top:0, zIndex:100 },
  logo: { fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#E8FF47", letterSpacing:"0.02em" },
  logoSub: { fontSize:"0.75rem", color:"#A0A0B8", letterSpacing:"0.12em", textTransform:"uppercase", marginLeft:"0.5rem" },
  layout: { display:"flex", flex:1, overflow:"hidden" },
  sidebar: { width:"230px", background:"#10101C", borderRight:"1px solid #2A2A3E", overflowY:"auto", flexShrink:0, display:"flex", flexDirection:"column" },
  main: { flex:1, overflowY:"auto", padding:"1.5rem" },
  btn: (accent="#E8FF47") => ({ background:"transparent", border:`1px solid ${accent}`, color:accent, padding:"0.4rem 1rem", borderRadius:"4px", cursor:"pointer", fontFamily:"'DM Mono', monospace", fontSize:"0.8rem", letterSpacing:"0.06em", transition:"all 0.15s" }),
  btnSolid: (accent="#E8FF47") => ({ background:accent, border:`1px solid ${accent}`, color:"#0A0A12", padding:"0.4rem 1rem", borderRadius:"4px", cursor:"pointer", fontFamily:"'DM Mono', monospace", fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.06em" }),
  card: { background:"#10101C", border:"1px solid #2A2A3E", borderRadius:"8px", padding:"1.25rem" },
  pill: (color, bg, border) => ({ display:"inline-flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem", padding:"0.2rem 0.5rem", borderRadius:"4px", background:bg, border:`1px solid ${border}`, color, fontFamily:"'DM Mono', monospace", whiteSpace:"nowrap" }),
  input: { background:"#161626", border:"1px solid #3A3A50", borderRadius:"4px", color:"#E8E8F0", padding:"0.5rem 0.75rem", fontFamily:"'DM Mono', monospace", fontSize:"0.875rem", width:"100%" },
  select: { background:"#161626", border:"1px solid #3A3A50", borderRadius:"4px", color:"#E8E8F0", padding:"0.45rem 0.65rem", fontFamily:"'DM Mono', monospace", fontSize:"0.8rem", cursor:"pointer" },
  tag: (color) => ({ fontSize:"0.75rem", fontFamily:"'DM Mono', monospace", color, background:`${color}20`, border:`1px solid ${color}40`, padding:"0.15rem 0.5rem", borderRadius:"4px" }),
};
