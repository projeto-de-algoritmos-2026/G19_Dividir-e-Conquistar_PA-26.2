import test from "node:test";
import assert from "node:assert/strict";

import {
  findClosestPairReference
} from "../src/lab/referenceClosestPair.js";

const points = [
  { id: "a", x: 0, y: 0 },
  { id: "b", x: 3, y: 4 },
  { id: "c", x: 4, y: 4 }
];

test("a referência preserva o resultado ao gravar eventos", () => {
  const plain = findClosestPairReference(points);
  const recorded = findClosestPairReference(points, {
    recordSteps: true
  });

  assert.deepEqual(recorded.pair, plain.pair);
  assert.equal(recorded.distanceSquared, plain.distanceSquared);
  assert.deepEqual(recorded.metrics, plain.metrics);
});

test("a referência não grava passos por padrão", () => {
  assert.deepEqual(findClosestPairReference(points).steps, []);
});

test("eventos da referência têm um compare por verificação", () => {
  const result = findClosestPairReference(points, {
    recordSteps: true
  });

  assert.equal(
    result.steps.filter(step => step.type === "compare").length,
    result.metrics.distanceChecks
  );
  assert.equal(result.steps.filter(step => step.type === "start").length, 1);
  assert.equal(result.steps.filter(step => step.type === "finish").length, 1);
});

test("a referência trata zero e um ponto", () => {
  for (const input of [[], [{ id: "a", x: 0, y: 0 }]]) {
    const result = findClosestPairReference(input, {
      recordSteps: true
    });

    assert.equal(result.pair, null);
    assert.deepEqual(
      result.steps.map(step => step.type),
      ["start", "finish"]
    );
  }
});
