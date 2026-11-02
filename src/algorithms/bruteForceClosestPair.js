export function findClosestPairBruteForce(
  points,
  { recordSteps = false } = {}
) {
  validatePoints(points);

  const metrics = {
    distanceChecks: 0,
    maxDepth: 0
  };
  const steps = [];

  function record(step) {
    if (recordSteps) {
      steps.push(step);
    }
  }

  record({
    type: "start",
    pointIds: points.map(point => point.id),
    depth: 0
  });

  let bestPair = null;
  let bestDistanceSquared = null;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distanceSquared = dx * dx + dy * dy;
      const pair = a.id < b.id
        ? [a.id, b.id]
        : [b.id, a.id];

      metrics.distanceChecks++;
      record({
        type: "compare",
        depth: 0,
        pair: [...pair],
        distanceSquared
      });

      if (
        bestDistanceSquared === null ||
        distanceSquared < bestDistanceSquared
      ) {
        bestPair = pair;
        bestDistanceSquared = distanceSquared;
        record({
          type: "best",
          depth: 0,
          pair: [...bestPair],
          distanceSquared: bestDistanceSquared
        });
      }
    }
  }

  record({
    type: "finish",
    depth: 0,
    pair: bestPair === null ? null : [...bestPair],
    distanceSquared: bestDistanceSquared
  });

  return {
    pair: bestPair,
    distanceSquared: bestDistanceSquared,
    distance: bestDistanceSquared === null
      ? null
      : Math.sqrt(bestDistanceSquared),
    metrics,
    steps
  };
}

function validatePoints(points) {
  if (!Array.isArray(points)) {
    throw new TypeError("points deve ser um array.");
  }

  const ids = new Set();

  for (const point of points) {
    if (
      point === null ||
      typeof point !== "object" ||
      typeof point.id !== "string"
    ) {
      throw new TypeError(
        "Cada ponto deve possuir um id do tipo string."
      );
    }

    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new TypeError(
        "As coordenadas dos pontos devem ser números finitos."
      );
    }

    if (ids.has(point.id)) {
      throw new Error(`ID duplicado: ${point.id}`);
    }

    ids.add(point.id);
  }
}
