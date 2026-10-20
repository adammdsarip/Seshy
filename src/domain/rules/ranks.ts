/**
 * Assigns competition ranks (1, 2, 2, 4) to an already-sorted list.
 * `sameRank` decides whether two neighbours are tied.
 */
export function competitionRanks<T>(sorted: T[], sameRank: (a: T, b: T) => boolean): number[] {
  const ranks: number[] = [];
  sorted.forEach((item, i) => {
    const prev = sorted[i - 1];
    ranks.push(i > 0 && prev !== undefined && sameRank(prev, item) ? ranks[i - 1]! : i + 1);
  });
  return ranks;
}
