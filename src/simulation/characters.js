const COLORS = [
  "#818cf8",
  "#38bdf8",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#fb7185",
  "#a78bfa",
  "#2dd4bf"
];

export function createCharacters(
  quantity,
  {
    width = 800,
    height = 500,
    radius = 9,
    seed = 123456789,
    firstIndex = 0
  } = {}
) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 500) {
    throw new RangeError(
      "A quantidade deve ser um inteiro entre 0 e 500."
    );
  }

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(radius) ||
    width <= radius * 2 ||
    height <= radius * 2 ||
    radius < 0
  ) {
    throw new RangeError("Dimensões ou raio inválidos.");
  }

  if (!Number.isInteger(firstIndex) || firstIndex < 0) {
    throw new RangeError("firstIndex deve ser um inteiro não negativo.");
  }

  if (!Number.isFinite(seed)) {
    throw new TypeError("seed deve ser um número finito.");
  }

  let state = seed >>> 0;

  function random() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  }

  return Array.from({ length: quantity }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const speed = 25 + random() * 45;
    const number = firstIndex + index + 1;

    return {
      id: `P${number}`,
      name: `Personagem ${number}`,
      color: COLORS[(number - 1) % COLORS.length],
      x: radius + random() * (width - radius * 2),
      y: radius + random() * (height - radius * 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius
    };
  });
}

export function projectCharacters(characters) {
  if (!Array.isArray(characters)) {
    throw new TypeError("characters deve ser um array.");
  }

  return characters.map(({ id, x, y }) => ({ id, x, y }));
}
