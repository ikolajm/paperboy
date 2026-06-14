/**
 * Article fetch utility for deep-dive generation: resolve → fetch → extract.
 *
 * Every stage fails soft. The caller gets a FetchedArticle with `ok: false` and a
 * `reason` instead of a thrown error, so synthesis can fall back to the digest's
 * snippet/headline and lean on the sources that did land.
 *
 * Shape forced by the 2026-06-14 URL-fetch spike (see context/DEEP-DIVE-ROADMAP.md):
 *   - Google News `CBMi…` URLs (100% of related_articles, ~58% of story URLs) do NOT
 *     redirect server-side. They resolve via a `batchexecute` call (resolveUrl below).
 *   - ~30% of resolved/direct URLs hard-wall (NYT 403, Reuters 401, ESPN 202 JS
 *     challenge). No headless browser in V1 — those become ok:false, reason set.
 */

import { JSDOM, VirtualConsole } from "jsdom";
import { Readability } from "@mozilla/readability";

/** Swallow jsdom's CSS-parse / resource-load noise so it doesn't spam server logs. */
const silentConsole = new VirtualConsole();

const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const TIMEOUT_MS = 15000;
/** Below this many words, treat extraction as failed (bot-wall / paywall / shell). */
const MIN_WORDS = 250;

export type FetchFailReason =
  | "null-url"
  | "resolve-failed"
  | "http-error"
  | "too-short"
  | "fetch-error";

/** Log prefix for the resolver — makes silent degradation greppable in server logs. */
const LOG = "[deep-dive/resolve]";

/**
 * A fetched article — discriminated on `ok` so `text` is guaranteed present on
 * success and `reason` present on failure (no "did we get a body?" ambiguity).
 */
export type FetchedArticle =
  | {
      ok: true;
      /** Original URL from the digest — may be a Google News redirect. */
      sourceUrl: string;
      /** Publisher URL actually fetched (=== sourceUrl for direct links). */
      resolvedUrl: string;
      /** Article title from Readability, when available. */
      title: string | null;
      /** Clean article body text. */
      text: string;
    }
  | {
      ok: false;
      sourceUrl: string | null;
      resolvedUrl: string | null;
      title: string | null;
      text: null;
      /** Why the body is unavailable. */
      reason: FetchFailReason;
    };

function fail(
  sourceUrl: string | null,
  resolvedUrl: string | null,
  reason: FetchFailReason,
  title: string | null = null
): FetchedArticle {
  return { ok: false, sourceUrl, resolvedUrl, title, text: null, reason };
}

function isGoogleNews(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.endsWith("news.google.com") && /\/articles\//.test(u.pathname);
  } catch {
    return false;
  }
}

async function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      ...init,
      headers: { "user-agent": BROWSER_UA, ...(init?.headers ?? {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Google's RPC method id for URL resolution (DotsSplashUi batchexecute). */
const GNEWS_RESOLVE_RPC = "Fbv4je";
const GNEWS_BATCHEXECUTE_URL = "https://news.google.com/_/DotsSplashUi/data/batchexecute";

/** The signature/timestamp/id Google requires to resolve a redirect URL. */
interface ResolutionTokens {
  /** The CBMi… article id from the URL path. */
  id: string;
  /** `data-n-a-ts` timestamp scraped from the article page. */
  ts: string;
  /** `data-n-a-sg` signature scraped from the article page. */
  sg: string;
}

/** Scrape the resolution tokens Google embeds in the article page. */
async function fetchResolutionTokens(url: string): Promise<ResolutionTokens | null> {
  const res = await timedFetch(url);
  if (!res.ok) {
    console.warn(`${LOG} article page fetch HTTP ${res.status}`);
    return null;
  }
  const html = await res.text();

  const sg = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
  const ts = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
  const id = new URL(url).pathname.match(/\/articles\/([^/?]+)/)?.[1];
  if (!sg || !ts || !id) {
    // Load-bearing assumption: these markers exist. Missing = Google likely changed
    // the page format — distinct from a network failure, and worth a loud signal.
    console.warn(`${LOG} resolution markers missing (sg/ts/id) — Google News format may have changed`);
    return null;
  }
  return { id, ts, sg };
}

/**
 * Encode the batchexecute request body. This is a fixed, reverse-engineered Google
 * wire format — the nested literal is not meant to be read, only kept intact. Only
 * id/ts/sg vary; everything else is constant protocol scaffolding.
 */
function buildResolveRequest({ id, ts, sg }: ResolutionTokens): string {
  const rpc = ["garturlreq", [["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0], id, ts, sg];
  const payload = [[[GNEWS_RESOLVE_RPC, JSON.stringify(rpc), null, "generic"]]];
  return "f.req=" + encodeURIComponent(JSON.stringify(payload));
}

/** POST the resolution request and pull the publisher URL out of the response. */
async function requestPublisherUrl(tokens: ResolutionTokens): Promise<string | null> {
  const res = await timedFetch(GNEWS_BATCHEXECUTE_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: buildResolveRequest(tokens),
  });
  if (!res.ok) {
    console.warn(`${LOG} batchexecute HTTP ${res.status}`);
    return null;
  }
  const text = await res.text();

  const resolved = text.match(/garturlres\\",\\"(https?:[^\\"]+)/)?.[1] ?? null;
  if (!resolved) {
    console.warn(`${LOG} batchexecute returned no garturlres — Google News format may have changed`);
  }
  return resolved;
}

/**
 * Resolve a digest URL to a fetchable publisher URL.
 *
 * Google News `/articles/CBMi…` URLs don't redirect server-side; they resolve via
 * batchexecute: scrape tokens off the page → POST them → parse `garturlres`. Direct
 * publisher URLs pass through unchanged. Returns null if resolution fails.
 */
export async function resolveUrl(url: string): Promise<string | null> {
  if (!isGoogleNews(url)) return url;

  try {
    const tokens = await fetchResolutionTokens(url);
    if (!tokens) return null;
    return await requestPublisherUrl(tokens);
  } catch (err) {
    console.warn(`${LOG} error: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Fetch and extract clean article text for a single digest URL.
 *
 * Resolves the URL (Google News → publisher), fetches with a browser UA, and runs
 * Readability. Fails soft at every stage — never throws; sets `ok: false` + `reason`.
 */
export async function fetchArticle(sourceUrl: string | null): Promise<FetchedArticle> {
  if (!sourceUrl) return fail(sourceUrl, null, "null-url");

  const resolved = await resolveUrl(sourceUrl);
  if (!resolved) return fail(sourceUrl, null, "resolve-failed");

  let html: string;
  try {
    const res = await timedFetch(resolved);
    if (!res.ok) return fail(sourceUrl, resolved, "http-error");
    html = await res.text();
  } catch {
    return fail(sourceUrl, resolved, "fetch-error");
  }

  let title: string | null = null;
  let text: string | null = null;
  try {
    const doc = new JSDOM(html, { url: resolved, virtualConsole: silentConsole }).window.document;
    const article = new Readability(doc).parse();
    title = article?.title?.trim() || null;
    text = article?.textContent?.trim() || null;
  } catch {
    return fail(sourceUrl, resolved, "fetch-error");
  }

  if (!text || wordCount(text) < MIN_WORDS) {
    return fail(sourceUrl, resolved, "too-short", title);
  }

  return { ok: true, sourceUrl, resolvedUrl: resolved, title, text };
}
