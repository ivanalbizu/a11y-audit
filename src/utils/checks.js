/**
 * Helpers for the checks data model.
 *
 * New format:  checks[id] = { status: "pass", scope: "header" }
 * Old format:  checks[id] = "pass"  (string — backward-compatible)
 */

/** Normalise a single check entry (string → object) */
function norm(entry) {
  if (!entry) return { status: "pending", scope: null };
  if (typeof entry === "string") return { status: entry, scope: null };
  return { status: entry.status || "pending", scope: entry.scope || null };
}

/** Get the status string for an item */
export function getStatus(checks, id) {
  return norm(checks[id]).status;
}

/** Get the scope for an item (null = page-specific / unscoped) */
export function getScope(checks, id) {
  return norm(checks[id]).scope;
}

/** Check if an item was inherited from another audit */
export function isInherited(checks, id) {
  const entry = checks[id];
  return entry && typeof entry === "object" && !!entry.inherited;
}

/** Set only the status, preserving scope */
export function setCheckStatus(checks, id, status) {
  const prev = norm(checks[id]);
  return { ...checks, [id]: { ...prev, status } };
}

/** Set only the scope, preserving status */
export function setCheckScope(checks, id, scope) {
  const prev = norm(checks[id]);
  return { ...checks, [id]: { ...prev, scope: scope || null } };
}

/** Migrate a full checks object from old string format to new object format */
export function migrateChecks(checks) {
  if (!checks || typeof checks !== "object") return {};
  const out = {};
  for (const [id, entry] of Object.entries(checks)) {
    out[id] = typeof entry === "string" ? { status: entry, scope: null } : entry;
  }
  return out;
}

/** Migrate an entire audit (checks + version snapshots) */
export function migrateAudit(audit) {
  const migrated = { ...audit, checks: migrateChecks(audit.checks) };
  if (Array.isArray(migrated.versions)) {
    migrated.versions = migrated.versions.map(v => ({
      ...v,
      checks: migrateChecks(v.checks),
    }));
  }
  if (!migrated.customScopes) migrated.customScopes = [];
  return migrated;
}
