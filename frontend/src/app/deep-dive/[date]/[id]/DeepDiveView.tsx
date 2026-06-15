'use client';

import { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';

type Status = 'idle' | 'generating' | 'error';

/**
 * Interactive deep-dive surface: renders existing content, or an explicit
 * generate/regenerate flow. Generation is never auto-fired on navigate — it costs a
 * model call, so it's always behind an explicit button.
 */
export function DeepDiveView({
  date,
  id,
  initialContent,
}: {
  date: string;
  id: string;
  initialContent: string | null;
}) {
  const [content, setContent] = useState<string | null>(initialContent);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  // Ref-based in-flight latch — blocks a rapid double-click in the window before
  // React re-renders the trigger away. A `status` check can't: it reads the stale
  // closure value from the render that mounted the button.
  const inFlight = useRef(false);

  async function generate() {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus('generating');
    setError(null);
    try {
      const res = await fetch(`/api/deep-dive/${date}/${id}`, { method: 'POST' });
      // The route returns JSON, but a gateway failure (502/504) can return an HTML
      // body — parse defensively so the user sees a real message, not "Unexpected token <".
      const data = (await res.json().catch(() => null)) as
        | { content?: string; error?: string }
        | null;
      if (!res.ok) {
        setError(data?.error ?? `Generation failed (${res.status}).`);
        setStatus('error');
        return;
      }
      if (!data?.content) {
        setError('Generation returned no content. Try again.');
        setStatus('error');
        return;
      }
      setContent(data.content);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.');
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Spinner size="lg" />
        <div>
          <p className="text-label-md text-on-surface">Fetching sources and synthesizing…</p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            This makes one model call and can take a moment.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <EmptyState
        className="py-24"
        icon={<AlertCircle />}
        heading="Couldn't generate this deep dive"
        description={error ?? 'Something went wrong.'}
        action={
          <Button onClick={generate} leadingIcon={<RefreshCw />}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!content) {
    return (
      <EmptyState
        className="py-24"
        icon={<FileText />}
        heading="No deep dive yet"
        description="Generate a synthesized recap from this story and its related coverage. This makes one model call."
        action={<Button onClick={generate}>Generate deep dive</Button>}
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button variant="ghost" size="sm" onClick={generate} leadingIcon={<RefreshCw />}>
          Regenerate
        </Button>
      </div>
      <article className="prose-digest">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </article>
    </>
  );
}
