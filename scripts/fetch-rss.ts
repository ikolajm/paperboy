/**
 * Fetch and parse RSS feeds, returning JSON.
 *
 * Handles RSS 2.0, Atom, Google News redirect detection,
 * iTunes duration parsing, and HTML entity cleanup.
 *
 * Usage:
 *   # Single feed (JSON output):
 *   npx tsx scripts/fetch-rss.ts <rss_url> [max_items]
 *
 *   # Batch mode (JSON input/output, parallel fetching):
 *   npx tsx scripts/fetch-rss.ts --batch feeds.json
 *   echo '[{"label":"MMA","url":"...","max":5}]' | npx tsx scripts/fetch-rss.ts --batch -
 *
 * Importable:
 *   import { fetchBatch, fetchFeedEntries } from './fetch-rss.js';
 */

import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "node:fs";
import type { RssEntry, RssBatchItem, RssBatchResult } from "../shared/types/digest.js";
import type { RelatedArticle } from "../shared/types/editorial.js";

// --- HTML entity decoding ---

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">",
  "&quot;": '"', "&#39;": "'", "&apos;": "'",
};

function decodeEntities(text: string): string {
  return text
    .replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (m) => ENTITY_MAP[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// --- Text utilities ---

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
}

function truncateToSentences(text: string, maxSentences = 2): string {
  if (!text) return "";

  let clean = decodeEntities(text);
  clean = stripHtml(clean);
  clean = clean.replace(/\s+/g, " ").trim();

  const sentences = clean.split(/(?<=[.!?])\s+/);
  let result = sentences.slice(0, maxSentences).join(" ");

  if (result.length > 300) {
    result = result.slice(0, 297) + "...";
  }

  return result;
}

// --- Google News detection ---

function isGoogleNewsUrl(url: string): boolean {
  return url.includes("news.google.com/rss/articles/");
}

// --- Google News related articles parsing ---

/**
 * Parse the <description> HTML from Google News topic/top-stories feeds.
 * Returns related articles from outlets 2–5 (skips the first, which
 * duplicates the primary <title>/<link>).
 *
 * Topic feeds: <ol><li><a href="...">Headline</a>&nbsp;&nbsp;<font>Outlet</font></li>...</ol>
 * Search feeds: single <a href="...">Headline</a>&nbsp;&nbsp;<font>Outlet</font>
 */
function parseGoogleNewsRelated(descriptionRaw: string): RelatedArticle[] {
  // fast-xml-parser with processEntities:false keeps HTML entity-encoded;
  // decode so we can parse the actual HTML tags
  const descriptionHtml = decodeEntities(descriptionRaw);
  if (!descriptionHtml.includes("<ol>")) return [];

  const articles: RelatedArticle[] = [];
  // Match each <li> block
  const liPattern = /<li>.*?<a[^>]+href="([^"]*)"[^>]*>([^<]*)<\/a>.*?<font[^>]*>([^<]*)<\/font>.*?<\/li>/gs;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = liPattern.exec(descriptionHtml)) !== null) {
    // Skip the first <li> — it duplicates the primary story
    if (index > 0) {
      const [, url, headline, outlet] = match;
      if (url && headline && outlet) {
        articles.push({
          headline: decodeEntities(headline).trim(),
          url: url.trim(),
          outlet: decodeEntities(outlet).trim(),
        });
      }
    }
    index++;
  }

  return articles;
}

// --- iTunes duration parsing ---

function parseDuration(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map(Number);
    if (parts.length === 3) {
      const [h, m] = parts;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    } else if (parts.length === 2) {
      return `${parts[0]}m`;
    }
  } else {
    const total = parseInt(trimmed, 10);
    if (!isNaN(total)) {
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
  }

  return undefined;
}

// --- XML parser config ---

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (name) => name === "item" || name === "entry",
  processEntities: false,
});

// --- Feed fetching ---

async function fetchFeedXml(url: string, timeout = 15000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Paperboy/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    return await resp.text();
  } finally {
    clearTimeout(timer);
  }
}

// --- Feed parsing ---

function getTextContent(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (node && typeof node === "object" && "#text" in node) {
    return String((node as Record<string, unknown>)["#text"]);
  }
  return "";
}

