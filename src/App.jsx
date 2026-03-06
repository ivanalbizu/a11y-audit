import { useState, useCallback, useEffect } from "react";
import { saveAudits, loadAudits } from "./utils/storage";
import { css } from "./styles/theme";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AuditView from "./components/AuditView";

function getAuditIdFromHash() {
  const match = window.location.hash.match(/^#\/audit\/(.+)$/);
  return match ? match[1] : null;
}

export default function App() {
  const [audits, setAudits] = useState(() => loadAudits());
  const [activeAuditId, setActiveAuditId] = useState(() => getAuditIdFromHash());

  const persist = useCallback((updated) => {
    setAudits(updated);
    saveAudits(updated);
  }, []);

  // Sync hash → state
  useEffect(() => {
    const onHashChange = () => setActiveAuditId(getAuditIdFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Navigate: update hash (which triggers hashchange → state update)
  const navigateTo = useCallback((id) => {
    window.location.hash = id ? `#/audit/${id}` : "#/";
  }, []);

  const createAudit = (domain, auditor, startDate, endDate) => {
    const audit = {
      id: Date.now().toString(),
      domain,
      auditor,
      createdAt: new Date().toISOString(),
      startDate: startDate || null,
      endDate: endDate || null,
      checks: {},
      notes: {},
      customItems: [],
      versions: [],
      screenshots: {},
    };
    const updated = [...audits, audit];
    persist(updated);
    navigateTo(audit.id);
  };

  const updateAudit = (updated) => {
    persist(audits.map(a => a.id === updated.id ? updated : a));
  };

  const mergeImported = (imported) => {
    if (!Array.isArray(imported)) {
      alert("Formato no válido: se esperaba un array de auditorías.");
      return;
    }
    const existingDomains = audits.map(a => a.domain.toLowerCase().trim());
    const duplicates = imported.filter(a => existingDomains.includes(a.domain?.toLowerCase().trim()));
    const newOnes = imported.filter(a => !existingDomains.includes(a.domain?.toLowerCase().trim()));

    if (duplicates.length > 0 && newOnes.length === 0) {
      alert(`Todas las auditorías importadas ya existen:\n${duplicates.map(d => `  - ${d.domain}`).join("\n")}`);
      return;
    }
    if (duplicates.length > 0) {
      const proceed = window.confirm(
        `${duplicates.length} auditoría(s) ya existen y NO se importarán:\n${duplicates.map(d => `  - ${d.domain}`).join("\n")}\n\nSe añadirán ${newOnes.length} nueva(s). ¿Continuar?`
      );
      if (!proceed) return;
    }
    if (newOnes.length > 0) {
      persist([...audits, ...newOnes]);
    }
  };

  const deleteAudit = (id) => {
    persist(audits.filter(a => a.id !== id));
    if (activeAuditId === id) navigateTo(null);
  };

  const activeAudit = audits.find(a => a.id === activeAuditId);

  return (
    <div style={css.app}>
      <Topbar
        audits={audits}
        activeAuditId={activeAuditId}
        onImport={mergeImported}
        onDelete={deleteAudit}
      />
      <div style={css.layout}>
        <Sidebar
          audits={audits}
          activeAuditId={activeAuditId}
          onSelectAudit={navigateTo}
        />
        <main style={css.main}>
          {activeAudit ? (
            <AuditView
              audit={activeAudit}
              onUpdate={updateAudit}
              onBack={() => navigateTo(null)}
            />
          ) : (
            <Dashboard audits={audits} onSelect={navigateTo} onCreate={createAudit} />
          )}
        </main>
      </div>
    </div>
  );
}
