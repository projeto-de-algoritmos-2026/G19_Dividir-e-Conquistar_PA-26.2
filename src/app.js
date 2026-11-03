import {
  findClosestPairBruteForce
} from "./algorithms/bruteForceClosestPair.js";
import {
  findClosestPairDivideConquer
} from "./algorithms/closestPair.js";
import {
  drawArena
} from "./arena-ui/renderer.js";
import {
  createCharacters,
  projectCharacters
} from "./simulation/characters.js";
import {
  createEncounterTracker
} from "./simulation/encounters.js";
import {
  updateCharacters
} from "./simulation/movement.js";

const elements = {
  canvas: document.querySelector("#arena"),
  count: document.querySelector("#character-count"),
  seed: document.querySelector("#seed"),
  generate: document.querySelector("#generate"),
  add: document.querySelector("#add-character"),
  startPause: document.querySelector("#start-pause"),
  reset: document.querySelector("#reset"),
  speed: document.querySelector("#speed"),
  speedValue: document.querySelector("#speed-value"),
  encounterLimit: document.querySelector("#encounter-limit"),
  algorithm: document.querySelector("#algorithm"),
  openLab: document.querySelector("#open-lab"),
  status: document.querySelector("#status"),
  encounterStatus: document.querySelector("#encounter-status"),
  pair: document.querySelector("#pair"),
  distance: document.querySelector("#distance"),
  checks: document.querySelector("#checks"),
  characterTotal: document.querySelector("#character-total")
};

const required = Object.keys(elements);

if (required.some(name => !(elements[name] instanceof HTMLElement))) {
  throw new Error("A interface da arena não foi encontrada.");
}

if (
  !(elements.canvas instanceof HTMLCanvasElement) ||
  !(elements.count instanceof HTMLInputElement) ||
  !(elements.seed instanceof HTMLInputElement) ||
  !(elements.speed instanceof HTMLInputElement) ||
  !(elements.encounterLimit instanceof HTMLInputElement) ||
  !(elements.algorithm instanceof HTMLSelectElement)
) {
  throw new Error("Os controles da arena são inválidos.");
}

const canvasSize = {
  width: elements.canvas.width,
  height: elements.canvas.height
};
const encounterTracker = createEncounterTracker();
let characters = [];
let initialCharacters = [];
let currentResult = null;
let nextSeed = 123456789;
let animationFrame = null;
let previousFrameTime = null;
let draggedCharacter = null;

function copyCharacters(source) {
  return source.map(character => ({ ...character }));
}

function currentAlgorithm() {
  return elements.algorithm.value === "bruteForce"
    ? findClosestPairBruteForce
    : findClosestPairDivideConquer;
}

function refreshClosestPair() {
  currentResult = currentAlgorithm()(projectCharacters(characters));
  const events = encounterTracker.update(
    currentResult,
    Number(elements.encounterLimit.value)
  );

  if (events.length > 0) {
    elements.encounterStatus.textContent = events
      .map(event => event.type === "encounter-start"
        ? `Encontro iniciado: ${event.pair.join(" e ")}.`
        : `Encontro encerrado: ${event.pair.join(" e ")}.`)
      .join(" ");
  }

  updateResults();
  render();
}

function updateResults() {
  const pair = currentResult?.pair ?? null;
  elements.pair.textContent = pair ? pair.join(" e ") : "—";
  elements.distance.textContent = currentResult?.distance === null ||
      currentResult?.distance === undefined
    ? "—"
    : `${currentResult.distance.toFixed(2)} px`;
  elements.checks.textContent = String(
    currentResult?.metrics.distanceChecks ?? 0
  );
  elements.characterTotal.textContent = String(characters.length);
}

function render() {
  drawArena(elements.canvas, characters, {
    closestPair: currentResult?.pair ?? null,
    encounterPair: encounterTracker.activePair,
    encounterLimit: Number(elements.encounterLimit.value),
    draggedId: draggedCharacter?.id ?? null
  });
}

function stopSimulation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
  }

  animationFrame = null;
  previousFrameTime = null;
  elements.startPause.textContent = "Iniciar";
  elements.status.textContent = "Simulação pausada.";
}

function animate(timestamp) {
  if (previousFrameTime !== null) {
    const deltaTime = (timestamp - previousFrameTime) / 1000;
    const speed = Number(elements.speed.value);

    updateCharacters(characters, deltaTime * speed, canvasSize);
    refreshClosestPair();
  }

  previousFrameTime = timestamp;
  animationFrame = requestAnimationFrame(animate);
}

