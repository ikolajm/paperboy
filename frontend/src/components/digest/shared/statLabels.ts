/**
 * Full labels for stat abbreviations, per sport.
 * Used for tooltips, headers, accessibility, and offensive/defensive grouping.
 */

export interface StatMeta {
  label: string;
  group: 'offense' | 'defense' | 'special' | 'other';
}

// --- NBA ---

export const NBA_TEAM_STATS: Record<string, StatMeta> = {
  'FG':   { label: 'Field Goals', group: 'offense' },
  'FG%':  { label: 'Field Goal %', group: 'offense' },
  '3PT':  { label: 'Three Pointers', group: 'offense' },
  '3P%':  { label: 'Three Point %', group: 'offense' },
  'FT':   { label: 'Free Throws', group: 'offense' },
  'FT%':  { label: 'Free Throw %', group: 'offense' },
  'AST':  { label: 'Assists', group: 'offense' },
  'PIP':  { label: 'Points in Paint', group: 'offense' },
  'FBPs': { label: 'Fast Break Points', group: 'offense' },
  'TO':   { label: 'Turnovers', group: 'offense' },
  'REB':  { label: 'Rebounds', group: 'defense' },
  'OR':   { label: 'Offensive Rebounds', group: 'defense' },
  'DR':   { label: 'Defensive Rebounds', group: 'defense' },
  'STL':  { label: 'Steals', group: 'defense' },
  'BLK':  { label: 'Blocks', group: 'defense' },
  'PF':   { label: 'Personal Fouls', group: 'defense' },
  'LL':   { label: 'Largest Lead', group: 'other' },
  'LC':   { label: 'Lead Changes', group: 'other' },
  'LPCT': { label: 'Percent Led', group: 'other' },
  'Points Conceded Off Turnovers': { label: 'Points Off Turnovers', group: 'other' },
  'TTO':  { label: 'Team Turnovers', group: 'other' },
  'ToTO': { label: 'Total Turnovers', group: 'other' },
  'TECH': { label: 'Technical Fouls', group: 'other' },
  'FLAG': { label: 'Flagrant Fouls', group: 'other' },
};

export const NBA_BOX_LABELS: Record<string, StatMeta> = {
  'MIN':  { label: 'Minutes', group: 'other' },
  'PTS':  { label: 'Points', group: 'offense' },
  'FG':   { label: 'Field Goals', group: 'offense' },
  '3PT':  { label: 'Three Pointers', group: 'offense' },
  'FT':   { label: 'Free Throws', group: 'offense' },
  'REB':  { label: 'Rebounds', group: 'defense' },
  'AST':  { label: 'Assists', group: 'offense' },
  'TO':   { label: 'Turnovers', group: 'offense' },
  'STL':  { label: 'Steals', group: 'defense' },
  'BLK':  { label: 'Blocks', group: 'defense' },
  'OREB': { label: 'Offensive Rebounds', group: 'defense' },
  'DREB': { label: 'Defensive Rebounds', group: 'defense' },
  'PF':   { label: 'Personal Fouls', group: 'defense' },
  '+/-':  { label: 'Plus/Minus', group: 'other' },
};

// --- NHL ---

export const NHL_TEAM_STATS: Record<string, StatMeta> = {
  'S':    { label: 'Shots', group: 'offense' },
  'SOG':  { label: 'Shootout Goals', group: 'offense' },
  'PPG':  { label: 'Power Play Goals', group: 'offense' },
  'PPO':  { label: 'Power Play Opportunities', group: 'offense' },
  'PCT':  { label: 'Power Play %', group: 'offense' },
  'SHG':  { label: 'Short Handed Goals', group: 'offense' },
  'FW':   { label: 'Faceoffs Won', group: 'offense' },
  'FO%':  { label: 'Faceoff Win %', group: 'offense' },
  'BS':   { label: 'Blocked Shots', group: 'defense' },
  'HT':   { label: 'Hits', group: 'defense' },
  'TK':   { label: 'Takeaways', group: 'defense' },
  'GV':   { label: 'Giveaways', group: 'defense' },
  'PN':   { label: 'Total Penalties', group: 'defense' },
  'PIM':  { label: 'Penalty Minutes', group: 'defense' },
};

