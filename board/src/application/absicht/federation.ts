/**
 * Federated receivers and the minimum-loop certification check, in this
 * paper's own vocabulary (Federation Theorem; Minimum Loop Theorem;
 * A three-cycle suffices). A federation's floor is at most the minimum
 * of its constituents' floors; a certification check-graph below a
 * directed 3-cycle certifies nothing beyond its weakest terminal member.
 */

export function federationFloor(floors: number[]): number {
  if (floors.length === 0) return Infinity;
  return Math.min(...floors);
}

export function multiplicativeFloor(floors: number[], omega = 1.0): number {
  const survival = floors.reduce((acc, f) => acc * (1 - f / omega), 1);
  return omega * (1 - survival);
}
