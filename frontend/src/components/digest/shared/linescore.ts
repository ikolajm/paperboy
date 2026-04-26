/**
 * Sport-aware linescore header generation.
 * Shared between GameCard and GameDetailView.
 */

export function linescoreHeaders(sport: string, home: number[], away: number[]): string[] {
  const len = Math.max(home.length, away.length);
  if (len <= 0) return [];

  switch (sport) {
    case 'NHL': {
      const headers = ['P1', 'P2', 'P3'];
      for (let i = 3; i < len; i++) headers.push(i === 3 ? 'OT' : 'SO');
      headers.push('T');
      return headers;
    }
    case 'NBA': {
      const headers = ['Q1', 'Q2', 'Q3', 'Q4'];
      for (let i = 4; i < len; i++) headers.push(i === 4 ? 'OT' : `OT${i - 3}`);
      headers.push('T');
      return headers;
    }
    case 'MLB': {
      const headers = Array.from({ length: len }, (_, i) => `${i + 1}`);
      headers.push('R');
      return headers;
    }
    case 'NFL': {
      const headers = ['Q1', 'Q2', 'Q3', 'Q4'];
      for (let i = 4; i < len; i++) headers.push('OT');
      headers.push('T');
      return headers;
    }
    default: {
      const headers = Array.from({ length: len }, (_, i) => `${i + 1}`);
      headers.push('T');
      return headers;
    }
  }
}
