export function createStepPlayer({
  onChange,
  intervalMs = 700
}) {
  let steps = [];
  let index = -1;
  let timer = null;

  function notify() {
    onChange({
      step: steps[index] ?? null,
      index,
      total: steps.length,
      playing: timer !== null
    });
  }

  function pause() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function load(nextSteps) {
    pause();
    steps = nextSteps.slice();
    index = steps.length > 0 ? 0 : -1;
    notify();
  }

  function next() {
    pause();

    if (index < steps.length - 1) {
      index++;
    }

    notify();
  }

  function previous() {
    pause();

    if (index > 0) {
      index--;
    }

    notify();
  }

  function reset() {
    pause();
    index = steps.length > 0 ? 0 : -1;
    notify();
  }

  function togglePlay() {
    if (timer !== null) {
      pause();
      notify();
      return;
    }

    if (steps.length === 0) {
      return;
    }

    // Reproduzir no fim começa novamente.
    if (index === steps.length - 1) {
      index = 0;
    }

    if (steps.length === 1) {
      notify();
      return;
    }

    timer = setInterval(() => {
      index++;

      if (index >= steps.length - 1) {
        index = steps.length - 1;
        pause();
      }

      notify();
    }, intervalMs);

    notify();
  }

  function destroy() {
    pause();
    steps = [];
    index = -1;
  }

  return {
    load,
    next,
    previous,
    reset,
    togglePlay,
    destroy
  };
}