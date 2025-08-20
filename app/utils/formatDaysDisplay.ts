/**
 * Formats an array of day numbers into a string, using dashes for consecutive ranges.
 * Examples:
 * [1,2,3] => "1-3"
 * [1,2] => "1-2"
 * [2,3] => "2-3"
 * [1,3] => "1,3"
 */
export function formatDaysDisplay(days: number[]): string {
  if (days.length === 0) return "";
  const sorted = [...days].sort((a, b) => a - b);
  const result: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    const start = sorted[i];
    let end = start;
    while (i + 1 < sorted.length && sorted[i + 1] === end + 1) {
      end = sorted[i + 1];
      i++;
    }
    if (end !== start) {
      result.push(`${start}-${end}`);
    } else {
      result.push(`${start}`);
    }
    i++;
  }
  return result.join(", ");
}
