export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function getDayStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getDayEnd(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseDate(iso: string): Date {
  return new Date(iso + "T00:00:00.000Z");
}

const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getTodayAbbrev(date: Date = new Date()): string {
  return DAY_ABBREVS[date.getUTCDay()];
}

/** Returns true if a checklist label belongs to today (or has no day prefix). */
export function isItemForToday(label: string, todayAbbrev: string): boolean {
  const dayPrefixes = DAY_ABBREVS.map((d) => d + " –");
  const hasDayPrefix = dayPrefixes.some((p) => label.startsWith(p));
  if (!hasDayPrefix) return true; // manually added items show every day
  return label.startsWith(todayAbbrev + " –");
}
