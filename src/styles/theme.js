// Palette — colors use CSS custom properties from index.css for light/dark support
// Dark: Main bg: #0A0A12  Card bg: #10101C  Input bg: #161626
// Light: Main bg: #F5F5F8  Card bg: #FFFFFF  Input bg: #EEEEF4

export const css = {
  app: { fontFamily:"'DM Mono', 'Courier New', monospace", background:"var(--bg-main)", color:"var(--text-primary)", minHeight:"100vh", display:"flex", flexDirection:"column" },
  topbar: { background:"var(--bg-card)", borderBottom:"1px solid var(--border)", padding:"0 1.5rem", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"sticky", top:0, zIndex:100 },
  logo: { fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:"1.1rem", color:"var(--accent)", letterSpacing:"0.02em" },
  logoSub: { fontSize:"0.75rem", color:"var(--text-secondary)", letterSpacing:"0.12em", textTransform:"uppercase", marginLeft:"0.5rem" },
  layout: { display:"flex", flex:1, overflow:"hidden" },
  sidebar: { width:"230px", background:"var(--bg-card)", borderRight:"1px solid var(--border)", overflowY:"auto", flexShrink:0, display:"flex", flexDirection:"column" },
  main: { flex:1, overflowY:"auto", padding:"1.5rem" },
  btn: (accent="var(--accent)") => ({ background:"transparent", border:`1px solid ${accent}`, color:accent, padding:"0.4rem 1rem", borderRadius:"4px", cursor:"pointer", fontFamily:"'DM Mono', monospace", fontSize:"0.8rem", letterSpacing:"0.06em", transition:"all 0.15s" }),
  btnSolid: (accent="var(--accent)") => ({ background:accent, border:`1px solid ${accent}`, color:"var(--bg-main)", padding:"0.4rem 1rem", borderRadius:"4px", cursor:"pointer", fontFamily:"'DM Mono', monospace", fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.06em" }),
  card: { background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"8px", padding:"1.25rem" },
  pill: (color, bg, border) => ({ display:"inline-flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem", padding:"0.2rem 0.5rem", borderRadius:"4px", background:bg, border:`1px solid ${border}`, color, fontFamily:"'DM Mono', monospace", whiteSpace:"nowrap" }),
  input: { background:"var(--bg-input)", border:"1px solid var(--border-hover)", borderRadius:"4px", color:"var(--text-primary)", padding:"0.5rem 0.75rem", fontFamily:"'DM Mono', monospace", fontSize:"0.875rem", width:"100%" },
  select: { background:"var(--bg-input)", border:"1px solid var(--border-hover)", borderRadius:"4px", color:"var(--text-primary)", padding:"0.45rem 0.65rem", fontFamily:"'DM Mono', monospace", fontSize:"0.8rem", cursor:"pointer" },
  tag: (color) => ({ fontSize:"0.75rem", fontFamily:"'DM Mono', monospace", color, background:`color-mix(in srgb, ${color} 12%, transparent)`, border:`1px solid color-mix(in srgb, ${color} 25%, transparent)`, padding:"0.15rem 0.5rem", borderRadius:"4px" }),
};
