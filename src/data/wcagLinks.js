const BASE = "https://www.w3.org/WAI/WCAG22/Understanding/";

const SLUGS = {
  "1.1.1": "non-text-content",
  "1.2.2": "captions-prerecorded",
  "1.2.3": "audio-description-or-media-alternative-prerecorded",
  "1.3.1": "info-and-relationships",
  "1.3.3": "sensory-characteristics",
  "1.3.4": "orientation",
  "1.3.5": "identify-input-purpose",
  "1.4.1": "use-of-color",
  "1.4.2": "audio-control",
  "1.4.3": "contrast-minimum",
  "1.4.4": "resize-text",
  "1.4.10": "reflow",
  "1.4.11": "non-text-contrast",
  "2.1.1": "keyboard",
  "2.1.2": "no-keyboard-trap",
  "2.1.4": "character-key-shortcuts",
  "2.2.1": "timing-adjustable",
  "2.2.2": "pause-stop-hide",
  "2.3.1": "three-flashes-or-below-threshold",
  "2.3.3": "animation-from-interactions",
  "2.4.1": "bypass-blocks",
  "2.4.2": "page-titled",
  "2.4.3": "focus-order",
  "2.4.4": "link-purpose-in-context",
  "2.4.5": "multiple-ways",
  "2.4.7": "focus-visible",
  "2.4.8": "location",
  "2.4.11": "focus-not-obscured-minimum",
  "2.5.1": "pointer-gestures",
  "2.5.2": "pointer-cancellation",
  "2.5.4": "motion-actuation",
  "2.5.8": "target-size-minimum",
  "3.1.1": "language-of-page",
  "3.1.2": "language-of-parts",
  "3.1.4": "abbreviations",
  "3.1.5": "reading-level",
  "3.2.1": "on-focus",
  "3.2.3": "consistent-navigation",
  "3.2.5": "change-on-request",
  "3.3.1": "error-identification",
  "3.3.2": "labels-or-instructions",
  "3.3.3": "error-suggestion",
  "3.3.4": "error-prevention-legal-financial-data",
  "4.1.1": "parsing",
  "4.1.2": "name-role-value",
  "4.1.3": "status-messages",
};

/** Returns the W3C Understanding page URL for a WCAG criterion, or null */
export function getWcagUrl(criterion) {
  if (!criterion || criterion === "—") return null;
  // Handle composite criteria like "1.1.1 / 1.3.1" — link to the first one
  const first = criterion.split("/")[0].trim();
  const slug = SLUGS[first];
  return slug ? `${BASE}${slug}` : null;
}
