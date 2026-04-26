/**
 * Sequential ID assignment per category prefix.
 * e.g. SPRT-01, SPRT-02, TECH-01, POP-01
 */

export class IdCounter {
  private counters = new Map<string, number>();

  next(category: string): string {
    const count = (this.counters.get(category) ?? 0) + 1;
    this.counters.set(category, count);
    return `${category}-${String(count).padStart(2, "0")}`;
  }
}