export const NHL_BOX_LABELS: Record<string, StatMeta> = {
  'G':     { label: 'Goals', group: 'offense' },
  'A':     { label: 'Assists', group: 'offense' },
  'S':     { label: 'Shots', group: 'offense' },
  'SM':    { label: 'Shot Misses', group: 'offense' },
  'SOG':   { label: 'Shootout Goals', group: 'offense' },
  'YTDG':  { label: 'Year-to-Date Goals', group: 'offense' },
  'FW':    { label: 'Faceoffs Won', group: 'offense' },
  'FL':    { label: 'Faceoffs Lost', group: 'offense' },
  'FO%':   { label: 'Faceoff %', group: 'offense' },
  'BS':    { label: 'Blocked Shots', group: 'defense' },
  'HT':    { label: 'Hits', group: 'defense' },
  'TK':    { label: 'Takeaways', group: 'defense' },
  'GV':    { label: 'Giveaways', group: 'defense' },
  'PN':    { label: 'Penalties', group: 'defense' },
  'PIM':   { label: 'Penalty Minutes', group: 'defense' },
  '+/-':   { label: 'Plus/Minus', group: 'other' },
  'TOI':   { label: 'Time on Ice', group: 'other' },
  'PPTOI': { label: 'Power Play TOI', group: 'special' },
  'SHTOI': { label: 'Short Handed TOI', group: 'special' },
  'ESTOI': { label: 'Even Strength TOI', group: 'special' },
  'SHFT':  { label: 'Shifts', group: 'other' },
};

// --- MLB ---

export const MLB_TEAM_STATS: Record<string, StatMeta> = {
  'Batting':  { label: 'Batting', group: 'offense' },
  'Pitching': { label: 'Pitching', group: 'defense' },
  'Fielding': { label: 'Fielding', group: 'defense' },
  'Records':  { label: 'Records', group: 'other' },
};

export const MLB_BOX_LABELS: Record<string, StatMeta> = {
  'H-AB': { label: 'Hits-At Bats', group: 'offense' },
  'AB':   { label: 'At Bats', group: 'offense' },
  'R':    { label: 'Runs', group: 'offense' },
  'H':    { label: 'Hits', group: 'offense' },
  'RBI':  { label: 'Runs Batted In', group: 'offense' },
  'HR':   { label: 'Home Runs', group: 'offense' },
  'BB':   { label: 'Walks', group: 'offense' },
  'K':    { label: 'Strikeouts', group: 'offense' },
  '#P':   { label: 'Pitches', group: 'defense' },
  'AVG':  { label: 'Batting Average', group: 'offense' },
  'OBP':  { label: 'On-Base %', group: 'offense' },
  'SLG':  { label: 'Slugging %', group: 'offense' },
};

// --- Lookup helpers ---

const ALL_LABELS: Record<string, Record<string, StatMeta>> = {
  NBA: { ...NBA_TEAM_STATS, ...NBA_BOX_LABELS },
  NHL: { ...NHL_TEAM_STATS, ...NHL_BOX_LABELS },
  MLB: { ...MLB_TEAM_STATS, ...MLB_BOX_LABELS },
};

/** Get the full label for a stat abbreviation */
export function getStatLabel(sport: string, abbr: string): string {
  return ALL_LABELS[sport]?.[abbr]?.label ?? abbr;
}

/** Get the group (offense/defense/special/other) for a stat */
export function getStatGroup(sport: string, abbr: string): string {
  return ALL_LABELS[sport]?.[abbr]?.group ?? 'other';
}

/** Get all stats for a sport grouped by offense/defense */
export function getGroupedStats(sport: string): { offense: string[]; defense: string[]; other: string[] } {
  const labels = ALL_LABELS[sport] ?? {};
  const offense: string[] = [];
  const defense: string[] = [];
  const other: string[] = [];

  for (const [abbr, meta] of Object.entries(labels)) {
    if (meta.group === 'offense') offense.push(abbr);
    else if (meta.group === 'defense') defense.push(abbr);
    else other.push(abbr);
  }

  return { offense, defense, other };
}
