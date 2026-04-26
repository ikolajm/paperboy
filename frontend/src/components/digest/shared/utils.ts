import type { Game, ScheduledGame, GameEnrichment } from '@/types';

/** Type guard: completed game has scores */
export function isCompletedGame(game: Game | ScheduledGame): game is Game {
  return 'homeScore' in game;
}

/** Extract the most relevant series summary from enrichment */
export function getSeriesSummary(enrichment: GameEnrichment | undefined): string | null {
  if (!enrichment?.seasonSeries || enrichment.seasonSeries.length === 0) return null;
  const playoff = enrichment.seasonSeries.find(s => s.title.toLowerCase().includes('playoff'));
  const series = playoff ?? enrichment.seasonSeries[0];
  return series.summary || null;
}

/** Format enrichment timestamp for provenance display */
export function formatEnrichmentTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
