import type { GameEnrichment } from '@/types';
import { formatEnrichmentTime } from './utils';

export function Provenance({ enrichment }: { enrichment: GameEnrichment }) {
  return (
    <span className="text-label-sm text-outline-subtle">
      Data from {enrichment.source} · Collected {formatEnrichmentTime(enrichment.enriched_at)}
    </span>
  );
}
