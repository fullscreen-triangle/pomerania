/**
 * Coherence triangle, ported from
 * four-sided-triangle/equilateral/src/lib/coherence.ts. A coalition of
 * catalysts is "grounded" at threshold theta if every member is
 * supported by at least one other member above theta; "robust" if
 * grounded remains true after removing any single member.
 */

export function isGrounded(votes: number[], theta: number): boolean {
  const n = votes.length;
  if (n <= 1) return false;
  for (let i = 0; i < n; i++) {
    const supported = votes.some((v, j) => j !== i && v > theta);
    if (!supported) return false;
  }
  return true;
}

export interface RemovalStep {
  removedIndex: number;
  stillGrounded: boolean;
}

export function robustnessDetail(n: number, voteStrength: number, theta: number) {
  const votes = Array.from({ length: n }, () => voteStrength);
  const initiallyGrounded = isGrounded(votes, theta);
  const removals: RemovalStep[] = [];
  for (let removed = 0; removed < n; removed++) {
    const remaining = votes.filter((_, i) => i !== removed);
    removals.push({ removedIndex: removed, stillGrounded: isGrounded(remaining, theta) });
  }
  const robust = initiallyGrounded && removals.every((r) => r.stillGrounded);
  return { initiallyGrounded, removals, robust };
}
