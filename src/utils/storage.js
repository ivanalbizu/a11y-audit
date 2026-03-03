const STORAGE_KEY = "a11y-audits";

export function saveAudits(audits) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
  } catch (e) {
    console.error("Error saving audits:", e);
  }
}

export function loadAudits() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
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
    } catch (err) {
      alert("Archivo JSON no válido");
    }
  };
  reader.readAsText(file);
}
