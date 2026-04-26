/**
 * Podcast RSS — raw source schema
 *
 * NOT used at runtime. Documents what the XML gives us.
 *
 * Used by: All podcast shows configured in config.podcasts.shows.
 * Each show has its own RSS feed URL.
 *
 * Richest data source in the pipeline — real descriptions, duration,
 * artwork, audio URLs, curated summaries.
 *
 * Last audited: 2026-04-22
 * Sample feed: The Daily (feeds.simplecast.com/Sl5CSM3S)
 */

// ---------------------------------------------------------------------------
// Channel-level (show metadata)
// ---------------------------------------------------------------------------

/**
 * Podcast RSS channel — show-level metadata available on every feed.
 */
export interface PodcastChannel {
  title: string;                  // Show name, e.g. "The Daily"
  link: string;                   // Show website URL
  description: string;            // Show description (HTML)
  language: string;               // e.g. "en"
  copyright: string;

  // iTunes extensions
  "itunes:author": string;        // Publisher name, e.g. "The New York Times"
  "itunes:summary": string;       // Show description (plain text)
  "itunes:image": {
    "@_href": string;             // Show artwork URL (large, e.g. 3000x3000)
  };
  "itunes:category": {            // Primary category
    "@_text": string;             // e.g. "News"
  };
  "itunes:explicit": string;      // "true" or "false"
}

// ---------------------------------------------------------------------------
// Item-level (episode)
// ---------------------------------------------------------------------------

/**
 * Podcast RSS <item> — individual episode
 */
export interface PodcastRssItem {
  // Core fields
  title: string;                  // Episode title
  description: string;            // Full episode description as HTML (<p> tags)
                                  // Multiple paragraphs, 1000–3000 chars typical
  link: string;                   // Episode page URL (show's website)
  pubDate: string;                // RFC 2822 date
  author: string;                 // Email + name format:
                                  //   "thedaily@nytimes.com (The New York Times)"
  guid: string;                   // UUID, isPermaLink="false"

  // iTunes extensions
  "itunes:title": string;         // Same as title (sometimes cleaner)
  "itunes:author": string;        // Show/author name without email
  "itunes:duration": string;      // "HH:MM:SS" format, e.g. "00:39:41"
  "itunes:summary": string;       // Short summary, typically < 200 chars
  "itunes:subtitle": string;      // One-line teaser
  "itunes:image": {
    "@_href": string;             // Episode-specific artwork URL (high-res)
  };
  "itunes:episodeType": string;   // "full" | "trailer" | "bonus"
  "itunes:explicit": string;      // "true" | "false"

  // Media
  "media:thumbnail": {
    "@_url": string;              // Episode thumbnail (smaller, e.g. 1280x720)
    "@_width": string;
    "@_height": string;
  };
  enclosure: {
    "@_url": string;              // Direct MP3/audio URL
    "@_length": string;           // File size in bytes
    "@_type": string;             // "audio/mpeg"
  };

  // Content
  "content:encoded": string;      // Same as description (full HTML)
}

// ---------------------------------------------------------------------------
// Extraction summary
// ---------------------------------------------------------------------------

// CURRENTLY EXTRACTED → RssEntry → PodcastEntry:
//   title           ← <title>
//   url             ← <link> (episode page)
//   source          ← show name from config (not from RSS)
//   date            ← <pubDate>
//   snippet         ← <description> truncated to 2 sentences / 300 chars
//   duration        ← <itunes:duration> parsed to "39m" / "1h 30m" format
//
// CURRENTLY DISCARDED:
//   Episode artwork     ← itunes:image @href, media:thumbnail @url
//   Show artwork        ← channel-level itunes:image @href
//   Audio URL           ← enclosure @url (direct MP3 link)
//   Full description    ← only 2 sentences kept from 1000–3000 char descriptions
//   itunes:summary      ← curated short summary (better than truncated description)
//   itunes:subtitle     ← one-line teaser
//   itunes:author       ← author/publisher name
//   itunes:episodeType  ← full/trailer/bonus classification
//   content:encoded     ← full HTML body
//   author email        ← email portion of <author> field
//
// PROPOSED ADDITIONS (Phase 6.3):
//   image_url       ← itunes:image @href (episode art, fallback to channel art)
//   youtube_url     ← parsed from description HTML or custom tags
//   transcript_url  ← from config transcript_hint per show
//   guests[]        ← parsed from title patterns or description
