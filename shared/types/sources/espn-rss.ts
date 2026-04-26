/**
 * ESPN RSS — raw source schema
 *
 * NOT used at runtime. Documents what the XML gives us.
 *
 * Used by: All sport topics (NBA, NHL, MLB, NFL, MMA, F1,
 * College Basketball, College Football) in For You / On Your Radar.
 *
 * Feed URLs: espn.com/espn/rss/{sport}/news
 *
 * Cleanest RSS source we consume — real snippets, direct URLs,
 * author names. No redirects, no HTML junk.
 *
 * Last audited: 2026-04-22
 */

/**
 * ESPN RSS <item>
 */
export interface EspnRssItem {
  title: string;                  // Clean headline, no outlet suffix
  description: string;            // Real 1–2 sentence article preview (plain text)
  link: string;                   // Direct ESPN article URL, e.g.
                                  //   https://www.espn.com/nba/story/_/id/48554498/...
  pubDate: string;                // "Wed, 22 Apr 2026 16:00:29 EST"
  "dc:creator": string;           // Author name, e.g. "Jamal Collier"
  guid: string;                   // "US-EN-48554498", isPermaLink="false"

  // --- NOT PRESENT ---
  // No <media:content> — no thumbnail images
  // No <enclosure> — no media attachments
  // No <category> — no tags
  // No <source> element (single-outlet feed)
  // No <itunes:*> — not a podcast feed
}

// ---------------------------------------------------------------------------
// Extraction summary
// ---------------------------------------------------------------------------

// CURRENTLY EXTRACTED → RssEntry:
//   title        ← <title>
//   url          ← <link> (direct ESPN URL)
//   source       ← <dc:creator> (WRONG — this is the author, not the outlet)
//   date         ← <pubDate>
//   snippet      ← <description> truncated to 2 sentences / 300 chars
//
// CURRENTLY DISCARDED:
//   <guid>       — ESPN's internal article ID
//
// KNOWN ISSUES:
//   dc:creator stored as `source` — should be `author`.
//   Outlet is always "ESPN" but we never set it explicitly.
//
// PROPOSED CHANGES (Phase 6.2):
//   author       ← <dc:creator> (new field)
//   source       ← "ESPN" (hardcoded when feed URL is espn.com)
