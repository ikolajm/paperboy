/**
 * Audit F1 grid + circuit timezone coverage against the live ESPN season.
 *
 * Pulls the current-year F1 schedule from ESPN, walks every race weekend's
 * driver list, and compares against `F1_GRID_2026` and `CIRCUIT_TIMEZONES`
 * in scripts/scores/f1.ts. Reports drivers and circuits missing from the
 * hardcoded maps, with ready-to-paste stub entries.
 *
 * Stubs require human review before pasting:
 *   - Driver entries inherit color from the ESPN teams endpoint when known,
 *     fall back to "777777" otherwise.
 *   - Circuit entries print `'TODO'` for the IANA timezone — must be filled
 *     in manually (ESPN doesn't provide IANA zones).
 *
 * Usage:
 *   npm run audit-f1
 */

import { F1_GRID_2026, CIRCUIT_TIMEZONES } from "./scores/f1.js";
import { fetchF1Teams } from "./scores/standings.js";

const F1_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard";

interface EspnAddress {
  city?: string;
  state?: string;
  country?: string;
}

interface EspnCircuit {
  fullName?: string;
  address?: EspnAddress;
}

interface EspnAthlete {
  displayName?: string;
  shortName?: string;
}

interface EspnTeam {
  displayName?: string;
  abbreviation?: string;
}

interface EspnCompetitor {
  athlete?: EspnAthlete;
  team?: EspnTeam;
}

interface EspnCompetition {
  competitors?: EspnCompetitor[];
}

interface EspnEvent {
  id?: string;
  date?: string;
  circuit?: EspnCircuit;
  competitions?: EspnCompetition[];
}

async function fetchSeasonEvents(year: number): Promise<EspnEvent[]> {
  const dateRange = `${year}0101-${year}1231`;
  const url = `${F1_SCOREBOARD}?dates=${dateRange}`;
  const resp = await fetch(url, { headers: { "User-Agent": "Paperboy/1.0" } });
  if (!resp.ok) {
    throw new Error(`F1 scoreboard fetch failed: HTTP ${resp.status} ${resp.statusText}`);
  }
  const data = (await resp.json()) as Record<string, unknown>;
  return (data.events as EspnEvent[]) ?? [];
}

async function main() {
  const year = new Date().getFullYear();
  console.log(`Auditing F1 coverage against the ${year} season...\n`);

  const [events, teamLookup] = await Promise.all([
    fetchSeasonEvents(year),
    fetchF1Teams(),
  ]);

  console.log(`Fetched ${events.length} events · ${teamLookup.size} teams\n`);

  // --- Walk events to collect drivers + circuits ---

  const driversFound = new Map<string, { team: string; color: string }>();
  const circuitsFound = new Map<string, { fullName: string; country: string }>();

  for (const event of events) {
    // Circuit
    const city = event.circuit?.address?.city;
    if (city) {
      circuitsFound.set(city, {
        fullName: event.circuit?.fullName ?? "",
        country: event.circuit?.address?.country ?? "",
      });
    }

    // Drivers
    for (const comp of event.competitions ?? []) {
      for (const c of comp.competitors ?? []) {
        const name = c.athlete?.displayName || c.athlete?.shortName;
        if (!name) continue;
        const team = c.team?.displayName || c.team?.abbreviation || "";
        const color = teamLookup.get(team)?.color || "777777";
        if (!driversFound.has(name)) {
          driversFound.set(name, { team, color });
        }
      }
    }
  }

  // --- Driver coverage ---

  const missingDrivers = [...driversFound.entries()]
    .filter(([name]) => !(name in F1_GRID_2026))
    .sort(([a], [b]) => a.localeCompare(b));

  console.log("=== Driver coverage ===");
  console.log(`  Known: ${Object.keys(F1_GRID_2026).length}`);
  console.log(`  Observed in ${year}: ${driversFound.size}`);
  console.log(`  Missing from F1_GRID_2026: ${missingDrivers.length}\n`);

  if (missingDrivers.length > 0) {
    console.log("=== STUB drivers (paste into F1_GRID_2026 in scripts/scores/f1.ts) ===");
    const maxNameLen = Math.max(...missingDrivers.map(([n]) => n.length));
    for (const [name, { team, color }] of missingDrivers) {
      const key = `"${name}":`.padEnd(maxNameLen + 4);
      console.log(`  ${key} { team: ${JSON.stringify(team)}, color: "${color}" },`);
    }
    console.log();
  }

  // --- Circuit coverage ---

  // Match the runtime's case-insensitive lookup (see _circuitTimezoneIndex in f1.ts)
  const knownCircuitsLower = new Set(
    Object.keys(CIRCUIT_TIMEZONES).map(c => c.toLowerCase())
  );
  const missingCircuits = [...circuitsFound.entries()]
    .filter(([city]) => !knownCircuitsLower.has(city.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  console.log("=== Circuit coverage ===");
  console.log(`  Known: ${Object.keys(CIRCUIT_TIMEZONES).length}`);
  console.log(`  Observed in ${year}: ${circuitsFound.size}`);
  console.log(`  Missing from CIRCUIT_TIMEZONES: ${missingCircuits.length}\n`);

  if (missingCircuits.length > 0) {
    console.log("=== STUB circuits (paste into CIRCUIT_TIMEZONES in scripts/scores/f1.ts) ===");
    console.log("  // Fill the IANA timezone manually — ESPN doesn't provide it.");
    const maxCityLen = Math.max(...missingCircuits.map(([c]) => c.length));
    for (const [city, { fullName, country }] of missingCircuits) {
      const key = `'${city}':`.padEnd(maxCityLen + 4);
      const note = country ? ` (${fullName ? `${fullName}, ` : ""}${country})` : (fullName ? ` (${fullName})` : "");
      console.log(`  ${key} 'TODO',${note}`);
    }
    console.log();
  }

  // --- Summary ---

  if (missingDrivers.length === 0 && missingCircuits.length === 0) {
    console.log("✓ All drivers and circuits covered.");
  } else {
    console.log(`Missing: ${missingDrivers.length} driver(s), ${missingCircuits.length} circuit(s)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("F1 audit failed:", err);
  process.exit(1);
});
