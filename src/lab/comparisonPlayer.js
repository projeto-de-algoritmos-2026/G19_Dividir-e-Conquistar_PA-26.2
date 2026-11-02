function createDefaultScheduler() {
  return {
    setInterval: (callback, delay) => setInterval(callback, delay),
    clearInterval: timer => clearInterval(timer)
  };
}

function copyPair(pair) {
  return pair === null ? null : [...pair];
}

function createAlgorithmState(steps) {
  return {
    steps: steps.slice(),
    cursor: 0,
    compareCount: 0,
    currentPair: null,
    result: null,
    status: "ready"
  };
}

function consumeUntilComparisonOrFinish(state) {
  while (state.cursor < state.steps.length) {
    const step = state.steps[state.cursor++];

    if (step.type === "compare") {
      state.compareCount++;
      state.currentPair = copyPair(step.pair);
      return "compare";
    }

    if (step.type === "finish") {
      state.currentPair = null;
      state.result = {
        pair: copyPair(step.pair),
        distanceSquared: step.distanceSquared
      };
      state.status = "completed";
      return "finish";
    }
  }

  state.currentPair = null;
  state.status = "completed";
  return "finish";
}

function snapshotAlgorithm(state) {
  return {
    compareCount: state.compareCount,
    currentPair: copyPair(state.currentPair),
    result: state.result === null
      ? null
      : {
          pair: copyPair(state.result.pair),
          distanceSquared: state.result.distanceSquared
        },
    status: state.status
  };
}

export function createComparisonPlayer({
  onChange,
  intervalMs = 700,
  scheduler = createDefaultScheduler()
}) {
  if (typeof onChange !== "function") {
    throw new TypeError("onChange deve ser uma função.");
  }

  let algorithms = {
    bruteForce: createAlgorithmState([]),
    divideConquer: createAlgorithmState([])
  };
  let timer = null;
  let currentIntervalMs = intervalMs;

  function isComplete() {
    return (
      algorithms.bruteForce.status === "completed" &&
      algorithms.divideConquer.status === "completed"
    );
  }

  function notify() {
    onChange({
      bruteForce: snapshotAlgorithm(algorithms.bruteForce),
      divideConquer: snapshotAlgorithm(algorithms.divideConquer),
      playing: timer !== null
    });
  }

  function pause() {
    if (timer !== null) {
      scheduler.clearInterval(timer);
      timer = null;
    }

    for (const state of Object.values(algorithms)) {
      if (state.status === "running") {
        state.status = "paused";
      }
    }
  }

  function advance() {
    if (isComplete()) {
      return;
    }

    for (const state of Object.values(algorithms)) {
      if (state.status !== "completed") {
        state.status = "running";
        consumeUntilComparisonOrFinish(state);
      }
    }

    if (isComplete()) {
      pause();
    }

    notify();
  }

  function startTimer() {
    if (timer !== null || isComplete()) {
      return;
    }

    for (const state of Object.values(algorithms)) {
      if (state.status !== "completed") {
        state.status = "running";
      }
    }

    timer = scheduler.setInterval(advance, currentIntervalMs);
    notify();
  }

  function load({
    bruteForce = [],
    divideConquer = [],
    results = {}
  } = {}) {
    pause();
    algorithms = {
      bruteForce: createAlgorithmState(bruteForce),
      divideConquer: createAlgorithmState(divideConquer)
    };

    if (results.bruteForce || results.divideConquer) {
      for (const [name, result] of Object.entries(results)) {
        if (algorithms[name] && result) {
          algorithms[name].result = {
            pair: copyPair(result.pair),
            distanceSquared: result.distanceSquared
          };
        }
      }
    }

    notify();
  }

  function reset() {
    pause();
    for (const state of Object.values(algorithms)) {
      state.cursor = 0;
      state.compareCount = 0;
      state.currentPair = null;
      state.result = null;
      state.status = "ready";
    }
    notify();
  }

  function togglePlay() {
    if (timer !== null) {
      pause();
      notify();
      return;
    }

    startTimer();
  }

  function setSpeed(nextIntervalMs) {
    if (!Number.isFinite(nextIntervalMs) || nextIntervalMs < 1) {
      throw new RangeError("A velocidade deve ser um intervalo positivo.");
    }

    currentIntervalMs = nextIntervalMs;

    if (timer !== null) {
      pause();
      startTimer();
    }
  }

  function destroy() {
    pause();
    algorithms = {
      bruteForce: createAlgorithmState([]),
      divideConquer: createAlgorithmState([])
    };
  }

  return {
    load,
    reset,
    advance,
    togglePlay,
    pause,
    setSpeed,
    destroy
  };
}
