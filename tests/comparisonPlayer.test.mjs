import test from "node:test";
import assert from "node:assert/strict";

import {
  createComparisonPlayer
} from "../src/lab/comparisonPlayer.js";

function createScheduler() {
  let nextId = 0;
  const timers = new Map();

  return {
    timers,
    setInterval(callback) {
      const id = ++nextId;
      timers.set(id, callback);
      return id;
    },
    clearInterval(id) {
      timers.delete(id);
    },
    tick() {
      for (const callback of [...timers.values()]) {
        callback();
      }
    }
  };
}

function steps(pairs) {
  return [
    { type: "start" },
    ...pairs.flatMap(pair => [
      { type: "compare", pair, distanceSquared: 1 },
      { type: "best", pair, distanceSquared: 1 }
    ]),
    {
      type: "finish",
      pair: pairs.at(-1) ?? null,
      distanceSquared: pairs.length > 0 ? 1 : null
    }
  ];
}

test("cada avanço consome no máximo um compare por algoritmo", () => {
  const snapshots = [];
  const player = createComparisonPlayer({
    onChange: snapshot => snapshots.push(snapshot)
  });

  player.load({
    bruteForce: steps([["a", "b"], ["a", "c"]]),
    divideConquer: steps([["a", "c"]])
  });
  player.advance();

  const latest = snapshots.at(-1);
  assert.equal(latest.bruteForce.compareCount, 1);
  assert.equal(latest.divideConquer.compareCount, 1);
  assert.deepEqual(latest.bruteForce.currentPair, ["a", "b"]);
});

test("eventos auxiliares não incrementam contadores e algoritmos terminam separadamente", () => {
  const scheduler = createScheduler();
  const snapshots = [];
  const player = createComparisonPlayer({
    onChange: snapshot => snapshots.push(snapshot),
    scheduler
  });

  player.load({
    bruteForce: steps([["a", "b"]]),
    divideConquer: steps([["a", "b"], ["a", "c"]])
  });
  player.advance();
  player.advance();

  const latest = snapshots.at(-1);
  assert.equal(latest.bruteForce.status, "completed");
  assert.equal(latest.bruteForce.compareCount, 1);
  assert.equal(latest.divideConquer.status, "running");
  assert.equal(latest.divideConquer.compareCount, 2);
});

test("reiniciar zera a reprodução sem trocar o histórico carregado", () => {
  const snapshots = [];
  const player = createComparisonPlayer({
    onChange: snapshot => snapshots.push(snapshot)
  });

  player.load({
    bruteForce: steps([["a", "b"]]),
    divideConquer: steps([["a", "c"]])
  });
  player.advance();
  player.reset();

  const latest = snapshots.at(-1);
  assert.equal(latest.bruteForce.compareCount, 0);
  assert.equal(latest.divideConquer.compareCount, 0);
  assert.equal(latest.bruteForce.status, "ready");
  assert.equal(latest.divideConquer.status, "ready");
});

test("pausar, retomar e mudar a velocidade não duplicam timers", () => {
  const scheduler = createScheduler();
  const player = createComparisonPlayer({
    onChange() {},
    scheduler
  });

  player.load({
    bruteForce: steps([["a", "b"], ["a", "c"]]),
    divideConquer: steps([["a", "c"], ["b", "c"]])
  });
  player.togglePlay();
  assert.equal(scheduler.timers.size, 1);
  player.setSpeed(100);
  assert.equal(scheduler.timers.size, 1);
  player.togglePlay();
  assert.equal(scheduler.timers.size, 0);
  player.togglePlay();
  assert.equal(scheduler.timers.size, 1);
});

test("carregar uma nova execução cancela a anterior", () => {
  const scheduler = createScheduler();
  const player = createComparisonPlayer({
    onChange() {},
    scheduler
  });

  player.load({
    bruteForce: steps([["a", "b"]]),
    divideConquer: steps([["a", "b"]])
  });
  player.togglePlay();
  player.load({
    bruteForce: steps([["c", "d"]]),
    divideConquer: steps([["c", "d"]])
  });

  assert.equal(scheduler.timers.size, 0);
});
