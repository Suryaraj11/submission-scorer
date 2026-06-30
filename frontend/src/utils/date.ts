/**
 * Safe date helpers.
 *
 * The backend serializes java.time.LocalDateTime two different ways
 * depending on Jackson config:
 *  - as an ISO-8601 string, e.g. "2026-06-30T14:22:10.123456", or
 *  - as a numeric array (Jackson's default for java.time types when
 *    WRITE_DATES_AS_TIMESTAMPS is on), e.g. [2026, 6, 30, 14, 22, 10, 123456000]
 *    -> [year, month(1-indexed), day, hour, minute, second, nanoOfSecond]
 *
 * JS Date() can't parse either form directly without help: the string
 * form sometimes carries more than millisecond precision, and the array
 * form isn't a Date-parseable value at all. These helpers normalise both
 * shapes and guard against null/invalid input everywhere a date is rendered.
 */

type BackendDate = string | number[] | null | undefined;

/** Parses a backend timestamp (ISO string or Jackson array) into a valid Date, or null if unparseable. */
export const parseDate = (value: BackendDate): Date | null => {
  if (value === null || value === undefined) return null;

  // Jackson array form: [year, month(1-indexed), day, hour, minute, second, nanoOfSecond]
  if (Array.isArray(value)) {
    if (value.length < 3) return null;
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
    // JS Date uses 0-indexed months; Jackson's array uses 1-indexed months
    const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value !== 'string' || value.trim() === '') return null;

  // String form: trim fractional seconds down to milliseconds (JS Date max precision)
  // "2026-06-30T14:22:10.123456" -> "2026-06-30T14:22:10.123"
  let normalised = value.replace(/(\.\d{3})\d+/, '$1');

  if (!normalised.endsWith('Z') && !normalised.includes('+') && !/-\d{2}:\d{2}$/.test(normalised)) {
    normalised += 'Z';
  }

  const date = new Date(normalised);
  return isNaN(date.getTime()) ? null : date;
};

/** Formats a date string for display, falling back gracefully if absent/invalid. */
export const formatDate = (
  value: BackendDate,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
  fallback = '—'
): string => {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString('en-GB', options);
};

/** Formats a date+time string for display, falling back gracefully if absent/invalid. */
export const formatDateTime = (
  value: BackendDate,
  fallback = '—'
): string => {
  const date = parseDate(value);
  if (!date) return fallback;
  return date.toLocaleString('en-GB');
};
