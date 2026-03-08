import { CHECKLIST } from "../data/checklist";
import { AREAS, SEV_CONFIG, STATUS_CONFIG, DEFAULT_SCOPES } from "../data/config";
import { getStatus, getScope } from "./checks";

const C = {
  accent: "#6C5CE7", blue: "#0984E3", purple: "#A855F7",
  danger: "#FF6B6B", warning: "#FDCB6E", success: "#00B894",
  bg: "#FFFFFF", bgAlt: "#F8F9FA", border: "#E2E8F0",
  text: "#1A1A2E", textSec: "#64748B", textTer: "#94A3B8",
};

const sevColors = { critical: C.danger, high: C.warning, medium: C.warning, low: C.success };
const sevLabels = { critical: "Crítico", high: "Alto", medium: "Medio", low: "Bajo" };
const statusLabels = { pass: "Pasa", fail: "Falla", partial: "Parcial", na: "N/A", pending: "Pendiente" };
const statusColors = { pass: C.success, fail: C.danger, partial: C.warning, na: C.textSec, pending: C.textTer };

function esc(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pill(label, color) {
  return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:0.7rem;font-weight:600;color:${color};border:1px solid ${color}30;background:${color}12">${esc(label)}</span>`;
}

function progressBar(pct, color) {
  return `<div style="flex:1;background:${C.border};border-radius:3px;height:6px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div></div>`;
}

export function generateReport(audit) {
  const allItems = [...CHECKLIST, ...(audit.customItems || [])];
  const checks = audit.checks || {};
  const notes = audit.notes || {};
  const screenshots = audit.screenshots || {};
  const auditScreenshots = audit.auditScreenshots || [];
  const total = allItems.length;
  const totalDone = allItems.filter(i => getStatus(checks, i.id) !== "pending").length;
  const totalPasses = allItems.filter(i => getStatus(checks, i.id) === "pass").length;
  const totalFails = allItems.filter(i => getStatus(checks, i.id) === "fail").length;
  const critFails = allItems.filter(i => i.sev === "critical" && getStatus(checks, i.id) === "fail").length;
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;
  const conformPct = totalDone > 0 ? Math.round((totalPasses / totalDone) * 100) : 0;
  const conformColor = conformPct < 40 ? C.danger : conformPct < 70 ? C.warning : C.success;
  const date = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const auditDate = audit.createdAt ? new Date(audit.createdAt).toLocaleDateString("es-ES") : "—";

  // Stats by area
  const areaStats = AREAS.map(area => {
    const items = allItems.filter(i => i.area === area);
    const fails = items.filter(i => getStatus(checks, i.id) === "fail").length;
    const passes = items.filter(i => getStatus(checks, i.id) === "pass").length;
    const pending = items.filter(i => getStatus(checks, i.id) === "pending").length;
    return { area, total: items.length, fails, passes, pending };
  });

  // Scope stats
  const allScopes = [...DEFAULT_SCOPES, ...(audit.customScopes || [])];
  const scopeStats = allScopes.map(scope => {
    const items = allItems.filter(i => getScope(checks, i.id) === scope);
    if (items.length === 0) return null;
    const fails = items.filter(i => getStatus(checks, i.id) === "fail").length;
    const passes = items.filter(i => getStatus(checks, i.id) === "pass").length;
    return { scope, total: items.length, fails, passes };
  }).filter(Boolean);

  // Failed items grouped by severity
  const failedItems = allItems
    .filter(i => getStatus(checks, i.id) === "fail")
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.sev] ?? 4) - (order[b.sev] ?? 4);
    });

  // --- Build HTML ---
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Informe de Accesibilidad — ${esc(audit.domain)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:${C.text}; line-height:1.6; background:${C.bg}; }
  .page { max-width:900px; margin:0 auto; padding:40px 32px; }
  h1 { font-size:1.8rem; font-weight:800; margin-bottom:4px; }
  h2 { font-size:1.1rem; font-weight:700; color:${C.accent}; text-transform:uppercase; letter-spacing:0.08em; margin:2rem 0 0.75rem; padding-bottom:0.4rem; border-bottom:2px solid ${C.border}; }
  h3 { font-size:0.85rem; font-weight:600; color:${C.textSec}; margin-bottom:0.4rem; }
  .meta { color:${C.textSec}; font-size:0.85rem; margin-bottom:1.5rem; }
  .card { border:1px solid ${C.border}; border-radius:6px; padding:1rem; margin-bottom:0.75rem; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
  .grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:0.75rem; margin-bottom:1.5rem; }
  .stat-card { text-align:center; padding:0.75rem; border:1px solid ${C.border}; border-radius:6px; }
  .stat-val { font-size:1.8rem; font-weight:800; line-height:1; }
  .stat-label { font-size:0.7rem; color:${C.textSec}; text-transform:uppercase; letter-spacing:0.06em; margin-top:4px; }
  table { width:100%; border-collapse:collapse; font-size:0.8rem; }
  th { text-align:left; font-size:0.65rem; text-transform:uppercase; letter-spacing:0.08em; color:${C.textSec}; padding:6px 8px; border-bottom:2px solid ${C.border}; }
  td { padding:6px 8px; border-bottom:1px solid ${C.border}; vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  .mono { font-family:'SF Mono','Fira Code',monospace; font-size:0.75rem; }
  .screenshot-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.75rem; margin-top:0.75rem; }
  .screenshot-card { border:1px solid ${C.border}; border-radius:6px; overflow:hidden; }
  .screenshot-card img { width:100%; height:120px; object-fit:cover; display:block; }
  .screenshot-card .caption { padding:6px 8px; font-size:0.7rem; color:${C.textSec}; }
  .notes { font-size:0.8rem; color:${C.textSec}; background:${C.bgAlt}; padding:6px 10px; border-radius:4px; margin-top:4px; white-space:pre-wrap; }
  .evidence-imgs { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:6px; }
  .evidence-imgs img { width:100px; height:70px; object-fit:cover; border-radius:4px; border:1px solid ${C.border}; }
  @media print {
    body { font-size:11px; }
    .page { padding:0; }
    .no-print { display:none !important; }
    h2 { break-before:auto; }
    .card, tr { break-inside:avoid; }
  }
