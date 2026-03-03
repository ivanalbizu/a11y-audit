const STORAGE_KEY = "a11y-audits";
const WARN_THRESHOLD = 4 * 1024 * 1024;
const MAX_THRESHOLD = 9 * 1024 * 1024;

export function saveAudits(audits) {
  try {
    const json = JSON.stringify(audits);
    const size = new Blob([json]).size;
    if (size > MAX_THRESHOLD) {
      alert("Almacenamiento casi lleno. Elimina capturas o exporta datos antes de continuar.");
      return false;
    }
    localStorage.setItem(STORAGE_KEY, json);
    if (size > WARN_THRESHOLD) {
      console.warn(`Storage at ${(size / 1024 / 1024).toFixed(1)}MB — approaching limit`);
    }
    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      alert("Almacenamiento lleno. Exporta datos y elimina capturas antiguas.");
    }
    console.error("Error saving audits:", e);
    return false;
  }
}

export function loadAudits() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function exportAudits(audits) {
  const blob = new Blob([JSON.stringify(audits, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `a11y-audits-${new Date().toISOString().slice(0, 10)}.json`;
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
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return "ok";
  const size = new Blob([data]).size;
  if (size > MAX_THRESHOLD) return "full";
  if (size > WARN_THRESHOLD) return "warning";
  return "ok";
}
