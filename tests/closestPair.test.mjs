
import test from "node:test";
import assert from "node:assert/strict";

import {
  findClosestPairDivideConquer
} from "../src/algorithms/closestPair.js";

import {
  closestPairOracle
} from "./helpers/closestPairOracle.mjs";

function assertMatchesOracle(points) {
  const expected = closestPairOracle(points);
  const actual = findClosestPairDivideConquer(points);

  assert.equal(
    actual.distanceSquared,
    expected.distanceSquared
  );

  if (points.length < 2) {
    assert.equal(actual.pair, null);
    assert.equal(actual.distance, null);
    return;
  }

  // Confere também se o par retornado realmente tem
  // a distância mínima informada.
  assert.ok(Array.isArray(actual.pair));
  assert.equal(actual.pair.length, 2);
  assert.notEqual(actual.pair[0], actual.pair[1]);

  const a = points.find(point => point.id === actual.pair[0]);
  const b = points.find(point => point.id === actual.pair[1]);

  assert.ok(a);
  assert.ok(b);

  const dx = a.x - b.x;
  const dy = a.y - b.y;

  assert.equal(
    dx * dx + dy * dy,
    actual.distanceSquared
  );
}

test("retorna resultado vazio para menos de dois pontos", () => {
  for (const points of [
    [],
    [{ id: "a", x: 10, y: 20 }]
  ]) {
    const result = findClosestPairDivideConquer(points);

    assert.deepEqual(result, {
      pair: null,
      distanceSquared: null,
      distance: null,
      metrics: {
        distanceChecks: 0,
        maxDepth: 0
      },
      steps: []
    });
  }
});

test("resolve dois pontos e registra uma verificação", () => {
  const result = findClosestPairDivideConquer([
    { id: "b", x: 0, y: 0 },
    { id: "a", x: 3, y: 4 }
  ]);

  assert.deepEqual(result.pair, ["a", "b"]);
  assert.equal(result.distanceSquared, 25);
  assert.equal(result.distance, 5);
  assert.equal(result.metrics.distanceChecks, 1);
  assert.equal(result.metrics.maxDepth, 0);
});

test("encontra um par que atravessa a divisão", () => {
  const points = [
    { id: "a", x: 0, y: 100 },
    { id: "b", x: 10, y: 0 },
    { id: "c", x: 11, y: 0 },
    { id: "d", x: 20, y: 100 }
  ];

  const result = findClosestPairDivideConquer(points);

  assert.deepEqual(result.pair, ["b", "c"]);
  assert.equal(result.distanceSquared, 1);
});

test("resolve conjuntos com quantidade ímpar de pontos", () => {
  assertMatchesOracle([
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 10, y: 5 },
    { id: "c", x: 11, y: 5 },
    { id: "d", x: 40, y: 30 },
    { id: "e", x: -10, y: -10 }
  ]);
});

test("trata todos os pontos com o mesmo x", () => {
  assertMatchesOracle([
    { id: "a", x: 10, y: 0 },
    { id: "b", x: 10, y: 30 },
    { id: "c", x: 10, y: 31 },
    { id: "d", x: 10, y: 70 },
    { id: "e", x: 10, y: 100 }
  ]);
});

test("trata posições repetidas", () => {
  const points = [
    { id: "a", x: 5, y: 5 },
    { id: "b", x: 5, y: 5 },
    { id: "c", x: 20, y: 20 },
    { id: "d", x: 30, y: 30 }
  ];

  assertMatchesOracle(points);

  assert.equal(
    findClosestPairDivideConquer(points).distanceSquared,
    0
  );
});

test("trata vários pares empatados", () => {
  assertMatchesOracle([
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 1, y: 0 },
    { id: "c", x: 0, y: 1 },
    { id: "d", x: 1, y: 1 }
  ]);
});

test("trata coordenadas fracionárias em um caso conhecido", () => {
  const result = findClosestPairDivideConquer([
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 0.5, y: 0 },
    { id: "c", x: 10, y: 10 },
    { id: "d", x: 20, y: 20 }
  ]);

  assert.equal(result.distanceSquared, 0.25);
  assert.equal(result.distance, 0.5);
});

test("não modifica o array nem os pontos", () => {
  const points = Object.freeze([
    Object.freeze({ id: "d", x: 40, y: 10 }),
    Object.freeze({ id: "b", x: 10, y: 20 }),
    Object.freeze({ id: "a", x: 0, y: 0 }),
    Object.freeze({ id: "c", x: 11, y: 20 })
  ]);

  assertMatchesOracle(points);

  assert.deepEqual(
    points.map(point => point.id),
    ["d", "b", "a", "c"]
  );
});

test("rejeita IDs duplicados", () => {
  assert.throws(
    () => findClosestPairDivideConquer([
      { id: "a", x: 0, y: 0 },
      { id: "a", x: 1, y: 1 }
    ]),
    /ID duplicado/
  );
});

test("rejeita coordenadas inválidas", () => {
  for (const value of [NaN, Infinity, -Infinity, "10"]) {
    assert.throws(
      () => findClosestPairDivideConquer([
        { id: "a", x: value, y: 0 }
      ]),
      TypeError
    );
  }
});

test("rejeita array ou pontos inválidos", () => {
  assert.throws(
    () => findClosestPairDivideConquer(null),
    TypeError
  );

  for (const point of [null, undefined, {}, { id: 1, x: 0, y: 0 }]) {
    assert.throws(
      () => findClosestPairDivideConquer([point]),
      TypeError
    );
  }
});

test("concorda com o oráculo em conjuntos reproduzíveis", () => {
  let seed = 123456789;

  function randomInteger() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;

    return (seed % 201) - 100;
  }

  for (let size = 2; size <= 60; size++) {
    const points = Array.from({ length: size }, (_, index) => ({
      id: `p${index}`,
      x: randomInteger(),
      y: randomInteger()
    }));

    assertMatchesOracle(points);
  }
});
