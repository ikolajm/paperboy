/**
 * Normalize a URL for deduplication.
 *
 * Strips tracking params, fragments, trailing slashes, AMP paths,
 * and normalizes scheme/host.
 *
 * Usage:
 *   npx tsx scripts/normalize-url.ts <url>
 *   echo "<url>" | npx tsx scripts/normalize-url.ts
 *
 * Importable:
 *   import { normalizeUrl } from './normalize-url.js';
 */

const STRIP_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "gclsrc", "ref", "source", "_ga", "_gid",
  "ncid", "ocid", "sr_share", "mc_cid", "mc_eid",
]);

export function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!url) return url;

  // Ensure scheme
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const parsed = new URL(url);

  // Normalize scheme
  parsed.protocol = "https:";

  // Normalize host: lowercase, strip www. and amp. subdomains
  let host = parsed.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  if (host.startsWith("amp.")) host = host.slice(4);
  parsed.hostname = host;

  // Strip non-standard port (URL class handles 80/443 automatically)
  // No action needed — new URL() already omits default ports

  // Normalize path: strip AMP suffixes, trailing slashes
  let path = parsed.pathname;
  path = path.replace(/\/amp\/?$/, "");
  path = path.replace(/\.amp\.html$/, ".html");
  path = path.replace(/\/+$/, "") || "/";
  parsed.pathname = path;

  // Strip tracking query params
  const params = parsed.searchParams;
  const keysToDelete: string[] = [];
  for (const key of params.keys()) {
    if (STRIP_PARAMS.has(key.toLowerCase())) {
      keysToDelete.push(key);
    }
  }
  for (const key of keysToDelete) {
    params.delete(key);
  }

  // Strip fragment
  parsed.hash = "";

  return parsed.toString();
}

// --- CLI entry point ---

async function main() {
  let url: string;

  if (process.argv.length > 2) {
    url = process.argv[2];
  } else {
    // Read from stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    url = Buffer.concat(chunks).toString("utf-8").trim();
  }

  const result = normalizeUrl(url);
  if (result) {
    console.log(result);
  }
}

// Run CLI if invoked directly
const isMain = process.argv[1]?.endsWith("normalize-url.ts") ||
               process.argv[1]?.endsWith("normalize-url.js");
if (isMain) {
  main();
}
