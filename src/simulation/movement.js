export function updateCharacters(
  characters,
  deltaTime,
  { width, height } = {}
) {
  if (!Array.isArray(characters)) {
    throw new TypeError("characters deve ser um array.");
  }

  if (!Number.isFinite(deltaTime) || deltaTime < 0) {
    throw new RangeError("deltaTime deve ser um número não negativo.");
  }

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new RangeError("Dimensões da arena inválidas.");
  }

  for (const character of characters) {
    if (
      !character ||
      !Number.isFinite(character.x) ||
      !Number.isFinite(character.y) ||
      !Number.isFinite(character.vx) ||
      !Number.isFinite(character.vy) ||
      !Number.isFinite(character.radius) ||
      character.radius < 0 ||
      width < character.radius * 2 ||
      height < character.radius * 2
    ) {
      throw new TypeError("Personagem ou limites inválidos.");
    }

    const horizontal = advanceAxis(
      character.x,
      character.vx,
      character.radius,
      width - character.radius,
      deltaTime
    );
    const vertical = advanceAxis(
      character.y,
      character.vy,
      character.radius,
      height - character.radius,
      deltaTime
    );

    character.x = horizontal.position;
    character.vx = horizontal.velocity;
    character.y = vertical.position;
    character.vy = vertical.velocity;
  }

  return characters;
}

function advanceAxis(position, velocity, minimum, maximum, deltaTime) {
  const range = maximum - minimum;

  if (range === 0) {
    return { position: minimum, velocity: 0 };
  }

  if (velocity === 0) {
    return { position, velocity };
  }

  const period = range * 2;
  const offset = position - minimum;
  const phaseAtStart = velocity > 0
    ? offset
    : period - offset;
  const phase = modulo(
    phaseAtStart + Math.abs(velocity) * deltaTime,
    period
  );

  if (phase < range) {
    return {
      position: minimum + phase,
      velocity: Math.abs(velocity)
    };
  }

  return {
    position: minimum + period - phase,
    velocity: -Math.abs(velocity)
  };
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
