export function normalizeAgeInput(value?: string | number | null): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();

  // Already a valid bucket
  const allowed = ['4-6','7-9','10-12'];
  if (allowed.includes(str)) return str;

  // Try parse as single number
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    if (num <= 6) return '4-6';
    if (num <= 9) return '7-9';
    if (num <= 12) return '10-12';
  }

  // Try to coerce ranges like "5-7" => pick bucket by start
  const match = str.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
  if (match) {
    const start = parseInt(match[1], 10);
    if (!isNaN(start)) {
      if (start <= 6) return '4-6';
      if (start <= 9) return '7-9';
      if (start <= 12) return '10-12';
    }
  }

  return undefined;
}
