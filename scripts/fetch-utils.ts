/**
 * Shared HTTP fetch utility with timeout + transient-failure retry.
 *
 * Used by every external-API fetcher (RSS, ESPN, TMDB) so timeout, retry,
 * and User-Agent behavior live in one place.
 *
 * Retry policy:
 *   - 5xx responses, network errors, and AbortErrors retry once after a
 *     200ms backoff.
 *   - 4xx responses (auth errors, not-found, bad request) do NOT retry —
 *     these aren't transient.
 *   - On second failure, throws the error from the second attempt.
 */

export interface FetchOptions {
  /** Total timeout per attempt in ms. Default 15000. */
  timeoutMs?: number;
  /** Extra headers to merge with the default User-Agent. */
  headers?: Record<string, string>;
  /** Retry once on transient failures. Default true. */
  retry?: boolean;
}

const DEFAULT_TIMEOUT = 15000;
const RETRY_DELAY_MS = 200;

function shouldRetry(err: unknown, status?: number): boolean {
  if (status !== undefined) {
    return status >= 500 && status < 600;
  }
  // Network errors and AbortErrors qualify; treat anything thrown as transient
  // unless we have explicit reason not to.
  return true;
}

async function fetchOnce(url: string, opts: FetchOptions): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT);
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Paperboy/1.0", ...(opts.headers ?? {}) },
      signal: controller.signal,
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithTimeout(url: string, opts: FetchOptions = {}): Promise<Response> {
  const retry = opts.retry !== false;
  try {
    return await fetchOnce(url, opts);
  } catch (err) {
    const status = err instanceof Error && /^HTTP (\d+):/.exec(err.message)?.[1];
    const statusCode = status ? parseInt(status, 10) : undefined;
    if (!retry || !shouldRetry(err, statusCode)) {
      throw err;
    }
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    return await fetchOnce(url, opts);
  }
}

/** Fetch and parse JSON with timeout + retry. */
export async function fetchJson(url: string, opts: FetchOptions = {}): Promise<unknown> {
  const resp = await fetchWithTimeout(url, opts);
  return await resp.json();
}

/** Fetch text body with timeout + retry. */
export async function fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
  const resp = await fetchWithTimeout(url, opts);
  return await resp.text();
}
