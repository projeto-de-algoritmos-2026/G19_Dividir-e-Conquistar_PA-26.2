export function drawArena(
  canvas,
  characters,
  {
    closestPair = null,
    encounterPair = null,
    encounterLimit = 0,
    draggedId = null
  } = {}
) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Não foi possível inicializar o Canvas 2D.");
  }

  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  drawGrid(context, width, height);

  const positions = new Map(
    characters.map(character => [character.id, character])
  );
  const pair = encounterPair ?? closestPair;

  if (pair) {
    const first = positions.get(pair[0]);
    const second = positions.get(pair[1]);

    if (first && second) {
      context.beginPath();
      context.moveTo(first.x, first.y);
      context.lineTo(second.x, second.y);
      context.strokeStyle = encounterPair ? "#34d399" : "#f97316";
      context.lineWidth = encounterPair ? 3 : 2;
      context.setLineDash(encounterPair ? [] : [7, 5]);
      context.stroke();
      context.setLineDash([]);

      if (encounterPair) {
        context.beginPath();
        context.arc(first.x, first.y, encounterLimit, 0, Math.PI * 2);
        context.strokeStyle = "rgba(52, 211, 153, 0.24)";
        context.lineWidth = 1;
        context.stroke();
      }
    }
  }

  for (const character of characters) {
    const isInPair = pair?.includes(character.id);

    context.beginPath();
    context.arc(
      character.x,
      character.y,
      character.radius,
      0,
      Math.PI * 2
    );
    context.fillStyle = character.color;
    context.fill();
    context.lineWidth = character.id === draggedId
      ? 3
      : isInPair
        ? 2
        : 1;
    context.strokeStyle = character.id === draggedId
      ? "#ffffff"
      : isInPair
        ? "#f8fafc"
        : "rgba(15, 23, 42, 0.8)";
    context.stroke();

    context.font = "12px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = "#e2e8f0";
    context.fillText(character.name, character.x, character.y + character.radius + 4);
  }
}

function drawGrid(context, width, height) {
  context.save();
  context.strokeStyle = "rgba(148, 163, 184, 0.08)";
  context.lineWidth = 1;

  for (let x = 40; x < width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 40; y < height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();
}
