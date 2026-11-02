import test from "node:test";
import assert from "node:assert/strict";

import { runBenchmark } from "../src/lab/benchmark.js";

import {
  findClosestPairReference
} from "../src/lab/referenceClosestPair.js";

import {
  findClosestPairDivideConquer
} from "../src/algorithms/closestPair.js";

const points = [
  { id: "a", x: 0, y: 0 },
  { id: "b", x: 3, y: 4 },
  { id: "c", x: 30, y: 40 },
  { id: "d", x: 31, y: 40 }
];

const algorithms = {
  bruteForce: findClosestPairReference,
  divideConquer: findClosestPairDivideConquer
};

test("compara os algoritmos sobre o mesmo conjunto", () => {
  const result = runBenchmark(points, {
    algorithms,
    warmups: 1,
    repetitions: 3
  });

  assert.equal(result.pointCount, 4);
  assert.equal(result.distancesMatch, true);

  assert.equal(result.bruteForce.distanceSquared, 1);
  assert.equal(result.divideConquer.distanceSquared, 1);

  assert.equal(result.bruteForce.distanceChecks, 6);
  assert.equal(result.bruteForce.samplesMs.length, 3);
  assert.equal(result.divideConquer.samplesMs.length, 3);
});

test("calcula a mediana usando um relógio controlado", () => {
  let clock = 0;

  const result = runBenchmark(points, {
    algorithms,
    warmups: 0,
    repetitions: 3,
    now() {
      return clock++;
    }
  });

  assert.equal(result.bruteForce.medianMs, 1);
  assert.equal(result.divideConquer.medianMs, 1);
});

test("faz a quantidade esperada de chamadas sem gravar passos", () => {
  const calls = {
    bruteForce: 0,
    divideConquer: 0
  };

  function wrap(name, algorithm) {
    return (receivedPoints, options) => {
      calls[name]++;

      assert.equal(options.recordSteps, false);
      assert.ok(Object.isFrozen(receivedPoints));
      assert.ok(Object.isFrozen(receivedPoints[0]));

      return algorithm(receivedPoints, options);
    };
  }

  runBenchmark(points, {
    algorithms: {
      bruteForce: wrap("bruteForce", findClosestPairReference),
      divideConquer: wrap(
        "divideConquer",
        findClosestPairDivideConquer
      )
    },
    warmups: 2,
    repetitions: 4
  });

  assert.equal(calls.bruteForce, 6);
  assert.equal(calls.divideConquer, 6);
});

test("rejeita resultados com distâncias divergentes", () => {
  const incorrectAlgorithm = receivedPoints => ({
    ...findClosestPairReference(receivedPoints),
    distanceSquared: 999
  });

  assert.throws(
    () => runBenchmark(points, {
      algorithms: {
        bruteForce: findClosestPairReference,
        divideConquer: incorrectAlgorithm
      },
      warmups: 0,
      repetitions: 1
    }),
    /distâncias mínimas diferentes/
  );
});

test("não altera os pontos originais", () => {
  const original = points.map(point => ({ ...point }));

  runBenchmark(points, {
    algorithms,
    warmups: 0,
    repetitions: 1
  });

  assert.deepEqual(points, original);
});

test("funciona com uma entrada vazia", () => {
  const result = runBenchmark([], {
    algorithms,
    warmups: 0,
    repetitions: 1
  });

  assert.equal(result.bruteForce.pair, null);
  assert.equal(result.divideConquer.pair, null);
  assert.equal(result.distancesMatch, true);
});

test("rejeita configurações inválidas", () => {
  assert.throws(
    () => runBenchmark(points, { algorithms: {} }),
    TypeError
  );

  assert.throws(
    () => runBenchmark(points, {
      algorithms,
      repetitions: 0
    }),
    TypeError
  );

  assert.throws(
    () => runBenchmark(points, {
      algorithms,
      warmups: -1
    }),
    TypeError
  );
});