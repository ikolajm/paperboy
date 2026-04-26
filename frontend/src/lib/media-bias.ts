import biasData from './media-bias.json';

export type Lean = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';
export type Factual = 'high' | 'mostly-factual' | 'mixed' | 'low';

export interface MediaBias {
  name: string;
  lean: Lean;
  factual: Factual;
}

type BiasEntry = { name: string; lean: string; factual: string };

const { _meta, ...bias } = biasData as Record<string, unknown>;
const biasMap = bias as Record<string, BiasEntry>;

// Reverse lookup: outlet name (lowercase) → bias entry
const biasByName = new Map<string, BiasEntry>();
for (const entry of Object.values(biasMap)) {
  biasByName.set(entry.name.toLowerCase(), entry);
}

/** Extract bare domain from a URL: "https://www.nytimes.com" → "nytimes.com" */
function extractDomain(url: string): string {
  try {
    const host = new URL(url).hostname;
    // Strip leading "www."
    return host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Look up media bias by source URL or outlet name. */
export function getMediaBias(sourceUrl?: string): MediaBias | null {
  if (!sourceUrl) return null;
  const domain = extractDomain(sourceUrl);
  if (!domain) return null;

  const entry = biasMap[domain];
  if (!entry) return null;

  return entry as MediaBias;
}

/** Look up media bias by bare domain string (e.g. "nytimes.com"). */
export function getMediaBiasByDomain(domain: string): MediaBias | null {
  const clean = domain.replace(/^www\./, '');
  const entry = biasMap[clean];
  return entry ? (entry as MediaBias) : null;
}

/** Look up media bias by outlet display name (e.g. "Fox News"). */
export function getMediaBiasByName(outletName: string): MediaBias | null {
  const entry = biasByName.get(outletName.toLowerCase());
  return entry ? (entry as MediaBias) : null;
}

/** Build a Google Favicon URL from a source URL. */
export function getFaviconUrl(sourceUrl: string, size = 32): string {
  const domain = extractDomain(sourceUrl);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/** Lean label for display. */
export function leanLabel(lean: Lean): string {
  switch (lean) {
    case 'left': return 'Left';
    case 'lean-left': return 'Lean Left';
    case 'center': return 'Center';
    case 'lean-right': return 'Lean Right';
    case 'right': return 'Right';
  }
}

/** Color for lean values: blue (left) → purple (center) → red (right). */
export function leanColor(lean: Lean): string {
  switch (lean) {
    case 'left': return '#2563eb';        // blue-600
    case 'lean-left': return '#7c6cc4';   // blue-purple blend
    case 'center': return '#9333ea';      // purple-600
    case 'lean-right': return '#c4536c';  // purple-red blend
    case 'right': return '#dc2626';       // red-600
  }
}
