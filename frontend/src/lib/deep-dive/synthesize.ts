/**
 * Synthesis provider — the single LLM call that turns gathered article text into a
 * deep-dive markdown file.
 *
 * Deliberately provider-agnostic at the boundary (`SynthesisProvider`): V1 ships a
 * Gemini adapter, but Glass-Box Synthesis (the downstream project this primitive
 * feeds) is multi-model, so the call site never names a vendor. Swapping or running
 * providers side-by-side is an adapter change, not a rewrite.
 */

import { GoogleGenAI } from "@google/genai";
import { loadCredentials } from "@/lib/deep-dive/credentials";

/** Synthesis-over-provided-text tier: cheap, fast, large context. */
const DEFAULT_MODEL = "gemini-2.5-flash";
/** Backoff before retrying a transient model failure (demand spike / rate limit). */
const RETRY_DELAY_MS = 1500;

/** Transient, worth-one-retry failures: rate limits + capacity spikes. */
function isTransient(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  return /\b(429|503)\b/.test(s) || /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/i.test(s);
}

export interface SynthesisProvider {
  /** Vendor/model identifier, for logging + provenance. */
  readonly name: string;
  /** One completion over the prompt. Throws on API/empty-response failure. */
  synthesize(prompt: string): Promise<string>;
}

class GeminiProvider implements SynthesisProvider {
  readonly name: string;
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(apiKey: string, model = DEFAULT_MODEL) {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
    this.name = `gemini:${model}`;
  }

  async synthesize(prompt: string): Promise<string> {
    const res = await this.generateWithRetry(prompt);
    const text = res.text?.trim();
    if (!text) throw new Error("Gemini returned an empty response");
    return text;
  }

  /** One retry on transient failures — demand spikes (503) and rate limits (429). */
  private async generateWithRetry(prompt: string, attempts = 2) {
    for (let i = 1; i <= attempts; i++) {
      try {
        return await this.ai.models.generateContent({ model: this.model, contents: prompt });
      } catch (err) {
        if (i < attempts && isTransient(err)) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        throw err;
      }
    }
    throw new Error("unreachable");
  }
}

/** Read the Gemini key from GEMINI_API_KEY, else config/credentials.json. */
function loadGeminiKey(): string | null {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  return loadCredentials().gemini?.api_key ?? null;
}

/**
 * Resolve the active synthesis provider. Throws a clear error if no key is
 * configured so the generation route can surface it instead of a vendor stack trace.
 */
export function getSynthesisProvider(): SynthesisProvider {
  const key = loadGeminiKey();
  if (!key) {
    throw new Error(
      "No Gemini API key found. Set GEMINI_API_KEY or add gemini.api_key to config/credentials.json."
    );
  }
  return new GeminiProvider(key);
}
