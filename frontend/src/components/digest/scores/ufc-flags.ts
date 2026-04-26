/**
 * UFC venue city → ESPN flag image URL.
 * Maps common UFC venue cities to country flag codes.
 */

const CITY_FLAG_CODES: Record<string, string> = {
  // USA
  'Las Vegas': 'usa',
  'Jacksonville': 'usa',
  'Houston': 'usa',
  'Nashville': 'usa',
  'Boston': 'usa',
  'Miami': 'usa',
  'Denver': 'usa',
  'Sacramento': 'usa',
  'Salt Lake City': 'usa',
  'Atlantic City': 'usa',
  'Anaheim': 'usa',
  'Columbus': 'usa',
  'Louisville': 'usa',
  'Kansas City': 'usa',
  'Newark': 'usa',
  'St. Louis': 'usa',
  // International
  'Mexico City': 'mex',
  'Abu Dhabi': 'are',
  'London': 'gbr',
  'Paris': 'fra',
  'São Paulo': 'bra',
  'Sao Paulo': 'bra',
  'Rio de Janeiro': 'bra',
  'Toronto': 'can',
  'Edmonton': 'can',
  'Perth': 'aus',
  'Sydney': 'aus',
  'Melbourne': 'aus',
  'Singapore': 'sgp',
  'Shanghai': 'chn',
  'Seoul': 'kor',
  'Tokyo': 'jpn',
  'Riyadh': 'sau',
  'Jeddah': 'sau',
  'Dublin': 'irl',
  'Copenhagen': 'dnk',
  'Stockholm': 'swe',
  'Hamburg': 'ger',
  'Berlin': 'ger',
  'Amsterdam': 'nld',
  'Macau': 'mac',
};

/** Extract a flag URL from the UFC venue string (e.g. "Arena CDMX, Mexico City" or "T-Mobile Arena, Las Vegas, NV") */
export function getVenueFlagUrl(venue: string): string | null {
  // Venue format: "Venue Name, City" or "Venue Name, City, State"
  const parts = venue.split(',').map(s => s.trim());

  // Try city (second part) first, then last part
  for (let i = 1; i < parts.length; i++) {
    // Strip US state abbreviations
    const cleaned = parts[i].replace(/\b[A-Z]{2}$/, '').trim();
    const code = CITY_FLAG_CODES[cleaned] || CITY_FLAG_CODES[parts[i]];
    if (code) {
      return `https://a.espncdn.com/i/teamlogos/countries/500/${code}.png`;
    }
  }

  return null;
}
