/**
 * Audit media bias coverage against recent digests.
 *
 * Scans all digest.json files, collects outlet domains and names,
 * checks each against config/media-bias.json, and reports gaps
 * sorted by frequency.
 *
 * Usage:
 *   npx tsx scripts/audit-media-bias.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DIGEST_ROOT = path.join(REPO_ROOT, "digests");
const BIAS_PATH = path.join(REPO_ROOT, "config", "media-bias.json");

interface BiasEntry {
  name: string;
  lean: string;
  factual: string;
}

function extractDomain(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isLocalStation(domain: string): boolean {
  // US local TV stations typically start with W or K call letters
  const base = domain.split(".")[0];
  return /^[wk][a-z]{2,4}(tv)?$/i.test(base);
}

function main() {
  // Load bias map
  const biasRaw = JSON.parse(readFileSync(BIAS_PATH, "utf-8"));
  const { _meta, ...biasMap } = biasRaw as Record<string, unknown>;
  const mappedDomains = new Set(Object.keys(biasMap));

  // Build reverse lookup: name → domain
  const nameToMapped = new Map<string, string>();
  for (const [domain, entry] of Object.entries(biasMap)) {
    const e = entry as BiasEntry;
    nameToMapped.set(e.name.toLowerCase(), domain);
  }

  // Scan digests
  const domainCounts = new Map<string, number>();
  const outletCounts = new Map<string, number>();
  let digestCount = 0;

  const dates = readdirSync(DIGEST_ROOT).filter((f) => {
    const full = path.join(DIGEST_ROOT, f);
    return statSync(full).isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(f);
  });

  for (const date of dates) {
    const digestPath = path.join(DIGEST_ROOT, date, "digest.json");
    let digest: Record<string, unknown>;
    try {
      digest = JSON.parse(readFileSync(digestPath, "utf-8"));
    } catch {
      continue;
    }
    digestCount++;

    const sections = digest.sections as Record<string, unknown>;
    if (!sections) continue;

    // Collect source_urls
    const collectSourceUrl = (item: Record<string, unknown>) => {
      const url = item.source_url as string | undefined;
      if (url) {
        const domain = extractDomain(url);
        if (domain) domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      }
    };

    // Collect related article outlets
    const collectRelated = (item: Record<string, unknown>) => {
      const related = item.related_articles as Array<Record<string, string>> | undefined;
      if (related) {
        for (const ra of related) {
          if (ra.outlet) outletCounts.set(ra.outlet, (outletCounts.get(ra.outlet) || 0) + 1);
        }
      }
    };

    // Walk all story-bearing sections
    const popular = sections.popular_today as Array<Record<string, unknown>> | undefined;
    if (popular) {
      for (const story of popular) {
        collectSourceUrl(story);
        collectRelated(story);
      }
    }

    for (const key of ["for_you", "on_your_radar"]) {
      const topicSections = sections[key] as Array<Record<string, unknown>> | undefined;
      if (topicSections) {
        for (const sec of topicSections) {
          const stories = sec.stories as Array<Record<string, unknown>> | undefined;
          if (stories) stories.forEach((s) => { collectSourceUrl(s); collectRelated(s); });
        }
      }
    }

    const opinions = sections.opinions as Array<Record<string, unknown>> | undefined;
    if (opinions) opinions.forEach((o) => { collectSourceUrl(o); collectRelated(o); });

    const local = sections.local as Record<string, Array<Record<string, unknown>>> | undefined;
    if (local?.locations) {
      for (const loc of local.locations) {
        const stories = (loc as Record<string, unknown>).stories as Array<Record<string, unknown>> | undefined;
        if (stories) stories.forEach(collectSourceUrl);
      }
    }
  }

  // Report
  console.log(`Scanned ${digestCount} digests\n`);

  // Unmapped domains
  const unmappedDomains = [...domainCounts.entries()]
    .filter(([domain]) => !mappedDomains.has(domain))
    .sort((a, b) => b[1] - a[1]);

  const localDomains = unmappedDomains.filter(([d]) => isLocalStation(d));
  const nonLocalDomains = unmappedDomains.filter(([d]) => !isLocalStation(d));

  console.log(`=== UNMAPPED DOMAINS (${nonLocalDomains.length} non-local) ===`);
  for (const [domain, count] of nonLocalDomains) {
    console.log(`  ${domain} (${count}x)`);
  }

  if (localDomains.length > 0) {
    console.log(`\n=== LOCAL STATIONS (${localDomains.length}, unmapped) ===`);
    for (const [domain, count] of localDomains) {
      console.log(`  ${domain} (${count}x)`);
    }
  }

  // Unmapped related article outlets
  const unmappedOutlets = [...outletCounts.entries()]
    .filter(([name]) => !nameToMapped.has(name.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);

  console.log(`\n=== UNMAPPED RELATED OUTLETS (${unmappedOutlets.length}) ===`);
  for (const [outlet, count] of unmappedOutlets) {
    console.log(`  ${outlet} (${count}x)`);
  }

  // Coverage summary
  const totalDomains = domainCounts.size;
  const mappedCount = [...domainCounts.keys()].filter((d) => mappedDomains.has(d)).length;
  const totalOutlets = outletCounts.size;
  const mappedOutletCount = [...outletCounts.keys()].filter((n) => nameToMapped.has(n.toLowerCase())).length;

  console.log(`\n=== COVERAGE ===`);
  console.log(`  Domains: ${mappedCount}/${totalDomains} (${Math.round(100 * mappedCount / totalDomains)}%)`);
  console.log(`  Related outlets: ${mappedOutletCount}/${totalOutlets} (${Math.round(100 * mappedOutletCount / totalOutlets)}%)`);

  // Generate stub for easy copy-paste
  if (nonLocalDomains.length > 0) {
    console.log(`\n=== STUB (copy into media-bias.json) ===`);
    for (const [domain] of nonLocalDomains.slice(0, 10)) {
      console.log(`  "${domain}": { "name": "${domain}", "lean": "center", "factual": "high" },`);
    }
  }
}

main();
