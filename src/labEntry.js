import {
  findClosestPairDivideConquer
} from "./algorithms/closestPair.js";
import {
  findClosestPairBruteForce
} from "./algorithms/bruteForceClosestPair.js";
import {
  getScenario,
  generateRandomPoints
} from "./lab/fixtures.js";
import {
  drawAlgorithmStep,
  drawLab,
  drawVisualComparison
} from "./lab/labRenderer.js";
import { createStepPlayer } from "./lab/stepPlayer.js";
import { createComparisonPlayer } from "./lab/comparisonPlayer.js";
import { runBenchmark } from "./lab/benchmark.js";
import {
  findClosestPairReference
} from "./lab/referenceClosestPair.js";

const elements = {
  canvas: document.querySelector("#arena"),
  scenario: document.querySelector("#scenario"),
  run: document.querySelector("#run"),
  stepReset: document.querySelector("#step-reset"),
  stepBack: document.querySelector("#step-back"),
  stepNext: document.querySelector("#step-next"),
  stepPlay: document.querySelector("#step-play"),
  stepCounter: document.querySelector("#step-counter"),
  stepDescription: document.querySelector("#step-description"),
  status: document.querySelector("#status"),
  pair: document.querySelector("#pair"),
  distance: document.querySelector("#distance"),
  checks: document.querySelector("#checks"),
  depth: document.querySelector("#depth"),
  pointCount: document.querySelector("#point-count"),
  generate: document.querySelector("#generate"),
  benchmark: document.querySelector("#benchmark"),
  benchmarkStatus: document.querySelector("#benchmark-status"),
  bfDistance: document.querySelector("#bf-distance"),
  bfAlgorithmLabel: document.querySelector("#bf-algorithm-label"),
  bfChecks: document.querySelector("#bf-checks"),
  bfTime: document.querySelector("#bf-time"),
  dcDistance: document.querySelector("#dc-distance"),
  dcChecks: document.querySelector("#dc-checks"),
  dcTime: document.querySelector("#dc-time"),
  visualCompare: document.querySelector("#visual-compare"),
  comparisonReset: document.querySelector("#comparison-reset"),
  comparisonPlay: document.querySelector("#comparison-play"),
  comparisonSpeed: document.querySelector("#comparison-speed"),
  comparisonStatus: document.querySelector("#comparison-status"),
  visualBfChecks: document.querySelector("#visual-bf-checks"),
  visualBfCurrent: document.querySelector("#visual-bf-current"),
  visualBfState: document.querySelector("#visual-bf-state"),
  visualBfResult: document.querySelector("#visual-bf-result"),
  visualDcChecks: document.querySelector("#visual-dc-checks"),
  visualDcCurrent: document.querySelector("#visual-dc-current"),
  visualDcState: document.querySelector("#visual-dc-state"),
  visualDcResult: document.querySelector("#visual-dc-result")
};

const requiredElements = [
  "canvas", "scenario", "run", "stepReset", "stepBack", "stepNext",
  "stepPlay", "stepCounter", "stepDescription", "status", "pair",
  "distance", "checks", "depth", "pointCount", "generate", "benchmark",
  "benchmarkStatus", "bfDistance", "bfAlgorithmLabel", "bfChecks", "bfTime", "dcDistance",
  "dcChecks", "dcTime", "visualCompare", "comparisonReset",
  "comparisonPlay", "comparisonSpeed", "comparisonStatus",
  "visualBfChecks", "visualBfCurrent", "visualBfState", "visualBfResult",
  "visualDcChecks", "visualDcCurrent", "visualDcState", "visualDcResult"
];

if (requiredElements.some(name => !(elements[name] instanceof HTMLElement))) {
  throw new Error("A interface do laboratório não foi encontrada.");
}

if (
  !(elements.canvas instanceof HTMLCanvasElement) ||
  !(elements.scenario instanceof HTMLSelectElement) ||
  !(elements.pointCount instanceof HTMLInputElement) ||
  !(elements.comparisonSpeed instanceof HTMLSelectElement)
) {
  throw new Error("Os controles do laboratório são inválidos.");
}

const comparisonLimit = 30;
function loadArenaSnapshot() {
  if (new URLSearchParams(window.location.search).get("source") !== "arena") {
    return null;
  }

  const serialized = sessionStorage.getItem("arena-lab-snapshot");

  if (serialized === null) {
    throw new Error("O snapshot enviado pela arena não foi encontrado.");
  }

  const snapshot = JSON.parse(serialized);

  if (!Array.isArray(snapshot)) {
    throw new TypeError("O snapshot da arena é inválido.");
  }

  const ids = new Set();

  for (const point of snapshot) {
    if (
      point === null ||
      typeof point !== "object" ||
      typeof point.id !== "string" ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y) ||
      ids.has(point.id)
    ) {
      throw new TypeError("O snapshot contém pontos inválidos.");
    }

    ids.add(point.id);
  }

  sessionStorage.removeItem("arena-lab-snapshot");
  return snapshot.map(point => ({ ...point }));
}

const arenaSnapshot = loadArenaSnapshot();
const bruteForceAlgorithm = arenaSnapshot
  ? findClosestPairBruteForce
  : findClosestPairReference;
