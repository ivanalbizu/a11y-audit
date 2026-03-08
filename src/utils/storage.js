import { migrateAudit } from "./checks";
import { saveScreenshots, loadAllScreenshots, deleteScreenshots } from "./screenshotDb";

const STORAGE_KEY = "a11y-audits";

/** Strip screenshots from audit for localStorage (lightweight) */
function stripScreenshots(audit) {
  const { screenshots, auditScreenshots, ...rest } = audit;
  return rest;
}

/** Save audits: lightweight data to localStorage, screenshots to IndexedDB */
export async function saveAudits(audits) {
  try {
    // Save screenshots to IndexedDB (in parallel)
    await Promise.all(audits.map(a =>
      saveScreenshots(a.id, {
        screenshots: a.screenshots || {},
        auditScreenshots: a.auditScreenshots || [],
      })
    ));

    // Save lightweight data to localStorage
    const lightweight = audits.map(stripScreenshots);
    const json = JSON.stringify(lightweight);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      alert("Almacenamiento lleno. Exporta datos y elimina capturas antiguas.");
    }
    console.error("Error saving audits:", e);
    return false;
  }
}

/** Load audits from localStorage + hydrate with screenshots from IndexedDB */
export async function loadAudits() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let audits = data ? JSON.parse(data) : [];
    audits = audits.map(migrateAudit);

    // Migrate: if any audit still has screenshots in localStorage, move to IndexedDB
    const needsMigration = audits.some(a =>
      (a.screenshots && Object.keys(a.screenshots).length > 0) ||
      (a.auditScreenshots && a.auditScreenshots.length > 0)
    );

    if (needsMigration) {
      await Promise.all(audits.map(a =>
        saveScreenshots(a.id, {
          screenshots: a.screenshots || {},
          auditScreenshots: a.auditScreenshots || [],
        })
      ));
      // Re-save without screenshots to free localStorage
      const lightweight = audits.map(stripScreenshots);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
      console.info("Screenshots migrated from localStorage to IndexedDB");
    }

    // Hydrate with screenshots from IndexedDB
    const allShots = await loadAllScreenshots();
    return audits.map(a => ({
      ...a,
      screenshots: allShots[a.id]?.screenshots || a.screenshots || {},
      auditScreenshots: allShots[a.id]?.auditScreenshots || a.auditScreenshots || [],
    }));
  } catch (e) {
    console.error("Error loading audits:", e);
    return [];
  }
}

export async function exportAudits(audits) {
  const blob = new Blob([JSON.stringify(audits, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `a11y-audits-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportSingleAudit(audit) {
  const blob = new Blob([JSON.stringify(audit, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-${audit.domain.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAudits(file, onLoad) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      onLoad(JSON.parse(e.target.result));
    } catch {
      alert("Archivo JSON no válido");
    }
  };
  reader.readAsText(file);
}

export function getStorageSizeMB() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return "0.00";
  return (new Blob([data]).size / (1024 * 1024)).toFixed(2);
}

export function checkStorageCapacity() {
  // With IndexedDB handling screenshots, localStorage usage is much lower
  // but we still check for safety
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return "ok";
  const size = new Blob([data]).size;
  if (size > 9 * 1024 * 1024) return "full";
  if (size > 4 * 1024 * 1024) return "warning";
  return "ok";
}

export function exportCsv(items, checks, getStatusFn, getScopeFn, domain) {
  const headers = ["ID", "Área", "Categoría", "Descripción", "WCAG", "Nivel", "Severidad", "Tipo", "Estado", "Scope"];
  const esc = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
  const rows = items.map(i => [
    i.id, i.area, i.cat, i.item, i.wcag, i.nivel, i.sev, i.tipo,
    getStatusFn(checks, i.id), getScopeFn(checks, i.id) || "",
  ].map(esc).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-${(domain || "export").replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyAsTable(items, checks, getStatusFn, getScopeFn) {
  const headers = ["ID", "Sev.", "Descripción", "WCAG", "Nivel", "Estado", "Scope"];
  const htmlRows = items.map(i =>
    `<tr><td>${i.id}</td><td>${i.sev}</td><td>${i.item}</td><td>${i.wcag}</td><td>${i.nivel}</td><td>${getStatusFn(checks, i.id)}</td><td>${getScopeFn(checks, i.id) || "—"}</td></tr>`
  ).join("");
  const html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${htmlRows}</tbody></table>`;
  const plain = [headers.join("\t"), ...items.map(i =>
    [i.id, i.sev, i.item, i.wcag, i.nivel, getStatusFn(checks, i.id), getScopeFn(checks, i.id) || "—"].join("\t")
  )].join("\n");
  navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    })
  ]);
}

export { deleteScreenshots };
