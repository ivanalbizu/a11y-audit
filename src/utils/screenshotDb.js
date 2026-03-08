const DB_NAME = "a11y-screenshots";
const DB_VERSION = 1;
const STORE = "shots";

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const result = fn(store);
    t.oncomplete = () => resolve(result.result !== undefined ? result.result : undefined);
    t.onerror = () => reject(t.error);
  }));
}

/** Save screenshots for an audit */
export function saveScreenshots(auditId, { screenshots, auditScreenshots }) {
  return tx("readwrite", store =>
    store.put({ screenshots: screenshots || {}, auditScreenshots: auditScreenshots || [] }, auditId)
  );
}

/** Load screenshots for an audit */
export function loadScreenshots(auditId) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, "readonly");
    const req = t.objectStore(STORE).get(auditId);
    req.onsuccess = () => resolve(req.result || { screenshots: {}, auditScreenshots: [] });
    req.onerror = () => reject(req.error);
  }));
}

/** Load screenshots for all audits at once */
export function loadAllScreenshots() {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, "readonly");
    const store = t.objectStore(STORE);
    const map = {};
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        map[cursor.key] = cursor.value;
        cursor.continue();
      } else {
        resolve(map);
      }
    };
    req.onerror = () => reject(req.error);
  }));
}

/** Delete screenshots for an audit */
export function deleteScreenshots(auditId) {
  return tx("readwrite", store => store.delete(auditId));
}

/** Get approximate IndexedDB size for screenshots */
export async function getScreenshotsSizeMB() {
  if (navigator.storage?.estimate) {
    const est = await navigator.storage.estimate();
    return ((est.usage || 0) / (1024 * 1024)).toFixed(2);
  }
  return "?";
}
