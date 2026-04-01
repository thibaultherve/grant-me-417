/**
 * Groups postcodes by their state code.
 *
 * @returns Record keyed by stateCode, values are sorted postcode strings.
 */
export function groupPostcodesByState(
  postcodes: { postcode: string; stateCode: string }[],
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const p of postcodes) {
    const list = (grouped[p.stateCode] ??= []);
    list.push(p.postcode);
  }
  // Sort postcodes within each state
  for (const list of Object.values(grouped)) {
    list.sort();
  }
  return grouped;
}

/**
 * Groups sorted postcodes into columns of consecutive numbers.
 *
 * Consecutive means the numeric value differs by exactly 1.
 * Each column is a vertical stack; columns flow left-to-right
 * sorted by the smallest starting postcode.
 *
 * @example
 * groupIntoConsecutiveColumns(['3023','3024','3025','3131','3132','3133'])
 * // → [['3023','3024','3025'], ['3131','3132','3133']]
 */
export function groupIntoConsecutiveColumns(postcodes: string[]): string[][] {
  if (postcodes.length === 0) return [];

  const sorted = [...postcodes].sort();
  const columns: string[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = Number(sorted[i - 1]);
    const curr = Number(sorted[i]);

    if (curr === prev + 1) {
      columns[columns.length - 1].push(sorted[i]);
    } else {
      columns.push([sorted[i]]);
    }
  }

  return columns;
}
