import test from "node:test";
import assert from "node:assert/strict";

import {
  createCharacters,
  projectCharacters
} from "../../src/simulation/characters.js";
import {
  createEncounterTracker
} from "../../src/simulation/encounters.js";
import {
  updateCharacters
} from "../../src/simulation/movement.js";

test("gera personagens reproduzíveis e com posições dentro da arena", () => {
  const options = { width: 200, height: 100, seed: 42 };
  const first = createCharacters(5, options);
  const second = createCharacters(5, options);

  assert.deepEqual(first, second);
  assert.equal(new Set(first.map(character => character.id)).size, 5);

  for (const character of first) {
    assert.ok(character.x >= character.radius);
    assert.ok(character.x <= 200 - character.radius);
    assert.ok(character.y >= character.radius);
    assert.ok(character.y <= 100 - character.radius);
  }
});

test("projeta personagens como pontos sem alterar o modelo", () => {
  const characters = createCharacters(1, { seed: 1 });
  const point = projectCharacters(characters)[0];

  assert.deepEqual(point, {
    id: characters[0].id,
    x: characters[0].x,
    y: characters[0].y
  });
  assert.equal("vx" in point, false);
});

test("reflete nas bordas mesmo após um delta de tempo longo", () => {
  const characters = [{
    id: "p",
    x: 5,
    y: 5,
    vx: 10,
    vy: -10,
    radius: 5
  }];

  updateCharacters(characters, 3, { width: 20, height: 20 });

  assert.ok(characters[0].x >= 5 && characters[0].x <= 15);
  assert.ok(characters[0].y >= 5 && characters[0].y <= 15);
  assert.equal(characters[0].x, 15);
  assert.equal(characters[0].y, 15);
  assert.equal(characters[0].vx, -10);
  assert.equal(characters[0].vy, -10);
});

test("mantém personagens dentro da arena e valida deltaTime", () => {
  const characters = [{
    id: "p",
    x: 9,
    y: 9,
    vx: -10,
    vy: -10,
    radius: 2
  }];

  updateCharacters(characters, 1, { width: 20, height: 20 });
  assert.equal(characters[0].x, 5);
  assert.equal(characters[0].y, 5);
  assert.equal(characters[0].vx, 10);
  assert.equal(characters[0].vy, 10);

  assert.throws(
    () => updateCharacters(characters, -1, { width: 20, height: 20 }),
    RangeError
  );
});

test("inicia, mantém e encerra encontro sem emitir eventos repetidos", () => {
  const tracker = createEncounterTracker();
  const first = { pair: ["b", "a"], distance: 4 };

  assert.deepEqual(tracker.update(first, 5), [
    { type: "encounter-start", pair: ["a", "b"] }
  ]);
  assert.deepEqual(tracker.update(
    { pair: ["a", "b"], distance: 3 },
    5
  ), []);
  assert.deepEqual(tracker.update(
    { pair: ["c", "a"], distance: 2 },
    5
  ), [
    { type: "encounter-end", pair: ["a", "b"] },
    { type: "encounter-start", pair: ["a", "c"] }
  ]);
  assert.deepEqual(tracker.update(
    { pair: ["a", "c"], distance: 6 },
    5
  ), [
    { type: "encounter-end", pair: ["a", "c"] }
  ]);
  assert.equal(tracker.activePair, null);
});