export function parseFeed(xml: string, maxItems = 5, feedUrl?: string): RssEntry[] {
  const isEspnFeed = feedUrl ? feedUrl.includes("espn.com") : false;
  const parsed = parser.parse(xml);
  const entries: RssEntry[] = [];

  // RSS 2.0
  const channel = parsed?.rss?.channel;
  let items: unknown[] | undefined;

  if (channel) {
    items = channel.item;
  }

  // Atom fallback
  if (!items) {
    const feed = parsed?.feed;
    if (feed?.entry) {
      items = feed.entry;
    }
  }

  if (!items || !Array.isArray(items)) return entries;

  for (const item of items.slice(0, maxItems)) {
    const raw = item as Record<string, unknown>;

    // Link (extract first — needed for Google News title cleanup)
    let url = "";
    if (typeof raw.link === "string") {
      url = raw.link.trim();
    } else if (raw.link && typeof raw.link === "object") {
      url = (raw.link as Record<string, string>)["@_href"] || "";
    }

    // Title — strip Google News " - Outlet Name" suffix
    let title = getTextContent(raw.title);
    title = decodeEntities(title).trim();
    if (title.includes(" - ") && isGoogleNewsUrl(url)) {
      title = title.replace(/ - [^-]+$/, "").trim();
    }

    // Pub date
    const pubDate = getTextContent(raw.pubDate || raw.published || raw.updated || "");

    // Description / summary
    const descRaw = getTextContent(raw.description || raw.summary || raw.content || "");
    let snippet = descRaw && descRaw !== "null" ? truncateToSentences(descRaw) : "";

    // Source name, URL, and author
    let source = "";
    let sourceUrl: string | undefined;
    let author: string | undefined;

    if (raw.source) {
      source = getTextContent(raw.source);
      // Google News <source url="https://..."> attribute
      if (typeof raw.source === "object") {
        const srcObj = raw.source as Record<string, unknown>;
        if (srcObj["@_url"]) {
          sourceUrl = String(srcObj["@_url"]);
        }
      }
    }

    // dc:creator — author name (ESPN), or fallback source for other feeds
    if (raw["dc:creator"]) {
      const creator = getTextContent(raw["dc:creator"]);
      if (isEspnFeed) {
        // ESPN: dc:creator is the author, outlet is always "ESPN"
        author = creator;
        if (!source) source = "ESPN";
      } else if (!source) {
        source = creator;
      }
    }

    // iTunes duration (podcast feeds)
    let duration: string | undefined;
    if (raw["itunes:duration"]) {
      duration = parseDuration(getTextContent(raw["itunes:duration"]));
    }

    // Podcast artwork: itunes:image (episode-level), media:thumbnail fallback
    let imageUrl: string | undefined;
    if (raw["itunes:image"] && typeof raw["itunes:image"] === "object") {
      const img = raw["itunes:image"] as Record<string, unknown>;
      if (img["@_href"]) imageUrl = String(img["@_href"]);
    }
    if (!imageUrl && raw["media:thumbnail"] && typeof raw["media:thumbnail"] === "object") {
      const thumb = raw["media:thumbnail"] as Record<string, unknown>;
      if (thumb["@_url"]) imageUrl = String(thumb["@_url"]);
    }

    // Audio URL from <enclosure>
    let audioUrl: string | undefined;
    if (raw.enclosure && typeof raw.enclosure === "object") {
      const enc = raw.enclosure as Record<string, unknown>;
      if (enc["@_type"]?.toString().startsWith("audio/") && enc["@_url"]) {
        audioUrl = String(enc["@_url"]);
      }
    }

    // Google News redirect detection
    const googleNewsRedirect = url ? isGoogleNewsUrl(url) : false;

    // Google News: parse related articles from <description> HTML, clear snippet
    let relatedArticles: RelatedArticle[] | undefined;
    if (googleNewsRedirect) {
      relatedArticles = parseGoogleNewsRelated(descRaw);
      // Google News snippets just echo the title + outlet — clear them
      snippet = "";
    }

    const entry: RssEntry = {
      title,
      url,
      source,
      date: pubDate,
      snippet,
    };

    if (sourceUrl) entry.source_url = sourceUrl;
    if (author) entry.author = author;
    if (duration) entry.duration = duration;
    if (imageUrl) entry.image_url = imageUrl;
    if (audioUrl) entry.audio_url = audioUrl;
    if (googleNewsRedirect) entry.google_news_redirect = true;
    if (relatedArticles && relatedArticles.length > 0) entry.related_articles = relatedArticles;

    entries.push(entry);
  }

  return entries;
}

// --- Public API ---

export async function fetchFeedEntries(url: string, maxItems = 5): Promise<RssEntry[]> {
  const xml = await fetchFeedXml(url);
  return parseFeed(xml, maxItems, url);
}

export async function fetchOne(
  config: RssBatchItem
): Promise<[string, RssEntry[] | { status: "fetch_error"; error: string }]> {
  try {
    const entries = await fetchFeedEntries(config.url, config.max);
    return [config.label, entries];
  } catch (err) {
    return [config.label, {
      status: "fetch_error",
      error: err instanceof Error ? err.message : String(err),
    }];
  }
}

export async function fetchBatch(feeds: RssBatchItem[]): Promise<RssBatchResult> {
  const results: RssBatchResult = {};

  const promises = feeds.map((feed) => fetchOne(feed));
  const settled = await Promise.all(promises);

  for (const [label, data] of settled) {
    results[label] = data;
  }

  return results;
}

// --- CLI entry point ---

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: npx tsx scripts/fetch-rss.ts <rss_url> [max_items]");
    console.error("       npx tsx scripts/fetch-rss.ts --batch <feeds.json | ->");
    process.exit(1);
  }

  // Batch mode
  if (process.argv[2] === "--batch") {
    const source = process.argv[3] || "-";
    let feedsJson: string;

    if (source === "-") {
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk as Buffer);
      }
      feedsJson = Buffer.concat(chunks).toString("utf-8");
    } else {
      feedsJson = readFileSync(source, "utf-8");
    }

    const feeds: RssBatchItem[] = JSON.parse(feedsJson);
    const results = await fetchBatch(feeds);
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  }

  // Single URL mode
  const rssUrl = process.argv[2];
  const maxItems = process.argv[3] ? parseInt(process.argv[3], 10) : 5;

  try {
    const entries = await fetchFeedEntries(rssUrl, maxItems);
    console.log(JSON.stringify(entries, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      status: "fetch_error",
      url: rssUrl,
      error: err instanceof Error ? err.message : String(err),
    }));
  }
}

// Run CLI if invoked directly
const isMain = process.argv[1]?.endsWith("fetch-rss.ts") ||
               process.argv[1]?.endsWith("fetch-rss.js");
if (isMain) {
  main();
}
