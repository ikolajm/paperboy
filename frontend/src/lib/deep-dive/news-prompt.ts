/**
 * News deep-dive prompt builder.
 *
 * Translates the manual-agent output contract in context/DEEP-DIVE-NEWS.md into a
 * single synthesis prompt. The V1 productionized path differs from the manual spec
 * in one way: there is NO fresh web search. "Other Coverage" is built only from the
 * story's already-fetched `related_articles` (the locked deterministic-fetch
 * decision). Cross-source claim-checking (grounded vs. inferred) is Phase 3.
 */

/** One gathered source — main article or a related-coverage article. */
export interface ArticleContent {
  role: "main" | "related";
  outlet: string;
  headline: string;
  url: string | null;
  /** Clean body text, or null when the fetch failed (paywall/bot-wall/etc.). */
  text: string | null;
}

/** Everything the synthesis prompt needs about one story. */
export interface NewsDeepDiveInput {
  id: string;
  title: string;
  source: string;
  url: string | null;
  /** "Popular Today", the topic name, "Opinions", etc. */
  sectionLabel: string;
  /** The short snippet carried in the digest — the floor when no body fetched. */
  snippet: string;
  /** ISO timestamp for the file's Fetched: field. */
  fetchedAt: string;
  articles: ArticleContent[];
}

function renderSource(a: ArticleContent, index: number): string {
  const head = `### Source ${index + 1} — ${a.outlet}${a.role === "main" ? " (MAIN ARTICLE)" : ""}`;
  const meta = `Headline: ${a.headline}\nURL: ${a.url ?? "(none)"}`;
  const body = a.text
    ? `Body:\n${a.text}`
    : "Body: UNAVAILABLE (paywall/bot-wall/no URL — do not invent its contents).";
  return `${head}\n${meta}\n${body}`;
}

export function buildNewsPrompt(input: NewsDeepDiveInput): string {
  const fetched = input.articles.filter((a) => a.text);
  const relatedFetched = fetched.filter((a) => a.role === "related").length;
  const mainFetched = fetched.some((a) => a.role === "main");

  const sourceBlocks = input.articles.length
    ? input.articles.map(renderSource).join("\n\n")
    : "(No article bodies were fetched — work only from the snippet below.)";

  // Other Coverage only earns a section when 2+ related sources actually landed.
  const otherCoverageRule =
    relatedFetched >= 2
      ? "Include an `## Other Coverage` section: for each *additional* fetched outlet, one line on what it emphasised or added that the main source didn't."
      : "OMIT the `## Other Coverage` section — fewer than two related sources were fetched.";

  const bodyGuidance = mainFetched
    ? "Base the Summary, Key Points, and Full Story on the MAIN ARTICLE body, enriched by the related sources."
    : "The main article body was NOT fetched. Build the Summary and Key Points from the snippet and whatever related-source bodies are available. Keep the Full Story shorter and note inline that the original article could not be retrieved.";

  return `You are writing a news deep-dive file for a personal news dashboard. Your job is to synthesize the fetched article text below into ONE clean, factual markdown document the reader can read instead of opening the original articles.

## Story
ID: ${input.id}
Title: ${input.title}
Primary source: ${input.source}
URL: ${input.url ?? "(none)"}
Section: ${input.sectionLabel}
Digest snippet: ${input.snippet || "(none)"}

## Fetched sources
${sourceBlocks}

## Rules
- Ground every factual claim in the fetched source bodies above. ${bodyGuidance}
- Preserve direct quotes, named sources, and specific figures exactly as they appear.
- Do NOT invent facts, quotes, or details. If a source body is marked UNAVAILABLE, do not guess its contents.
- The Context section is the one place for your own background knowledge (who the people are, prior events, why this matters). Keep it to 2–3 short paragraphs and keep it clearly background, not new reporting.
- ${otherCoverageRule}
- Write in plain, neutral prose. No editorializing.

## Output
Output ONLY the markdown below — no preamble, no code fences. Use this exact structure:

# ${input.title}

**ID:** ${input.id}
**Source:** ${input.source}
**URL:** ${input.url ?? "(none)"}
**Topic / Section:** ${input.sectionLabel}
**Fetched:** ${input.fetchedAt}

---

## Summary

[3–5 sentence factual summary]

## Key Points

- [point]
- [point]
- [point]

## Full Story

[Cleaned article narrative — quotes, named sources, and figures preserved]
${relatedFetched >= 2 ? "\n## Other Coverage\n\n- **[Outlet]:** [what it emphasised or added]\n" : ""}
## Context

[2–3 paragraphs of background the article assumes]`;
}
