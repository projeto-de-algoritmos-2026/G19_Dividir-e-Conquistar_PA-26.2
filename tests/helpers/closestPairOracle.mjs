export function closestPairOracle(points) {
  if (points.length < 2) {
    return {
      pair: null,
      distanceSquared: null,
      distance: null
    };
  }

  let bestPair = null;
  let bestDistanceSquared = Infinity;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;

      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < bestDistanceSquared) {
        bestDistanceSquared = distanceSquared;

        const firstId = points[i].id;
        const secondId = points[j].id;

        bestPair = firstId < secondId
          ? [firstId, secondId]
          : [secondId, firstId];
      }
    }
  }

  return {
    pair: bestPair,
    distanceSquared: bestDistanceSquared,
    distance: Math.sqrt(bestDistanceSquared)
  };
}