</style>
</head>
<body>
<div class="page">

<!-- Header -->
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
  <div>
    <div style="font-size:0.75rem;color:${C.accent};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Informe de Accesibilidad</div>
    <h1>${esc(audit.domain)}</h1>
  </div>
  <div style="text-align:right">
    <div style="font-size:3rem;font-weight:800;color:${conformColor};line-height:1">${conformPct}%</div>
    <div style="font-size:0.7rem;color:${C.textSec};text-transform:uppercase;letter-spacing:0.06em">conformidad</div>
  </div>
</div>
<div class="meta">
  WCAG 2.2 AA · Auditor: ${esc(audit.auditor)} · Fecha: ${auditDate}
  ${audit.startDate ? ` · Inicio: ${audit.startDate}` : ""}${audit.endDate ? ` · Fin: ${audit.endDate}` : ""}
  <br>Informe generado: ${date}
</div>

<!-- Stats -->
<div class="grid4">
  <div class="stat-card"><div class="stat-val" style="color:${C.danger}">${totalFails}</div><div class="stat-label">Fallan</div></div>
  <div class="stat-card"><div class="stat-val" style="color:${C.success}">${totalPasses}</div><div class="stat-label">Pasan</div></div>
  <div class="stat-card"><div class="stat-val" style="color:${C.textSec}">${total - totalDone}</div><div class="stat-label">Pendientes</div></div>
  <div class="stat-card"><div class="stat-val" style="color:${C.danger}">${critFails}</div><div class="stat-label">Críticos con fallo</div></div>
</div>

<!-- Progress -->
<div class="card">
  <h3>Progreso de revisión</h3>
  <div style="display:flex;align-items:center;gap:0.75rem;margin-top:0.4rem">
    ${progressBar(pct, C.accent)}
    <span class="mono">${totalDone}/${total} (${pct}%)</span>
  </div>
</div>

<!-- By area -->
<h2>Resultados por área WCAG</h2>
${areaStats.map(s => {
  const donePct = s.total > 0 ? Math.round(((s.fails + s.passes) / s.total) * 100) : 0;
  return `<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
    <div style="width:130px;font-size:0.8rem;font-weight:500">${esc(s.area)}</div>
    ${progressBar(donePct, C.accent)}
    <div style="display:flex;gap:0.3rem;flex-shrink:0">
      ${pill(s.fails + "✗", C.danger)} ${pill(s.passes + "✓", C.success)}
      <span class="mono" style="color:${C.textTer}">${s.pending}⊘</span>
    </div>
  </div>`;
}).join("\n")}`;

  // Scope section
  if (scopeStats.length > 0) {
    html += `\n<h2>Resultados por scope</h2>
