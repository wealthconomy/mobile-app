export type VersionComparisonResult = "older" | "same" | "newer" | "unknown";

/**
 * Compares two dot-separated version strings (e.g. current app version `a` vs minimum required version `b`).
 * Missing parts are treated as 0 ("1.0" equals "1.0.0").
 * Returns "unknown" if either value is missing, empty, or contains non-numeric segments.
 *
 * Examples:
 * 1. compareVersions("1.0", "1.0.0")   => "same"
 * 2. compareVersions("1.0.1", "1.0.2") => "older"
 * 3. compareVersions("2.1", "1.9.9")   => "newer"
 * 4. compareVersions("1.0.0", "beta")  => "unknown"
 */
export function compareVersions(
  a?: string | null,
  b?: string | null
): VersionComparisonResult {
  if (
    !a ||
    !b ||
    typeof a !== "string" ||
    typeof b !== "string"
  ) {
    return "unknown";
  }

  const trimmedA = a.trim();
  const trimmedB = b.trim();

  if (!trimmedA || !trimmedB) {
    return "unknown";
  }

  // Ensure both strings consist only of dot-separated digits
  const versionRegex = /^\d+(\.\d+)*$/;
  if (!versionRegex.test(trimmedA) || !versionRegex.test(trimmedB)) {
    return "unknown";
  }

  const partsA = trimmedA.split(".").map((n) => parseInt(n, 10));
  const partsB = trimmedB.split(".").map((n) => parseInt(n, 10));

  const maxLength = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < maxLength; i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;

    if (numA < numB) return "older";
    if (numA > numB) return "newer";
  }

  return "same";
}

/**
 * Safely parses a deadline string into epoch milliseconds.
 * Normalizes space separators (e.g. "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss")
 * and handles missing timezone or ISO formats. Returns null if invalid.
 */
export function parseDeadlineMs(deadline?: string | null): number | null {
  if (!deadline || typeof deadline !== "string") return null;
  const trimmed = deadline.trim();
  if (!trimmed) return null;

  // Replace space separator between date and time with 'T' for strict ISO engines
  const normalized = trimmed.replace(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)/,
    "$1T$2"
  );

  const ms = Date.parse(normalized);
  if (!isNaN(ms)) return ms;

  const fallback = new Date(trimmed).getTime();
  return isNaN(fallback) ? null : fallback;
}

/**
 * Checks whether a date string is valid and in the future.
 */
export function isFutureDate(dateStr?: string | null): boolean {
  const ms = parseDeadlineMs(dateStr);
  if (ms === null) return false;
  return ms > Date.now();
}

/**
 * Formats a deadline string into a user-friendly local date and time string without Intl.
 * Formats as "Oct 24, 2026, 3:30 PM", or "today at 3:30 PM" / "tomorrow at 3:30 PM"
 * when matching the device's local calendar day. Returns null for invalid dates.
 *
 * Examples:
 * 1. Today's date:        formatDeadlineDate("2026-10-24T14:30:00Z") => "today at 3:30 PM"
 * 2. Tomorrow's date:     formatDeadlineDate("2026-10-25T08:05:00Z") => "tomorrow at 9:05 AM"
 * 3. Future date:         formatDeadlineDate("2026-11-15T18:00:00Z") => "Nov 15, 2026, 7:00 PM"
 * 4. Invalid date string: formatDeadlineDate("not-a-valid-date")      => null
 */
export function formatDeadlineDate(deadline?: string | null): string | null {
  const ms = parseDeadlineMs(deadline);
  if (ms === null) return null;

  const date = new Date(ms);
  const now = new Date();

  // Check for local calendar date equality (today / tomorrow)
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  // 12-hour clock and 2-digit minute formatting
  const rawHours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = rawHours >= 12 ? "PM" : "AM";
  const hours12 = rawHours % 12 === 0 ? 12 : rawHours % 12;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const timeStr = `${hours12}:${paddedMinutes} ${ampm}`;

  if (isToday) {
    return `today at ${timeStr}`;
  }
  if (isTomorrow) {
    return `tomorrow at ${timeStr}`;
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}, ${year}, ${timeStr}`;
}

