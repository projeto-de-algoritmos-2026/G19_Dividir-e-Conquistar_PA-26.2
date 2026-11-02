export function drawLab(canvas, points, result = null) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Não foi possível obter o contexto 2D.");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid(ctx, canvas.width, canvas.height);

  const byId = new Map(
    points.map(point => [point.id, point])
  );

  const selectedIds = new Set(result?.pair ?? []);

  if (result?.pair) {
    const a = byId.get(result.pair[0]);
    const b = byId.get(result.pair[1]);

    if (a && b) {
      drawConnection(ctx, a, b);
    }
  }

  for (const point of points) {
    drawPoint(ctx, point, selectedIds.has(point.id));
  }

  drawLabels(ctx, points);
}

export function drawVisualComparison(
  canvas,
  points,
  {
    bruteForcePair = null,
    divideConquerPair = null,
    finalPair = null
  } = {}
) {
  drawLab(canvas, points, finalPair ? { pair: finalPair } : null);

  const ctx = canvas.getContext("2d");
  const byId = new Map(points.map(point => [point.id, point]));

  drawComparisonLine(ctx, byId, bruteForcePair, "#f97316", 5);
  drawComparisonLine(ctx, byId, divideConquerPair, "#38bdf8", 2);
}

function drawComparisonLine(ctx, byId, pair, color, lineWidth) {
  if (!pair) {
    return;
  }

  const a = byId.get(pair[0]);
  const b = byId.get(pair[1]);

  if (!a || !b) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx, width, height) {
  const spacing = 50;

  ctx.save();
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;

  ctx.beginPath();

  for (let x = spacing; x < width; x += spacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = spacing; y < height; y += spacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();
  ctx.restore();
}

function drawConnection(ctx, a, b) {
  ctx.save();

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  ctx.restore();
}

function drawPoint(ctx, point, selected) {
  ctx.save();

  if (selected) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = "#86efac";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(point.x, point.y, 9, 0, Math.PI * 2);
  ctx.fillStyle = selected ? "#22c55e" : "#818cf8";
  ctx.fill();

  ctx.restore();
}

function drawLabels(ctx, points) {
  const groups = new Map();

  for (const point of points) {
    const key = JSON.stringify([point.x, point.y]);

    if (!groups.has(key)) {
      groups.set(key, {
        x: point.x,
        y: point.y,
        ids: []
      });
    }

    groups.get(key).ids.push(point.id);
  }

  ctx.save();
  ctx.font = "15px Arial";
  ctx.fillStyle = "#f8fafc";

  for (const group of groups.values()) {
    ctx.fillText(
      group.ids.join(" / "),
      group.x + 18,
      group.y - 15
    );
  }

  ctx.restore();
}

export function drawAlgorithmStep(canvas, points, step) {
  const highlightedPair = (
    step?.type === "compare" ||
    step?.type === "finish"
  )
    ? step.pair
    : null;

  drawLab(
    canvas,
    points,
    highlightedPair ? { pair: highlightedPair } : null
  );

  if (!step) {
    return;
  }

  const ctx = canvas.getContext("2d");

  ctx.save();

  if (step.type === "divide") {
    highlightGroup(ctx, points, step.leftIds, "#38bdf8");
    highlightGroup(ctx, points, step.rightIds, "#fbbf24");

    drawDivisionLine(ctx, canvas.height, step.lineX);
  }

  if (step.type === "strip") {
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";

    ctx.fillRect(
      step.lineX - step.delta,
      0,
      step.delta * 2,
      canvas.height
    );

    highlightGroup(ctx, points, step.pointIds, "#38bdf8");

    drawDivisionLine(ctx, canvas.height, step.lineX);
  }

  ctx.restore();
}

function highlightGroup(ctx, points, ids, color) {
  const selected = new Set(ids);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  for (const point of points) {
    if (!selected.has(point.id)) {
      continue;
    }

    ctx.beginPath();
    ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDivisionLine(ctx, height, lineX) {
  ctx.save();

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);

  ctx.beginPath();
  ctx.moveTo(lineX, 0);
  ctx.lineTo(lineX, height);
  ctx.stroke();

  ctx.restore();
}