${scopeStats.map(s => {
  const donePct = s.total > 0 ? Math.round(((s.fails + s.passes) / s.total) * 100) : 0;
  return `<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
    <div style="width:100px;font-size:0.8rem;font-weight:500">${esc(s.scope)}</div>
    ${progressBar(donePct, C.purple)}
    <div style="display:flex;gap:0.3rem;flex-shrink:0">
      ${pill(s.fails + "✗", C.danger)} ${pill(s.passes + "✓", C.success)}
    </div>
  </div>`;
}).join("\n")}`;
  }

  // Audit screenshots
  if (auditScreenshots.length > 0) {
    html += `\n<h2>Capturas de la web</h2>
<div class="screenshot-grid">
${auditScreenshots.map(ss => `<div class="screenshot-card">
  <img src="${ss.data}" alt="${esc(ss.label || ss.name)}">
  <div class="caption">${esc(ss.label || ss.name)} · ${new Date(ss.addedAt).toLocaleDateString("es-ES")}</div>
</div>`).join("\n")}
</div>`;
  }

  // Failed items detail
  if (failedItems.length > 0) {
    html += `\n<h2>Detalle de ítems con fallo (${failedItems.length})</h2>
<table>
<thead><tr><th>ID</th><th>Severidad</th><th>Descripción</th><th>WCAG</th><th>Nivel</th><th>Scope</th></tr></thead>
<tbody>
${failedItems.map(item => {
  const scope = getScope(checks, item.id);
  const note = notes[item.id];
  const shots = screenshots[item.id] || [];
  return `<tr>
  <td class="mono" style="color:${C.accent};white-space:nowrap">${esc(item.id)}</td>
  <td>${pill(sevLabels[item.sev] || item.sev, sevColors[item.sev] || C.textSec)}</td>
  <td>
    <div style="font-weight:500">${esc(item.item)}</div>
    ${item.desc ? `<div style="font-size:0.75rem;color:${C.textSec};margin-top:2px">${esc(item.desc)}</div>` : ""}
    ${item.fix ? `<div style="font-size:0.75rem;color:${C.success};background:${C.bgAlt};padding:4px 8px;border-radius:3px;margin-top:4px;font-family:monospace;white-space:pre-wrap">${esc(item.fix)}</div>` : ""}
    ${note ? `<div class="notes">${esc(note)}</div>` : ""}
    ${shots.length > 0 ? `<div class="evidence-imgs">${shots.map(s => `<img src="${s.data}" alt="${esc(s.name)}">`).join("")}</div>` : ""}
  </td>
  <td class="mono">${esc(item.wcag)}</td>
  <td>${esc(item.nivel)}</td>
  <td style="font-size:0.75rem">${scope ? esc(scope) : "—"}</td>
</tr>`;
}).join("\n")}
</tbody></table>`;
  }

  // Full checklist summary table
  html += `\n<h2>Checklist completo (${total} ítems)</h2>
<table>
<thead><tr><th>ID</th><th>Sev.</th><th>Descripción</th><th>WCAG</th><th>Nivel</th><th>Estado</th></tr></thead>
<tbody>
${allItems.map(item => {
  const st = getStatus(checks, item.id);
  return `<tr>
  <td class="mono" style="white-space:nowrap">${esc(item.id)}</td>
  <td>${pill(sevLabels[item.sev] || item.sev, sevColors[item.sev] || C.textSec)}</td>
  <td style="max-width:400px">${esc(item.item)}</td>
  <td class="mono">${esc(item.wcag)}</td>
  <td>${esc(item.nivel)}</td>
  <td>${pill(statusLabels[st] || st, statusColors[st] || C.textSec)}</td>
</tr>`;
}).join("\n")}
</tbody></table>

<!-- Print button -->
<div class="no-print" style="margin-top:2rem;text-align:center">
  <button onclick="window.print()" style="padding:10px 24px;background:${C.accent};color:white;border:none;border-radius:6px;font-size:0.9rem;font-weight:600;cursor:pointer">Imprimir / Guardar como PDF</button>
</div>

</div>
</body>
</html>`;

  return html;
}

export function openReport(audit) {
  const html = generateReport(audit);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  // Clean up after a short delay to allow the browser to load
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
