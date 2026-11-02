export function findClosestPairReference(
  points,
  { recordSteps = false } = {}
) {
  let pair = null;
  let bestSquared = Infinity;
  let distanceChecks = 0;
  const steps = [];

  function record(createStep) {
    if (recordSteps) {
      steps.push(createStep());
    }
  }

  record(() => ({
    type: "start",
    pointIds: points.map(point => point.id),
    depth: 0
  }));

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      distanceChecks++;

      const a = points[i];
      const b = points[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const squared = dx * dx + dy * dy;

      const currentPair = a.id < b.id
        ? [a.id, b.id]
        : [b.id, a.id];

      record(() => ({
        type: "compare",
        depth: 0,
        pair: [...currentPair],
        distanceSquared: squared
      }));

      if (squared < bestSquared) {
        bestSquared = squared;

        pair = currentPair;

        record(() => ({
          type: "best",
          depth: 0,
          pair: [...pair],
          distanceSquared: bestSquared
        }));
      }
    }
  }

  record(() => ({
    type: "finish",
    depth: 0,
    pair: pair === null ? null : [...pair],
    distanceSquared: pair === null ? null : bestSquared
  }));

  return {
    pair,
    distanceSquared: pair === null ? null : bestSquared,
    distance: pair === null ? null : Math.sqrt(bestSquared),
    metrics: {
      distanceChecks,
      maxDepth: 0
    },
    steps
  };
}