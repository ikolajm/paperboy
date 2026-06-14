/**
 * News deep-dive generation orchestration:
 *   resolve story from digest → gather article bodies → synthesize → write .md
 *
 * The deterministic half of the pipeline. Everything vendor- or extraction-specific
 * lives behind fetch-article.ts (gather) and synthesize.ts (the model call); this
 * module is the glue the API route calls.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { Digest, RelatedArticle } from "@/types";
import { getDigest, DIGEST_ROOT } from "@/lib/digest";
import { fetchArticle, type FetchedArticle } from "@/lib/deep-dive/fetch-article";
import { getSynthesisProvider } from "@/lib/deep-dive/synthesize";
import {
  buildNewsPrompt,
  type ArticleContent,
  type NewsDeepDiveInput,
} from "@/lib/deep-dive/news-prompt";

/** Cap related-article fetches to bound latency + cost per generation. */
const MAX_RELATED = 5;
/** With no fetched body, a snippet shorter than this can't anchor an honest synthesis. */
const MIN_SNIPPET_CHARS = 40;

export class DeepDiveError extends Error {
  constructor(
    message: string,
    readonly code: "not-found" | "ineligible" | "no-content" | "synthesis-failed"
  ) {
    super(message);
    this.name = "DeepDiveError";
  }
}

interface ResolvedStory {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  sectionLabel: string;
  /** Undefined means the section doesn't carry an eligibility flag (e.g. opinions). */
  eligible: boolean | undefined;
  related: RelatedArticle[];
}

/** Common fields across the article-bearing section story shapes. */
type SectionStory = {
  id: string;
  title: string;
  url: string | null;
  snippet: string;
  source: string;
  deep_dive_eligible?: boolean;
  related_articles?: RelatedArticle[];
};

function toResolvedStory(story: SectionStory, sectionLabel: string): ResolvedStory {
  return {
    id: story.id,
    title: story.title,
    url: story.url,
    snippet: story.snippet,
    source: story.source,
    sectionLabel,
    eligible: story.deep_dive_eligible,
    related: story.related_articles ?? [],
  };
}

/**
 * Find an article-bearing story by ID across popular_today, for_you, on_your_radar,
 * and opinions. Returns null if not found in any article section. (ENT/entertainment
 * has a distinct shape and is out of scope for the V1 news path.)
 */
function resolveStory(digest: Digest, id: string): ResolvedStory | null {
  const s = digest.sections;

  const popular = s.popular_today.find((x) => x.id === id);
  if (popular) return toResolvedStory(popular, "Popular Today");

  for (const group of [...s.for_you, ...s.on_your_radar]) {
    const story = group.stories.find((x) => x.id === id);
    if (story) return toResolvedStory(story, group.topic);
  }

  const opinion = s.opinions.find((x) => x.id === id);
  if (opinion) return toResolvedStory(opinion, "Opinions");

  return null;
}

interface GatheredArticles {
  /** Synthesis input, in order (main first, then related). */
  articles: ArticleContent[];
  /** Raw fetch results, parallel to `articles`, for outcome logging. */
  results: FetchedArticle[];
  /** Resolved main-article URL (publisher link when a redirect was resolved). */
  mainUrl: string | null;
}

/** Fetch the main article + capped related articles in parallel, shaped for synthesis. */
async function gatherArticles(story: ResolvedStory): Promise<GatheredArticles> {
  const related = story.related.filter((r) => r.url).slice(0, MAX_RELATED);
  const [main, ...rest] = await Promise.all([
    fetchArticle(story.url),
    ...related.map((r) => fetchArticle(r.url)),
  ]);

  // Prefer the resolved publisher URL (Google News redirects resolve to e.g.
  // nbcnews.com) so the output links to the real article, not the opaque CBMi… redirect.
  const mainUrl = main.resolvedUrl ?? story.url;
  const articles: ArticleContent[] = [
    { role: "main", outlet: story.source, headline: story.title, url: mainUrl, text: main.text },
    ...related.map((r, i) => ({
      role: "related" as const,
      outlet: r.outlet,
      headline: r.headline,
      url: rest[i].resolvedUrl ?? r.url,
      text: rest[i].text,
    })),
  ];

  return { articles, results: [main, ...rest], mainUrl };
}

/** Surface fetch outcomes (and why sources dropped) so degradation isn't silent. */
function logFetchOutcomes(id: string, results: FetchedArticle[]): void {
  const failures = results.flatMap((r) => (r.ok ? [] : [r.reason]));
  const ok = results.length - failures.length;
  const tail = failures.length ? `; unavailable: ${failures.join(", ")}` : "";
  console.info(`[deep-dive] ${id}: ${ok}/${results.length} sources fetched${tail}`);
}

async function writeDeepDiveFile(date: string, id: string, content: string): Promise<string> {
  const dir = path.join(DIGEST_ROOT, date, "deep-dives");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${id}.md`);
  await writeFile(filePath, content, "utf-8");
  return filePath;
}

export interface GenerateResult {
  id: string;
  date: string;
  /** Absolute path to the written markdown file. */
  filePath: string;
  content: string;
  provider: string;
  /** Article bodies that fetched successfully / total attempted (main + related). */
  sourcesFetched: number;
  sourcesAttempted: number;
}

/**
 * Generate (or regenerate) a news deep-dive markdown file for one story.
 *
 * Throws DeepDiveError for caller-facing failures (not found, ineligible, nothing
 * fetchable, synthesis error) so the route can map them to status codes.
 */
export async function generateNewsDeepDive(
  date: string,
  id: string
): Promise<GenerateResult> {
  const digest = await getDigest(date);
  if (!digest) {
    throw new DeepDiveError(`No digest found for ${date}.`, "not-found");
  }

  const story = resolveStory(digest, id);
  if (!story) {
    throw new DeepDiveError(
      `Story ${id} not found in ${date}'s digest. IDs are date-scoped.`,
      "not-found"
    );
  }
  if (story.eligible === false) {
    throw new DeepDiveError(`Story ${id} is not flagged deep-dive-eligible.`, "ineligible");
  }

  const { articles, results, mainUrl } = await gatherArticles(story);
  logFetchOutcomes(id, results);

  const fetchedCount = articles.filter((a) => a.text).length;
  // No body anywhere and only a thin snippet → not enough to synthesize honestly.
  if (fetchedCount === 0 && story.snippet.trim().length < MIN_SNIPPET_CHARS) {
    throw new DeepDiveError(
      `Couldn't fetch any article body for ${id}, and its snippet is too thin to synthesize.`,
      "no-content"
    );
  }

  const input: NewsDeepDiveInput = {
    id,
    title: story.title,
    source: story.source,
    url: mainUrl,
    sectionLabel: story.sectionLabel,
    snippet: story.snippet,
    fetchedAt: new Date().toISOString(),
    articles,
  };

  const provider = getSynthesisProvider();
  let content: string;
  try {
    content = await provider.synthesize(buildNewsPrompt(input));
  } catch (err) {
    throw new DeepDiveError(
      `Synthesis failed: ${err instanceof Error ? err.message : String(err)}`,
      "synthesis-failed"
    );
  }

  const filePath = await writeDeepDiveFile(date, id, content);

  return {
    id,
    date,
    filePath,
    content,
    provider: provider.name,
    sourcesFetched: fetchedCount,
    sourcesAttempted: articles.length,
  };
}
