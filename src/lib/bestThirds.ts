type StandingRow = {
  position: number;
  teamId: string;
  points: number;
  goalDiff: number;
  goalsFor: number;
};

export function computeBestThirds(allStandings: StandingRow[]): Set<string> {
  const thirds = allStandings.filter((s) => s.position === 3);
  const sorted = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
  return new Set(sorted.slice(0, 8).map((s) => s.teamId));
}
