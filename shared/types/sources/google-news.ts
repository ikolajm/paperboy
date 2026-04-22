/**
 * Google News RSS — raw source schema
 *
 * NOT used at runtime. Documents what the XML gives us so we can see
 * what's available vs extracted vs discarded.
 *
 * Two feed variants exist with different <description> formats:
 *   1. Topic/top-stories feeds (news.google.com/rss, /rss/topics/...)
 *   2. Search feeds (news.google.com/rss/search?q=...)
 *
 * Used by: Popular Today, Local News, Opinions, and non-sports topics
 * (US Politics, AI, Cybersecurity, Science, Health).
 *
 * Last audited: 2026-04-22
 */

// ---------------------------------------------------------------------------
// Topic / Top Stories feeds
// ---------------------------------------------------------------------------

/**
 * Google News RSS <item> — Top Stories & Topic Feeds
 *
 * Feed URLs: news.google.com/rss, news.google.com/rss/topics/...
 *
 * <description> contains an <ol> of 3–5 related articles from different
 * outlets covering the same story. There is NO article snippet/preview text.
 */
export interface GoogleNewsTopicItem {
  title: string;                  // Headline + " - Outlet Name" suffix
  link: string;                   // news.google.com/rss/articles/CBMi... redirect URL
  guid: string;                   // Same base64 blob as the link, isPermaLink="false"
  pubDate: string;                // RFC 2822: "Wed, 22 Apr 2026 19:05:27 GMT"
  source: {
    "#text": string;              // Outlet name, e.g. "The Guardian"
    "@_url": string;              // Outlet domain, e.g. "https://www.theguardian.com"
  };
  description: string;            // HTML <ol> of related articles (see below)

  // --- NOT PRESENT ---
  // No <media:content> — no thumbnail images
  // No <enclosure> — no media attachments
  // No <category> — no tags
  // No article preview/snippet text
  // No author field
}

/**
 * <description> HTML structure (topic/top-stories feeds):
 *
 * ```html
 * <ol>
 *   <li>
 *     <a href="news.google.com/rss/articles/CBMi..." target="_blank">
 *       Headline text from Outlet A
 *     </a>
 *     &nbsp;&nbsp;
 *     <font color="#6f6f6f">Outlet A</font>
 *   </li>
 *   <li>...</li>   <!-- 3–5 items total -->
 * </ol>
 * ```
 *
 * Each <li> represents a different outlet's coverage of the same story.
 * The first <li> matches the primary <title>/<link> of the item.
 */
export interface GoogleNewsRelatedArticle {
  headline: string;               // Article title (may differ from main headline)
  url: string;                    // news.google.com redirect URL
  outlet: string;                 // Outlet name from <font> tag
}

// ---------------------------------------------------------------------------
// Search feeds
// ---------------------------------------------------------------------------

/**
 * Google News RSS <item> — Search Feeds
 *
 * Feed URLs: news.google.com/rss/search?q=...
 *
 * <description> contains a SINGLE <a> link — NOT an <ol> list.
 * No related articles. Otherwise identical to topic feeds.
 */
export interface GoogleNewsSearchItem {
  title: string;                  // Headline + " - Outlet Name" suffix
  link: string;                   // news.google.com redirect URL
  guid: string;
  pubDate: string;
  source: {
    "#text": string;              // Outlet name
    "@_url": string;              // Outlet domain
  };
  description: string;            // HTML: single <a> + <font> (no <ol>)

  // --- NOT PRESENT ---
  // Same limitations as topic feeds — no images, no snippet, no author
}

/**
 * <description> HTML structure (search feeds):
 *
 * ```html
 * <a href="news.google.com/rss/articles/CBMi..." target="_blank">
 *   Headline text
 * </a>
 * &nbsp;&nbsp;
 * <font color="#6f6f6f">Outlet Name</font>
 * ```
 *
 * Single article only — no related coverage list.
 */

// ---------------------------------------------------------------------------
// Extraction summary
// ---------------------------------------------------------------------------

// CURRENTLY EXTRACTED → RssEntry:
//   title        ← <title> with " - Outlet" suffix stripped
//   url          ← <link> (Google News redirect, NOT resolved)
//   source       ← <source> text content (outlet name)
//   date         ← <pubDate>
//   snippet      ← "" (cleared — description just echoes title)
//   google_news_redirect ← true
//
// CURRENTLY DISCARDED:
//   <source url="...">    — outlet's real domain (enables favicons, deep dives)
//   <description> HTML    — related articles with outlet names + redirect URLs
//   <guid>                — deduplicated base64 identifier
//
// PROPOSED ADDITIONS (Phase 6.1):
//   source_url           ← <source url="..."> attribute
//   related_articles[]   ← parsed from <description> <ol> (topic feeds only)
//   date on PopularStory ← currently dropped by assemble-popular.ts
