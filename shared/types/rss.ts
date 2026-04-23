/**
 * RSS pipeline types — internal to the digest scripts.
 * Not consumed by the frontend.
 */

import type { RelatedArticle } from "./editorial.js";

export interface RssEntry {
  title: string;
  url: string;
  source: string;
  source_url?: string;
  author?: string;
  date: string;
  snippet: string;
  duration?: string;
  image_url?: string;
  audio_url?: string;
  google_news_redirect?: boolean;
  related_articles?: RelatedArticle[];
}

export interface RssBatchItem {
  label: string;
  url: string;
  max: number;
}

export type RssBatchResult = Record<string, RssEntry[] | { status: "fetch_error"; error: string }>;
