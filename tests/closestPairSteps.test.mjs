import test from "node:test";
import assert from "node:assert/strict";

import {
  findClosestPairDivideConquer
} from "../src/algorithms/closestPair.js";

function createPoints() {
  return [
    { id: "a", x: 0, y: 100 },
    { id: "b", x: 10, y: 0 },
    { id: "c", x: 11, y: 0 },
    { id: "d", x: 20, y: 100 }
  ];
}

test("não registra passos por padrão", () => {
  const result = findClosestPairDivideConquer(createPoints());

  assert.deepEqual(result.steps, []);
});

test("registra start e finish uma única vez", () => {
  const result = findClosestPairDivideConquer(
    createPoints(),
    { recordSteps: true }
  );

  const starts = result.steps.filter(step => step.type === "start");
  const finishes = result.steps.filter(step => step.type === "finish");

  assert.equal(starts.length, 1);
  assert.equal(finishes.length, 1);

  assert.equal(result.steps[0].type, "start");
  assert.equal(result.steps.at(-1).type, "finish");
});

test("registra a divisão correta dos pontos", () => {
  const result = findClosestPairDivideConquer(
    createPoints(),
    { recordSteps: true }
  );

  const division = result.steps.find(
    step => step.type === "divide"
  );

  assert.deepEqual(division, {
    type: "divide",
    depth: 0,
    lineX: 11,
    leftIds: ["a", "b"],
    rightIds: ["c", "d"]
  });
});

test("registra a faixa e o par encontrado entre as metades", () => {
  const result = findClosestPairDivideConquer(
    createPoints(),
    { recordSteps: true }
  );

  const strip = result.steps.find(
    step => step.type === "strip"
  );

  assert.ok(strip);
  assert.equal(strip.depth, 0);
  assert.equal(strip.lineX, 11);
  assert.ok(strip.pointIds.includes("b"));
  assert.ok(strip.pointIds.includes("c"));

  const crossComparison = result.steps.find(
    step =>
      step.type === "compare" &&
      step.pair[0] === "b" &&
      step.pair[1] === "c"
  );

  assert.ok(crossComparison);
  assert.equal(crossComparison.distanceSquared, 1);
});

test("cada verificação de distância gera um evento compare", () => {
  const result = findClosestPairDivideConquer(
    createPoints(),
    { recordSteps: true }
  );

  const comparisons = result.steps.filter(
    step => step.type === "compare"
  );

  assert.equal(
    comparisons.length,
    result.metrics.distanceChecks
  );
});

test("não repete na faixa pares que já estão na mesma metade", () => {
  const result = findClosestPairDivideConquer(
    createPoints(),
    { recordSteps: true }
  );

  const comparisons = result.steps
    .filter(step => step.type === "compare")
    .map(step => step.pair.join("-"));

  assert.equal(
    comparisons.filter(pair => pair === "a-b").length,
    1
  );
});

test("gravar passos não altera o resultado nem as métricas", () => {
  const points = createPoints();

  const withoutSteps = findClosestPairDivideConquer(points);

  const withSteps = findClosestPairDivideConquer(
    points,
    { recordSteps: true }
  );

  assert.deepEqual(withSteps.pair, withoutSteps.pair);

  assert.equal(
    withSteps.distanceSquared,
    withoutSteps.distanceSquared
  );

  assert.deepEqual(
    withSteps.metrics,
    withoutSteps.metrics
  );
});

test("finish corresponde ao resultado retornado", () => {
  const result = findClosestPairDivideConquer(
    createPoints(),
    { recordSteps: true }
  );

  assert.deepEqual(result.steps.at(-1), {
    type: "finish",
    depth: 0,
    pair: result.pair,
    distanceSquared: result.distanceSquared
  });
});

test("registra start e finish para menos de dois pontos", () => {
  for (const points of [
    [],
    [{ id: "a", x: 10, y: 20 }]
  ]) {
    const result = findClosestPairDivideConquer(
      points,
      { recordSteps: true }
    );

    assert.deepEqual(result.steps, [
      {
        type: "start",
        pointIds: points.map(point => point.id),
        depth: 0
      },
      {
        type: "finish",
        depth: 0,
        pair: null,
        distanceSquared: null
      }
    ]);
  }
});

test("eventos compare contêm distâncias dos pontos informados", () => {
  const points = createPoints();
  const byId = new Map(points.map(point => [point.id, point]));

  const result = findClosestPairDivideConquer(
    points,
    { recordSteps: true }
  );

  for (const step of result.steps) {
    if (step.type !== "compare") {
      continue;
    }

    const a = byId.get(step.pair[0]);
    const b = byId.get(step.pair[1]);

    assert.ok(a);
    assert.ok(b);

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    assert.equal(
      step.distanceSquared,
      dx * dx + dy * dy
    );
  }
});