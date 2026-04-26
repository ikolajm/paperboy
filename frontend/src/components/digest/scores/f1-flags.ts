/**
 * F1 circuit country → ESPN flag image URL.
 * Maps city/country from the circuit data to the ESPN CDN flag code.
 */

const COUNTRY_FLAG_CODES: Record<string, string> = {
  'Australia': 'aus',
  'China': 'chn',
  'Japan': 'jpn',
  'Bahrain': 'brn',
  'Saudi Arabia': 'sau',
  'USA': 'usa',
  'Italy': 'ita',
  'Monaco': 'mco',
  'Spain': 'esp',
  'Canada': 'can',
  'Austria': 'aut',
  'United Kingdom': 'gbr',
  'Britain': 'gbr',
  'Belgium': 'bel',
  'Hungary': 'hun',
  'Netherlands': 'nld',
  'Azerbaijan': 'aze',
  'Singapore': 'sgp',
  'Mexico': 'mex',
  'Brazil': 'bra',
  'Qatar': 'qat',
  'United Arab Emirates': 'are',
  'Abu Dhabi': 'are',
};

/** Extract a flag URL from the circuit city string (e.g. "Melbourne, Australia") */
export function getCircuitFlagUrl(city: string): string | null {
  // City string format: "Melbourne, Australia" or "Florida, USA"
  const parts = city.split(',').map(s => s.trim());
  const country = parts[parts.length - 1];

  const code = COUNTRY_FLAG_CODES[country];
  if (!code) return null;

  return `https://a.espncdn.com/i/teamlogos/countries/500/${code}.png`;
}
