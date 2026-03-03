import { useState, useCallback } from "react";
import { saveAudits, loadAudits } from "./utils/storage";
import { css } from "./styles/theme";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AuditView from "./components/AuditView";

export default function App() {
  const [audits, setAudits] = useState(() => loadAudits());
  const [activeAuditId, setActiveAuditId] = useState(null);

  const persist = useCallback((updated) => {
    setAudits(updated);
    saveAudits(updated);
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
    };
    const updated = [...audits, audit];
    persist(updated);
    setActiveAuditId(audit.id);
  };

  const updateAudit = (updated) => {
    persist(audits.map(a => a.id === updated.id ? updated : a));
  };

  const deleteAudit = (id) => {
    persist(audits.filter(a => a.id !== id));
    if (activeAuditId === id) setActiveAuditId(null);
  };

  const activeAudit = audits.find(a => a.id === activeAuditId);

  return (
    <div style={css.app}>
      <Topbar
        audits={audits}
        activeAuditId={activeAuditId}
        onImport={persist}
        onDelete={deleteAudit}
      />
      <div style={css.layout}>
        <Sidebar
          audits={audits}
          activeAuditId={activeAuditId}
          onSelectAudit={setActiveAuditId}
        />
        <main style={css.main}>
          {activeAudit ? (
            <AuditView
              audit={activeAudit}
              onUpdate={updateAudit}
              onBack={() => setActiveAuditId(null)}
            />
          ) : (
            <Dashboard audits={audits} onSelect={setActiveAuditId} onCreate={createAudit} />
          )}
        </main>
      </div>
    </div>
  );
}
