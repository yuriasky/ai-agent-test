// FNV-1a 32-bit hash over UTF-16 code units of the raw Figma SVG export.
// The exact same function runs inside Figma (use_figma) during a sync, so hashes must stay identical.
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function toFileName(figmaName) {
  return figmaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.svg';
}
