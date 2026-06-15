import { Telescope } from 'lucide-react';
import { buttonVariants } from '@/components/atoms/Button';
import { cn } from '@/components/atoms/cn';

/**
 * The "Deep dive" affordance: a link to the full-page on-demand synthesis.
 *
 * Single source of truth for the entry point across every card type (news,
 * media, podcast) — the link target, the Telescope icon, the eligibility gate,
 * and the generated-vs-not label all live here, so the rule changes in one place
 * instead of three.
 *
 * A styled <a>, not <Button asChild>: Button's asChild path feeds Radix Slot
 * multiple children (icon + label) and throws React.Children.only.
 */
export function DeepDiveLink({
  eligible,
  date,
  id,
  available,
  className,
}: {
  eligible?: boolean;
  /** Digest date; absent on a date-less render, in which case there's no link. */
  date?: string;
  id: string;
  /** ids with a generated .md already on disk → "Read deep dive" vs "Deep dive". */
  available?: string[];
  className?: string;
}) {
  if (!eligible || !date) return null;
  const generated = !!available?.includes(id);

  return (
    <a
      href={`/deep-dive/${date}/${id}`}
      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-primary', className)}
    >
      <Telescope className="size-icon-1 shrink-0" />
      {generated ? 'Read deep dive' : 'Deep dive'}
    </a>
  );
}
