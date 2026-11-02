export function runBenchmark(
  points,
  {
    algorithms,
    warmups = 3,
    repetitions = 15,
    now = () => performance.now()
  } = {}
) {
  if (
    typeof algorithms?.bruteForce !== "function" ||
    typeof algorithms?.divideConquer !== "function"
  ) {
    throw new TypeError("Forneça os dois algoritmos.");
  }

  if (!Number.isInteger(warmups) || warmups < 0) {
    throw new TypeError("warmups deve ser um inteiro não negativo.");
  }

  if (!Number.isInteger(repetitions) || repetitions < 1) {
    throw new TypeError("repetitions deve ser um inteiro positivo.");
  }

  // Ambos recebem exatamente as mesmas posições.
  // O congelamento também ajuda a detectar alterações indevidas
  const snapshot = Object.freeze(
    points.map(point => Object.freeze({
      id: point.id,
      x: point.x,
      y: point.y
    }))
  );

  const entries = [
    ["bruteForce", algorithms.bruteForce],
    ["divideConquer", algorithms.divideConquer]
  ];

  const samples = {
    bruteForce: [],
    divideConquer: []
  };

  const results = {};

  for (let round = 0; round < warmups; round++) {
    for (const [, algorithm] of entries) {
      algorithm(snapshot, { recordSteps: false });
    }
  }

  for (let round = 0; round < repetitions; round++) {
    // Alterna quem executa primeiro em cada rodada.
    const orderedEntries = round % 2 === 0
      ? entries
      : [entries[1], entries[0]];

    for (const [name, algorithm] of orderedEntries) {
      const start = now();

      const result = algorithm(
        snapshot,
        { recordSteps: false }
      );

      const elapsed = now() - start;

      samples[name].push(elapsed);
      results[name] = result;
    }

    if (!sameMinimumDistance(
      results.bruteForce.distanceSquared,
      results.divideConquer.distanceSquared
    )) {
      throw new Error(
        "Os algoritmos retornaram distâncias mínimas diferentes."
      );
    }
  }

  return {
    pointCount: snapshot.length,
    warmups,
    repetitions,
    distancesMatch: true,

    bruteForce: summarize(
      results.bruteForce,
      samples.bruteForce
    ),

    divideConquer: summarize(
      results.divideConquer,
      samples.divideConquer
    )
  };
}

function summarize(result, samples) {
  return {
    pair: result.pair === null ? null : [...result.pair],
    distance: result.distance,
    distanceSquared: result.distanceSquared,
    distanceChecks: result.metrics.distanceChecks,
    medianMs: median(samples),
    samplesMs: [...samples]
  };
}

function sameMinimumDistance(a, b) {
  if (a === null || b === null) {
    return a === b;
  }

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return false;
  }

  const tolerance = 1e-10 * Math.max(1, Math.abs(a), Math.abs(b));

  return Math.abs(a - b) <= tolerance;
}

function median(values) {
  // Ordenação somente das medições do benchmark,
  // não dos pontos usados no algoritmo acadêmico.
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);

  if (ordered.length % 2 === 1) {
    return ordered[middle];
  }

  return (ordered[middle - 1] + ordered[middle]) / 2;
}