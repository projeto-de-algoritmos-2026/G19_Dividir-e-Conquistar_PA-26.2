

import test from "node:test";
import assert from "node:assert/strict";

import {
  closestPairOracle
} from "./helpers/closestPairOracle.mjs";

test("retorna resultado vazio para nenhum ponto", () => {
  assert.deepEqual(closestPairOracle([]), {
    pair: null,
    distanceSquared: null,
    distance: null
  });
});

test("retorna resultado vazio para um ponto", () => {
  const points = [
    { id: "a", x: 10, y: 20 }
  ];

  assert.equal(closestPairOracle(points).pair, null);
});

test("calcula a distância entre dois pontos", () => {
  const points = [
    { id: "b", x: 0, y: 0 },
    { id: "a", x: 3, y: 4 }
  ];

  assert.deepEqual(closestPairOracle(points), {
    pair: ["a", "b"],
    distanceSquared: 25,
    distance: 5
  });
});

test("encontra o par mais próximo entre vários pontos", () => {
  const points = [
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 10, y: 10 },
    { id: "c", x: 11, y: 10 },
    { id: "d", x: 50, y: 50 }
  ];

  assert.deepEqual(closestPairOracle(points), {
    pair: ["b", "c"],
    distanceSquared: 1,
    distance: 1
  });
});

test("trata pontos com posições iguais", () => {
  const points = [
    { id: "a", x: 5, y: 5 },
    { id: "b", x: 5, y: 5 },
    { id: "c", x: 20, y: 30 }
  ];

  const result = closestPairOracle(points);

  assert.deepEqual(result.pair, ["a", "b"]);
  assert.equal(result.distanceSquared, 0);
});

test("trata pontos com a mesma coordenada x", () => {
  const points = [
    { id: "a", x: 10, y: 0 },
    { id: "b", x: 10, y: 8 },
    { id: "c", x: 10, y: 10 }
  ];

  const result = closestPairOracle(points);

  assert.deepEqual(result.pair, ["b", "c"]);
  assert.equal(result.distanceSquared, 4);
});

test("trata coordenadas negativas", () => {
  const points = [
    { id: "a", x: -3, y: -4 },
    { id: "b", x: 0, y: 0 },
    { id: "c", x: 20, y: 20 }
  ];

  assert.equal(closestPairOracle(points).distanceSquared, 25);
});

test("aceita qualquer par mínimo em caso de empate", () => {
  const points = [
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 1, y: 0 },
    { id: "c", x: 2, y: 0 }
  ];

  const result = closestPairOracle(points);

  assert.equal(result.distanceSquared, 1);

  const validPairs = ["a,b", "b,c"];

  assert.ok(validPairs.includes(result.pair.join(",")));
});

test("não modifica a entrada nem seus objetos", () => {
  const points = Object.freeze([
    Object.freeze({ id: "b", x: 3, y: 4 }),
    Object.freeze({ id: "a", x: 0, y: 0 })
  ]);

  const result = closestPairOracle(points);

  assert.deepEqual(result.pair, ["a", "b"]);
  assert.equal(points[0].id, "b");
  assert.equal(points[1].id, "a");
});