elements.bfAlgorithmLabel.textContent = arenaSnapshot
  ? "Força bruta — algoritmo oficial"
  : "Força bruta — referência local";
let points = arenaSnapshot ?? getScenario(elements.scenario.value);
let generationSeed = 123456789;
let result = null;
let comparisonResults = null;

const didacticPlayer = createStepPlayer({
  onChange: updateDidacticView
});

const comparisonPlayer = createComparisonPlayer({
  onChange: updateComparisonView,
  intervalMs: Number(elements.comparisonSpeed.value)
});

function copyPoints(source) {
  return source.map(point => ({ ...point }));
}

function formatPair(pair) {
  return pair ? pair.join(" e ") : "—";
}

function formatDistance(distance) {
  return distance === null
    ? "—"
    : `${distance.toFixed(4)} px`;
}

function describeStep(step) {
  if (!step) {
    return "Execute o algoritmo para visualizar suas etapas.";
  }

  switch (step.type) {
    case "start":
      return "Pontos carregados. O algoritmo começa a procurar o par mais próximo.";
    case "divide":
      return "Dividindo os pontos em duas metades.";
    case "compare":
      return `Comparando o par ${step.pair.join(" e ")}.`;
    case "best":
      return `Novo melhor par: ${step.pair.join(" e ")}.`;
    case "strip":
      return "Verificando a faixa central entre as duas metades.";
    case "finish":
      return "Execução concluída.";
    default:
      return "Etapa do algoritmo.";
  }
}

function updateDidacticView({
  step,
  index,
  total,
  playing
}) {
  drawAlgorithmStep(elements.canvas, points, step);

  const hasSteps = total > 0;
  elements.stepReset.disabled = !hasSteps;
  elements.stepBack.disabled = !hasSteps || index <= 0;
  elements.stepNext.disabled = !hasSteps || index >= total - 1;
  elements.stepPlay.disabled = !hasSteps;
  elements.stepPlay.textContent = playing ? "Pausar" : "Reproduzir";
  elements.stepCounter.textContent = hasSteps
    ? `Etapa ${index + 1} de ${total}`
    : "Sem execução";
  elements.stepDescription.textContent = describeStep(step);
}

function updateResults() {
  if (!result) {
    elements.pair.textContent = "—";
    elements.distance.textContent = "—";
    elements.checks.textContent = "—";
    elements.depth.textContent = "—";
    return;
  }

  elements.pair.textContent = formatPair(result.pair);
  elements.distance.textContent = result.distance?.toFixed(2) ?? "—";
  elements.checks.textContent = String(result.metrics.distanceChecks);
  elements.depth.textContent = String(result.metrics.maxDepth);
}

function clearBenchmark() {
  elements.bfDistance.textContent = "—";
  elements.bfChecks.textContent = "—";
  elements.bfTime.textContent = "—";
  elements.dcDistance.textContent = "—";
  elements.dcChecks.textContent = "—";
  elements.dcTime.textContent = "—";
  elements.benchmarkStatus.textContent =
    "Execute a comparação para consultar os resultados.";
}

function clearComparison() {
  comparisonResults = null;
  comparisonPlayer.load();
  elements.comparisonStatus.textContent =
    "Clique em “Comparação visual” para preparar a animação.";
}

function loadScenario() {
  points = getScenario(elements.scenario.value);
  result = null;
  didacticPlayer.load([]);
  clearComparison();
  clearBenchmark();
  drawLab(elements.canvas, points);
  elements.status.textContent =
    "Cenário carregado. Clique em Executar algoritmo.";
}

function runAlgorithm() {
  clearComparison();
  result = findClosestPairDivideConquer(points, {
    recordSteps: true
  });
  didacticPlayer.load(result.steps);
  updateResults();
  elements.status.textContent = "Algoritmo concluído.";
}

function generatePoints() {
  try {
    const quantity = Number(elements.pointCount.value);
    generationSeed = (generationSeed + 1) >>> 0;
    points = generateRandomPoints(quantity, {
      width: elements.canvas.width,
      height: elements.canvas.height,
      seed: generationSeed
    });
    result = null;
    didacticPlayer.load([]);
    clearComparison();
    clearBenchmark();
    drawLab(elements.canvas, points);
    elements.status.textContent =
      `${points.length} pontos gerados. Semente: ${generationSeed}.`;
  } catch (error) {
    elements.status.textContent = `Erro: ${error.message}`;
  }
}

function startComparison() {
  clearComparison();

  if (points.length > comparisonLimit) {
    elements.comparisonStatus.textContent =
      `A comparação visual aceita no máximo ${comparisonLimit} pontos. ` +
      `Reduza a quantidade ou use um cenário estático.`;
    return;
  }
  didacticPlayer.load([]);
  didacticPlayer.load([]);

  const snapshot = copyPoints(points);
  comparisonResults = {
    bruteForce: bruteForceAlgorithm(snapshot, {
      recordSteps: true
    }),
    divideConquer: findClosestPairDivideConquer(snapshot, {
      recordSteps: true
    })
  };

  comparisonPlayer.load({
    bruteForce: comparisonResults.bruteForce.steps,
    divideConquer: comparisonResults.divideConquer.steps
  });
  elements.comparisonStatus.textContent =
    "Comparação preparada. Clique em Reproduzir.";
}

