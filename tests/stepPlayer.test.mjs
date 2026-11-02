import test from "node:test";
import assert from "node:assert/strict";

import {
  createStepPlayer
} from "../src/lab/stepPlayer.js";

function createSteps() {
  return [
    {
      type: "start",
      pointIds: ["a", "b"],
      depth: 0
    },
    {
      type: "compare",
      pair: ["a", "b"],
      distanceSquared: 25,
      depth: 0
    },
    {
      type: "finish",
      pair: ["a", "b"],
      distanceSquared: 25,
      depth: 0
    }
  ];
}

function setupPlayer() {
  const notifications = [];

  const player = createStepPlayer({
    onChange(state) {
      notifications.push(state);
    }
  });

  return {
    player,
    notifications,
    latest() {
      return notifications.at(-1);
    }
  };
}

test("carrega os passos e seleciona o primeiro", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());

  assert.deepEqual(latest(), {
    step: createSteps()[0],
    index: 0,
    total: 3,
    playing: false
  });
});

test("avança para o próximo passo", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());
  player.next();

  assert.equal(latest().index, 1);
  assert.equal(latest().step.type, "compare");
});

test("não avança além do último passo", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());

  for (let i = 0; i < 10; i++) {
    player.next();
  }

  assert.equal(latest().index, 2);
  assert.equal(latest().step.type, "finish");
});

test("volta para o passo anterior", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());
  player.next();
  player.next();
  player.previous();

  assert.equal(latest().index, 1);
  assert.equal(latest().step.type, "compare");
});

test("não volta antes do primeiro passo", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());
  player.previous();
  player.previous();

  assert.equal(latest().index, 0);
  assert.equal(latest().step.type, "start");
});

test("reinicia a navegação no primeiro passo", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());
  player.next();
  player.next();
  player.reset();

  assert.equal(latest().index, 0);
  assert.equal(latest().playing, false);
});

test("carregar lista vazia limpa a execução", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());
  player.next();
  player.load([]);

  assert.deepEqual(latest(), {
    step: null,
    index: -1,
    total: 0,
    playing: false
  });
});

test("navegar sem passos mantém o estado vazio", () => {
  const { player, latest } = setupPlayer();

  player.load([]);
  player.next();
  player.previous();
  player.reset();

  assert.deepEqual(latest(), {
    step: null,
    index: -1,
    total: 0,
    playing: false
  });
});

test("carregar nova execução começa no primeiro passo", () => {
  const { player, latest } = setupPlayer();

  player.load(createSteps());
  player.next();
  player.next();

  const newSteps = [
    {
      type: "start",
      pointIds: [],
      depth: 0
    },
    {
      type: "finish",
      pair: null,
      distanceSquared: null,
      depth: 0
    }
  ];

  player.load(newSteps);

  assert.equal(latest().index, 0);
  assert.equal(latest().total, 2);
  assert.deepEqual(latest().step, newSteps[0]);
});

test("carregar passos copia o array recebido", () => {
  const { player, latest } = setupPlayer();
  const steps = createSteps();

  player.load(steps);

  // Alterar o array externo não deve remover passos do player.
  steps.length = 0;

  player.next();

  assert.equal(latest().total, 3);
  assert.equal(latest().step.type, "compare");
});

test("reprodução pode ser iniciada e pausada", () => {
  const { player, latest } = setupPlayer();

  try {
    player.load(createSteps());

    player.togglePlay();
    assert.equal(latest().playing, true);

    player.togglePlay();
    assert.equal(latest().playing, false);
  } finally {
    player.destroy();
  }
});

test("carregar outro cenário interrompe a reprodução", () => {
  const { player, latest } = setupPlayer();

  try {
    player.load(createSteps());
    player.togglePlay();

    assert.equal(latest().playing, true);

    player.load([]);

    assert.equal(latest().playing, false);
    assert.equal(latest().total, 0);
  } finally {
    player.destroy();
  }
});

test("avançar manualmente interrompe a reprodução", () => {
  const { player, latest } = setupPlayer();

  try {
    player.load(createSteps());
    player.togglePlay();
    player.next();

    assert.equal(latest().playing, false);
    assert.equal(latest().index, 1);
  } finally {
    player.destroy();
  }
});

test("reproduzir após o fim recomeça no primeiro passo", () => {
  const { player, latest } = setupPlayer();

  try {
    player.load(createSteps());
    player.next();
    player.next();

    assert.equal(latest().step.type, "finish");

    player.togglePlay();

    assert.equal(latest().index, 0);
    assert.equal(latest().playing, true);
  } finally {
    player.destroy();
  }
});