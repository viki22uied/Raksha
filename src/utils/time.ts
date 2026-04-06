/**
 * Time utility functions.
 */

/**
 * Get start and end of a given date (UTC).
 */
export function getDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Get start and end of N days ago from now.
 */
export function getLastNDaysRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setUTCHours(0, 0, 0, 0);
  return { start, end };
}

/**
 * Get the hour bucket string for a given date, e.g. "2024-01-15T14".
 */
export function getHourBucket(date: Date): string {
  return date.toISOString().slice(0, 13);
}

/**
 * Get the day bucket string for a given date, e.g. "2024-01-15".
 */
export function getDayBucket(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Calculate time difference in minutes between two dates.
 */
export function timeDiffMinutes(d1: Date, d2: Date): number {
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60);
}

/**
 * Calculate time difference in seconds between two dates.
 */
export function timeDiffSeconds(d1: Date, d2: Date): number {
  return Math.abs(d2.getTime() - d1.getTime()) / 1000;
}

/**
 * Check if a date is within the last N minutes from now.
 */
export function isWithinLastMinutes(date: Date, minutes: number): boolean {
  const threshold = new Date();
  threshold.setMinutes(threshold.getMinutes() - minutes);
  return date >= threshold;
}

/**
 * Format duration in seconds to human-readable string.
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