function startSimulation() {
  if (animationFrame !== null) {
    stopSimulation();
    return;
  }

  elements.startPause.textContent = "Pausar";
  elements.status.textContent = "Simulação em andamento.";
  previousFrameTime = null;
  animationFrame = requestAnimationFrame(animate);
}

function generateArena() {
  const quantity = Number(elements.count.value);
  const seed = Number(elements.seed.value);

  try {
    characters = createCharacters(quantity, {
      ...canvasSize,
      seed
    });
    initialCharacters = copyCharacters(characters);
    nextSeed = (seed + 1) >>> 0;
    encounterTracker.reset();
    elements.encounterStatus.textContent = "Nenhum encontro ativo.";
    refreshClosestPair();
    elements.status.textContent =
      `${characters.length} personagens gerados (semente ${seed >>> 0}).`;
  } catch (error) {
    elements.status.textContent = `Erro: ${error.message}`;
  }
}

function resetArena() {
  stopSimulation();
  characters = copyCharacters(initialCharacters);
  encounterTracker.reset();
  elements.encounterStatus.textContent = "Arena reiniciada. Nenhum encontro ativo.";
  refreshClosestPair();
}

function addCharacter() {
  if (animationFrame !== null) {
    elements.status.textContent =
      "Pause a simulação antes de adicionar um personagem.";
    return;
  }

  if (characters.length >= 500) {
    elements.status.textContent =
      "A arena aceita no máximo 500 personagens.";
    return;
  }

  const additions = createCharacters(1, {
    ...canvasSize,
    seed: nextSeed,
    firstIndex: characters.length
  });
  nextSeed = (nextSeed + 1) >>> 0;
  characters.push(additions[0]);
  refreshClosestPair();
  elements.status.textContent =
    `${additions[0].name} foi adicionado. Arraste-o para ajustar a posição.`;
}

function canvasPoint(event) {
  const bounds = elements.canvas.getBoundingClientRect();

  return {
    x: (event.clientX - bounds.left) * elements.canvas.width / bounds.width,
    y: (event.clientY - bounds.top) * elements.canvas.height / bounds.height
  };
}

function onPointerDown(event) {
  if (animationFrame !== null) {
    return;
  }

  const point = canvasPoint(event);
  draggedCharacter = [...characters].reverse().find(character =>
    Math.hypot(character.x - point.x, character.y - point.y) <=
      character.radius + 6
  ) ?? null;

  if (draggedCharacter) {
    elements.canvas.setPointerCapture(event.pointerId);
    render();
  }
}

function onPointerMove(event) {
  if (!draggedCharacter || animationFrame !== null) {
    return;
  }

  const point = canvasPoint(event);
  const radius = draggedCharacter.radius;
  draggedCharacter.x = Math.min(
    canvasSize.width - radius,
    Math.max(radius, point.x)
  );
  draggedCharacter.y = Math.min(
    canvasSize.height - radius,
    Math.max(radius, point.y)
  );
  refreshClosestPair();
}

function onPointerUp() {
  if (draggedCharacter) {
    draggedCharacter = null;
    render();
  }
}

function openLaboratory() {
  stopSimulation();

  try {
    const snapshot = projectCharacters(characters);
    sessionStorage.setItem("arena-lab-snapshot", JSON.stringify(snapshot));
    window.location.assign("./algorithm-lab.html?source=arena");
  } catch (error) {
    elements.status.textContent =
      `Não foi possível abrir o laboratório: ${error.message}`;
  }
}

elements.generate.addEventListener("click", generateArena);
elements.add.addEventListener("click", addCharacter);
elements.startPause.addEventListener("click", startSimulation);
elements.reset.addEventListener("click", resetArena);
elements.speed.addEventListener("input", () => {
  elements.speedValue.textContent = `${Number(elements.speed.value).toFixed(2)}×`;
});
elements.encounterLimit.addEventListener("input", refreshClosestPair);
elements.algorithm.addEventListener("change", refreshClosestPair);
elements.openLab.addEventListener("click", openLaboratory);
elements.canvas.addEventListener("pointerdown", onPointerDown);
elements.canvas.addEventListener("pointermove", onPointerMove);
elements.canvas.addEventListener("pointerup", onPointerUp);
elements.canvas.addEventListener("pointercancel", onPointerUp);

window.addEventListener("beforeunload", stopSimulation);

generateArena();
elements.speedValue.textContent = `${Number(elements.speed.value).toFixed(2)}×`;
