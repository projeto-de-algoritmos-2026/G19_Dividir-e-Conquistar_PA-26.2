import test from "node:test";
import assert from "node:assert/strict";

import {
  findClosestPairBruteForce
} from "../../src/algorithms/bruteForceClosestPair.js";

test("retorna resultado vazio com menos de dois pontos", () => {
  for (const points of [
    [],
    [{ id: "a", x: 10, y: 20 }]
  ]) {
    assert.deepEqual(findClosestPairBruteForce(points), {
      pair: null,
      distanceSquared: null,
      distance: null,
      metrics: { distanceChecks: 0, maxDepth: 0 },
      steps: []
    });
  }
});

test("encontra o par mais próximo e conta cada distância", () => {
  const result = findClosestPairBruteForce([
    { id: "c", x: 0, y: 0 },
    { id: "b", x: 3, y: 4 },
    { id: "a", x: 3, y: 5 }
  ]);

  assert.deepEqual(result.pair, ["a", "b"]);
  assert.equal(result.distanceSquared, 1);
  assert.equal(result.distance, 1);
  assert.equal(result.metrics.distanceChecks, 3);
  assert.equal(result.metrics.maxDepth, 0);
});

test("grava eventos de comparação apenas quando solicitado", () => {
  const points = [
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 3, y: 4 }
  ];

  assert.deepEqual(findClosestPairBruteForce(points).steps, []);

  const result = findClosestPairBruteForce(points, { recordSteps: true });
  assert.deepEqual(
    result.steps.map(step => step.type),
    ["start", "compare", "best", "finish"]
  );
});

test("rejeita IDs duplicados e coordenadas inválidas", () => {
  assert.throws(
    () => findClosestPairBruteForce([
      { id: "x", x: 0, y: 0 },
      { id: "x", x: 1, y: 1 }
    ]),
    /ID duplicado/
  );

  assert.throws(
    () => findClosestPairBruteForce([
      { id: "x", x: Infinity, y: 1 }
    ]),
    TypeError
  );
});
