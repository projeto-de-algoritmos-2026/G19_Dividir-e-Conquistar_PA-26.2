import { mergeSort, mergeSorted } from "./mergeSort.js";

const compareByX = (a, b) =>
  a.x - b.x || a.y - b.y;

const compareByY = (a, b) =>
  a.y - b.y || a.x - b.x;

export function findClosestPairDivideConquer(
  points,
  { recordSteps = false } = {}
) {
  validatePoints(points);

  const metrics = {
    distanceChecks: 0,
    maxDepth: 0
  };

  const steps = [];

  // O argumento é uma função para não construir os objetos
  // dos eventos quando a gravação estiver desativada.
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

  if (points.length < 2) {
    record(() => ({
      type: "finish",
      depth: 0,
      pair: null,
      distanceSquared: null
    }));

    return {
      pair: null,
      distanceSquared: null,
      distance: null,
      metrics,
      steps
    };
  }

  const sortedByX = mergeSort(points, compareByX);

  const result = solve(
    sortedByX,
    0,
    metrics,
    record
  );

  record(() => ({
    type: "finish",
    depth: 0,
    pair: [...result.pair],
    distanceSquared: result.distanceSquared
  }));

  return {
    pair: result.pair,
    distanceSquared: result.distanceSquared,
    distance: Math.sqrt(result.distanceSquared),
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

    if (
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y)
    ) {
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

function solve(pointsByX, depth, metrics, record) {
  metrics.maxDepth = Math.max(metrics.maxDepth, depth);

  if (pointsByX.length <= 3) {
    return solveSmallGroup(
      pointsByX,
      depth,
      metrics,
      record
    );
  }

  const middle = Math.floor(pointsByX.length / 2);

  const leftByX = pointsByX.slice(0, middle);
  const rightByX = pointsByX.slice(middle);

  const lineX = rightByX[0].x;

  record(() => ({
    type: "divide",
    depth,
    lineX,
    leftIds: leftByX.map(point => point.id),
    rightIds: rightByX.map(point => point.id)
  }));

  const leftResult = solve(
    leftByX,
    depth + 1,
    metrics,
    record
  );

  const rightResult = solve(
    rightByX,
    depth + 1,
    metrics,
    record
  );

  let best = leftResult.distanceSquared <= rightResult.distanceSquared
    ? {
        pair: leftResult.pair,
        distanceSquared: leftResult.distanceSquared
      }
    : {
        pair: rightResult.pair,
        distanceSquared: rightResult.distanceSquared
      };

  // Este é o melhor par deste subproblema após resolver
  // as duas metades, antes de verificar a faixa.
  recordBest(best, depth, record);

  const pointsByY = mergeSorted(
    leftResult.pointsByY,
    rightResult.pointsByY,
    compareByY
  );
  const leftIds = new Set(leftByX.map(point => point.id));

  if (best.distanceSquared === 0) {
    return {
      ...best,
      pointsByY
    };
  }

  const initialDistanceSquared = best.distanceSquared;

  const strip = pointsByY.filter(point => {
    const dx = point.x - lineX;

    return dx * dx < initialDistanceSquared;
  });

  record(() => ({
    type: "strip",
    depth,
    lineX,
    delta: Math.sqrt(initialDistanceSquared),
    pointIds: strip.map(point => point.id)
  }));

  for (let i = 0; i < strip.length; i++) {
    const end = Math.min(strip.length, i + 8);

    for (let j = i + 1; j < end; j++) {
      const dy = strip[j].y - strip[i].y;

      if (dy * dy >= best.distanceSquared) {
        break;
      }

      const pointsAreFromDifferentHalves =
        leftIds.has(strip[i].id) !== leftIds.has(strip[j].id);

      if (!pointsAreFromDifferentHalves) {
        continue;
      }

      const candidate = evaluatePair(
        strip[i],
        strip[j],
        depth,
        metrics,
        record
      );

      if (candidate.distanceSquared < best.distanceSquared) {
        best = candidate;
        recordBest(best, depth, record);
      }
    }
  }

  return {
    ...best,
    pointsByY
  };
}

function solveSmallGroup(points, depth, metrics, record) {
  let best = {
    pair: null,
    distanceSquared: Infinity
  };

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const candidate = evaluatePair(
        points[i],
        points[j],
        depth,
        metrics,
        record
      );

      if (candidate.distanceSquared < best.distanceSquared) {
        best = candidate;
        recordBest(best, depth, record);
      }
    }
  }

  return {
    ...best,
    pointsByY: mergeSort(points, compareByY)
  };
}

function evaluatePair(a, b, depth, metrics, record) {
  metrics.distanceChecks++;

  const dx = a.x - b.x;
  const dy = a.y - b.y;

  const pair = a.id < b.id
    ? [a.id, b.id]
    : [b.id, a.id];

  const distanceSquared = dx * dx + dy * dy;

  record(() => ({
    type: "compare",
    depth,
    pair: [...pair],
    distanceSquared
  }));

  return {
    pair,
    distanceSquared
  };
}

function recordBest(best, depth, record) {
  record(() => ({
    type: "best",
    depth,
    pair: [...best.pair],
    distanceSquared: best.distanceSquared
  }));
}