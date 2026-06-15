/**
 * Shared glue for deep-dive generation — the bits the news (generate.ts) and podcast
 * (generate-podcast.ts) orchestrators both need: the caller-facing error type, the
 * file writer, and the result shape the API route returns.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { DIGEST_ROOT } from "@/lib/digest";
import { getSynthesisProvider } from "@/lib/deep-dive/synthesize";

/** With no fetched body, a snippet shorter than this can't anchor an honest synthesis. */
export const MIN_SNIPPET_CHARS = 40;

export class DeepDiveError extends Error {
  constructor(
    message: string,
    readonly code: "not-found" | "ineligible" | "no-content" | "synthesis-failed"
  ) {
    super(message);
    this.name = "DeepDiveError";
  }
}

export interface GenerateResult {
  id: string;
  date: string;
  /** Absolute path to the written markdown file. */
  filePath: string;
  content: string;
  provider: string;
  /** Sources whose body fetched successfully / total attempted. */
  sourcesFetched: number;
  sourcesAttempted: number;
}

/** Write a deep-dive markdown file under digests/[date]/deep-dives/[id].md. */
async function writeDeepDiveFile(date: string, id: string, content: string): Promise<string> {
  const dir = path.join(DIGEST_ROOT, date, "deep-dives");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${id}.md`);
  await writeFile(filePath, content, "utf-8");
  return filePath;
}

/**
 * The shared synthesis tail every generator ends with: run the one model call, map a
 * failure to a caller-facing DeepDiveError, write the file, and shape the GenerateResult.
 * The gather/resolve halves differ per content type (article fan-out / transcript / TMDB);
 * this is the part that's identical, so it lives here once.
 */
export async function synthesizeAndWrite(
  date: string,
  id: string,
  prompt: string,
  sources: { fetched: number; attempted: number }
): Promise<GenerateResult> {
  const provider = getSynthesisProvider();
  let content: string;
  try {
    content = await provider.synthesize(prompt);
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
    sourcesFetched: sources.fetched,
    sourcesAttempted: sources.attempted,
  };
}
