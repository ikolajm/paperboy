import { NextResponse } from 'next/server';
import { getDeepDive } from '@/lib/digest';
import { generateNewsDeepDive } from '@/lib/deep-dive/generate';
import { generatePodcastDeepDive } from '@/lib/deep-dive/generate-podcast';
import { generateEntDeepDive } from '@/lib/deep-dive/generate-ent';
import { DeepDiveError } from '@/lib/deep-dive/shared';

// jsdom (article extraction) needs the Node runtime, not edge.
export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string; id: string }> }
) {
  const { date, id } = await params;
  const deepDive = await getDeepDive(date, id);

  if (!deepDive) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(deepDive);
}

const STATUS_BY_CODE: Record<DeepDiveError['code'], number> = {
  'not-found': 404,
  ineligible: 422,
  'no-content': 422,
  'synthesis-failed': 502,
};

/** Generate (or regenerate) the deep-dive markdown for a story, then return it. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ date: string; id: string }> }
) {
  const { date, id } = await params;

  // Each ID prefix has its own gather path: POD-* → transcript/show-notes,
  // ENT-* → TMDB/OMDb title detail, everything else → article fetch (news).
  const generate = id.startsWith('POD-')
    ? generatePodcastDeepDive
    : id.startsWith('ENT-')
      ? generateEntDeepDive
      : generateNewsDeepDive;

  try {
    const result = await generate(date, id);
    return NextResponse.json({
      id: result.id,
      content: result.content,
      provider: result.provider,
      sourcesFetched: result.sourcesFetched,
      sourcesAttempted: result.sourcesAttempted,
    });
  } catch (err) {
    if (err instanceof DeepDiveError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: STATUS_BY_CODE[err.code] });
    }
    // Configuration/unexpected errors (e.g. missing API key) — surface the message.
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