function stateLabel(state) {
  const labels = {
    ready: "Pronto",
    running: "Executando",
    paused: "Pausado",
    completed: "Concluído"
  };
  return labels[state] ?? state;
}

function updateVisualAlgorithm(prefix, state, resultData) {
  elements[`${prefix}Checks`].textContent = String(state.compareCount);
  elements[`${prefix}Current`].textContent = formatPair(state.currentPair);
  elements[`${prefix}State`].textContent = stateLabel(state.status);

  const result = state.result ??
    (state.status === "completed" ? resultData : null);
  const distance = result
    ? result.distance ??
      (result.distanceSquared === null
        ? null
        : Math.sqrt(result.distanceSquared))
    : null;
  elements[`${prefix}Result`].textContent = result
    ? `${formatPair(result.pair)} — ${formatDistance(distance)}`
    : "—";
}

function updateComparisonView(snapshot) {
  const brute = snapshot.bruteForce;
  const divide = snapshot.divideConquer;
  const finalPair = (
    brute.status === "completed" &&
    divide.status === "completed"
  )
    ? divide.result?.pair
    : null;

  drawVisualComparison(elements.canvas, points, {
    bruteForcePair: brute.currentPair,
    divideConquerPair: divide.currentPair,
    finalPair
  });

  updateVisualAlgorithm(
    "visualBf",
    brute,
    comparisonResults?.bruteForce
  );
  updateVisualAlgorithm(
    "visualDc",
    divide,
    comparisonResults?.divideConquer
  );

  elements.comparisonPlay.disabled = (
    brute.status === "ready" &&
    divide.status === "ready" &&
    !comparisonResults
  );
  elements.comparisonPlay.textContent = snapshot.playing
    ? "Pausar"
    : "Reproduzir";

  if (brute.status === "completed" && divide.status === "completed") {
    elements.comparisonStatus.textContent = "Comparação concluída.";
  } else if (snapshot.playing) {
    elements.comparisonStatus.textContent = "Comparação em execução.";
  } else if (brute.status === "paused" || divide.status === "paused") {
    elements.comparisonStatus.textContent = "Comparação pausada.";
  }
}

function compareAlgorithms() {
  didacticPlayer.load([]);
  clearComparison();
  clearBenchmark();
  elements.benchmark.disabled = true;

  try {
    const report = runBenchmark(points, {
      algorithms: {
        bruteForce: bruteForceAlgorithm,
        divideConquer: findClosestPairDivideConquer
      },
      warmups: 3,
      repetitions: 15
    });

    elements.bfDistance.textContent = formatDistance(report.bruteForce.distance);
    elements.bfChecks.textContent = String(report.bruteForce.distanceChecks);
    elements.bfTime.textContent = `${report.bruteForce.medianMs.toFixed(4)} ms`;
    elements.dcDistance.textContent = formatDistance(report.divideConquer.distance);
    elements.dcChecks.textContent = String(report.divideConquer.distanceChecks);
    elements.dcTime.textContent = `${report.divideConquer.medianMs.toFixed(4)} ms`;
    elements.benchmarkStatus.textContent =
      `Distâncias conferidas em ${report.pointCount} pontos. ` +
      `${report.warmups} aquecimentos e ${report.repetitions} medições por algoritmo.`;
    drawLab(elements.canvas, points, report.divideConquer);
    elements.status.textContent =
      "Comparação concluída. Par final destacado; consulte a tabela.";
  } catch (error) {
    elements.benchmarkStatus.textContent = `Erro: ${error.message}`;
    console.error(error);
  } finally {
    elements.benchmark.disabled = false;
  }
}

elements.scenario.addEventListener("change", loadScenario);
elements.run.addEventListener("click", runAlgorithm);
elements.stepReset.addEventListener("click", () => didacticPlayer.reset());
elements.stepBack.addEventListener("click", () => didacticPlayer.previous());
elements.stepNext.addEventListener("click", () => didacticPlayer.next());
elements.stepPlay.addEventListener("click", () => {
  comparisonPlayer.pause();
  didacticPlayer.togglePlay();
});
elements.generate.addEventListener("click", generatePoints);
elements.benchmark.addEventListener("click", compareAlgorithms);
elements.visualCompare.addEventListener("click", startComparison);
elements.comparisonReset.addEventListener("click", () => comparisonPlayer.reset());
elements.comparisonPlay.addEventListener("click", () => comparisonPlayer.togglePlay());
elements.comparisonSpeed.addEventListener("change", () => {
  comparisonPlayer.setSpeed(Number(elements.comparisonSpeed.value));
});

window.addEventListener("beforeunload", () => {
  didacticPlayer.destroy();
  comparisonPlayer.destroy();
});

if (arenaSnapshot) {
  drawLab(elements.canvas, points);
  elements.status.textContent =
    `Snapshot da arena carregado com ${points.length} personagens.`;
} else {
  loadScenario();
}
