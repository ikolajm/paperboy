'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/atoms/Sheet';
import { Button } from '@/components/atoms/Button';
import { Copy, Check, Maximize2 } from 'lucide-react';

// --- Command phrases per content type ---

const COMMAND_PHRASES: Record<string, (id: string) => string> = {
  news: (id) => `Go deeper on ${id}`,
  podcast: (id) => `Transcript for ${id}`,
  entertainment: (id) => `Go deeper on ${id}`,
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  news: 'This will fetch the full article, cross-reference other sources, and write a structured summary.',
  podcast: 'This will locate and organize the transcript with timestamps and key segments.',
  entertainment: 'This will fetch reviews, cast details, trailers, and critical reception.',
};

// --- Command mode (no deep dive exists yet) ---

function CommandMode({
  id,
  title,
  source,
  snippet,
  type,
}: {
  id: string;
  title: string;
  source?: string;
  snippet?: string;
  type: string;
}) {
  const [copied, setCopied] = useState(false);
  const command = COMMAND_PHRASES[type]?.(id) ?? `Go deeper on ${id}`;

  function handleCopy() {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-section flex-1 overflow-y-auto">
      {/* Story context */}
      <div className="flex flex-col gap-component">
        {source && (
          <span className="text-label-sm text-on-surface-variant">{source}</span>
        )}
        <h3 className="text-title-sm text-on-surface font-medium">{title}</h3>
        {snippet && (
          <p className="text-body-sm text-on-surface-variant line-clamp-3">{snippet}</p>
        )}
      </div>

      {/* Command to copy */}
      <div className="flex flex-col gap-component">
        <span className="text-label-sm text-on-surface-variant">Run this in your Claude terminal:</span>
        <div className="flex items-center gap-component rounded-card bg-surface-0 border border-outline-subtle px-group py-component">
          <code className="text-body-sm text-primary font-medium flex-1">{command}</code>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleCopy}
            title="Copy command"
          >
            {copied ? <Check className="text-success" /> : <Copy />}
          </Button>
        </div>
        <p className="text-label-sm text-on-surface-variant">
          {TYPE_DESCRIPTIONS[type] ?? 'This will generate a deep dive analysis.'}
        </p>
      </div>
    </div>
  );
}

// --- Reader mode (deep dive exists) ---

function ReaderMode({
  id,
  date,
}: {
  id: string;
  date: string;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/deep-dive/${date}/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setContent(data?.content ?? null))
      .finally(() => setLoading(false));
  }, [date, id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-body-sm text-on-surface-variant">Loading...</span>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-body-sm text-on-surface-variant">Could not load deep dive.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-group flex-1 overflow-y-auto">
      {/* Full view link */}
      <Link
        href={`/deep-dive/${date}/${id}`}
        className="flex items-center gap-component-compact text-label-md text-primary hover:text-primary/80 transition-colors self-start"
      >
        <Maximize2 className="size-icon-1" />
        View full deep dive
      </Link>

      {/* Markdown content */}
      <article className="prose-digest">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </article>
    </div>
  );
}

// --- Main export ---

export function DeepDiveSheet({
  id,
  date,
  title,
  source,
  snippet,
  type,
  hasDeepDive,
  children,
}: {
  id: string;
  date: string;
  title: string;
  source?: string;
  snippet?: string;
  type: 'news' | 'podcast' | 'entertainment';
  hasDeepDive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" size="lg" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{hasDeepDive ? 'Deep Dive' : 'Request Deep Dive'}</SheetTitle>
          <SheetDescription>
            {hasDeepDive ? `${id} — ${date}` : `Generate a deep dive for ${id}`}
          </SheetDescription>
        </SheetHeader>

        {hasDeepDive ? (
          <ReaderMode id={id} date={date} />
        ) : (
          <CommandMode
            id={id}
            title={title}
            source={source}
            snippet={snippet}
            type={type}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
