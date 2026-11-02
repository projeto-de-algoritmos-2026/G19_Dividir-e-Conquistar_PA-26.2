import test from "node:test";
import assert from "node:assert/strict";

import {
  mergeSort,
  mergeSorted
} from "../src/algorithms/mergeSort.js";

const compareNumbers = (a, b) => a - b;

test("ordena números em ordem crescente", () => {
  const result = mergeSort([8, 3, 5, 1, 9, 2], compareNumbers);

  assert.deepEqual(result, [1, 2, 3, 5, 8, 9]);
});

test("aceita array vazio", () => {
  assert.deepEqual(mergeSort([], compareNumbers), []);
});

test("aceita um único elemento e retorna um novo array", () => {
  const input = [7];
  const result = mergeSort(input, compareNumbers);

  assert.deepEqual(result, [7]);
  assert.notStrictEqual(result, input);
});

test("trata números repetidos e negativos", () => {
  const result = mergeSort([3, -1, 3, 0, -5], compareNumbers);

  assert.deepEqual(result, [-5, -1, 0, 3, 3]);
});

test("não altera o array original", () => {
  const input = Object.freeze([4, 2, 1, 3]);

  const result = mergeSort(input, compareNumbers);

  assert.deepEqual(input, [4, 2, 1, 3]);
  assert.deepEqual(result, [1, 2, 3, 4]);
});

test("ordena pontos por x, usando y como desempate", () => {
  const points = [
    { id: "p1", x: 30, y: 10 },
    { id: "p2", x: 10, y: 20 },
    { id: "p3", x: 10, y: 5 }
  ];

  const result = mergeSort(
    points,
    (a, b) => a.x - b.x || a.y - b.y
  );

  assert.deepEqual(
    result.map(point => point.id),
    ["p3", "p2", "p1"]
  );
});

test("preserva a ordem original de elementos empatados", () => {
  const items = [
    { id: "a", value: 2 },
    { id: "b", value: 1 },
    { id: "c", value: 2 },
    { id: "d", value: 1 }
  ];

  const result = mergeSort(items, (a, b) => a.value - b.value);

  assert.deepEqual(
    result.map(item => item.id),
    ["b", "d", "a", "c"]
  );
});

test("intercala dois arrays ordenados", () => {
  const left = Object.freeze([1, 4, 8]);
  const right = Object.freeze([2, 3, 9]);

  assert.deepEqual(
    mergeSorted(left, right, compareNumbers),
    [1, 2, 3, 4, 8, 9]
  );
});

test("intercala quando um lado está vazio", () => {
  assert.deepEqual(
    mergeSorted([], [2, 5], compareNumbers),
    [2, 5]
  );

  assert.deepEqual(
    mergeSorted([2, 5], [], compareNumbers),
    [2, 5]
  );
});

test("rejeita entrada que não é array", () => {
  assert.throws(
    () => mergeSort(null, compareNumbers),
    TypeError
  );
});

test("exige uma função de comparação", () => {
  assert.throws(
    () => mergeSort([3, 1, 2]),
    TypeError
  );
});
