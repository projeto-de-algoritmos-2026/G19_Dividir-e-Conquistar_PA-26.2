const scenarios = {
  cross: [
    { id: "A", x: 100, y: 120 },
    { id: "B", x: 380, y: 300 },
    { id: "C", x: 410, y: 300 },
    { id: "D", x: 700, y: 120 }
  ],

  vertical: [
    { id: "A", x: 400, y: 70 },
    { id: "B", x: 400, y: 200 },
    { id: "C", x: 400, y: 230 },
    { id: "D", x: 400, y: 360 },
    { id: "E", x: 400, y: 450 }
  ],

  duplicate: [
    { id: "A", x: 180, y: 140 },
    { id: "B", x: 400, y: 260 },
    { id: "C", x: 400, y: 260 },
    { id: "D", x: 650, y: 380 }
  ]
};

export function getScenario(name) {
  const points = scenarios[name];

  if (!points) {
    throw new Error(`Cenário desconhecido: ${name}`);
  }

  // Cada chamada entrega novos objetos.
  return points.map(point => ({ ...point }));
}

export function generateRandomPoints(
  quantity,
  {
    width = 800,
    height = 500,
    padding = 40,
    seed = 123456789
  } = {}
) {
  if (!Number.isInteger(quantity) || quantity < 2 || quantity > 500) {
    throw new RangeError(
      "A quantidade deve ser um inteiro entre 2 e 500."
    );
  }

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(padding) ||
    padding < 0 ||
    width <= padding * 2 ||
    height <= padding * 2
  ) {
    throw new RangeError("Dimensões ou margem inválidas.");
  }

  let state = seed >>> 0;

  function random() {
    state = (
      Math.imul(1664525, state) + 1013904223
    ) >>> 0;

    return state / 4294967296;
  }

  return Array.from({ length: quantity }, (_, index) => ({
    id: `P${index + 1}`,
    x: padding + random() * (width - padding * 2),
    y: padding + random() * (height - padding * 2)
  }));
}