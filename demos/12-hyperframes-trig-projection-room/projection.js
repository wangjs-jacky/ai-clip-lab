export const TAU = Math.PI * 2;

const DEFAULT_CAMERA = Object.freeze({
  position: Object.freeze({ x: 8.6, y: 5.4, z: -12.8 }),
  target: Object.freeze({ x: 0, y: -0.2, z: 1.2 }),
  focal: 1180,
  center: Object.freeze({ x: 1120, y: 555 }),
});

const CENTERS = Object.freeze({
  circle: Object.freeze({ x: -4.55, y: 0.3, z: 0.65 }),
  back: Object.freeze({ x: 0, y: 0.35, z: 4.15 }),
  floor: Object.freeze({ x: 0, y: -2.55, z: 0.55 }),
});

const RADII = Object.freeze({ circle: 1.5, wave: 1.4 });

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
  return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

export function normalizePhase(theta) {
  const normalized = theta % TAU;
  return normalized < 0 ? normalized + TAU : normalized;
}

export function phaseComponents(theta) {
  const sin = Math.abs(Math.sin(theta)) < 1e-12 ? 0 : Math.sin(theta);
  const cos = Math.abs(Math.cos(theta)) < 1e-12 ? 0 : Math.cos(theta);
  return { sin, cos };
}

export function projectPoint(point, camera = DEFAULT_CAMERA) {
  const forward = normalize(subtract(camera.target, camera.position));
  const right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
  const up = normalize(cross(right, forward));
  const relative = subtract(point, camera.position);
  const depth = dot(relative, forward);
  const perspective = camera.focal / Math.max(depth, 0.001);

  return {
    x: camera.center.x + dot(relative, right) * perspective,
    y: camera.center.y - dot(relative, up) * perspective,
    depth,
    scale: perspective / 100,
  };
}

function waveX(theta) {
  return -2.45 + (theta / TAU) * 7.05;
}

export function buildFrameModel(theta, traceProgress = theta / TAU) {
  const components = phaseComponents(theta);
  const clampedTrace = clamp(traceProgress);
  const currentX = waveX(clampedTrace * TAU);

  return {
    theta,
    traceProgress: clampedTrace,
    components,
    centers: CENTERS,
    radii: RADII,
    circlePoint: {
      x: CENTERS.circle.x,
      y: CENTERS.circle.y + components.sin * RADII.circle,
      z: CENTERS.circle.z + components.cos * RADII.circle,
    },
    backPoint: {
      x: currentX,
      y: CENTERS.back.y + components.sin * RADII.wave,
      z: CENTERS.back.z,
    },
    floorPoint: {
      x: currentX,
      y: CENTERS.floor.y,
      z: CENTERS.floor.z + components.cos * RADII.wave,
    },
  };
}

function rgba(hex, alpha) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function path3D(ctx, points, camera = DEFAULT_CAMERA) {
  points.forEach((point, index) => {
    const projected = projectPoint(point, camera);
    if (index === 0) ctx.moveTo(projected.x, projected.y);
    else ctx.lineTo(projected.x, projected.y);
  });
}

function strokePath(ctx, points, color, width, alpha = 1, dash = []) {
  if (points.length < 2) return;
  ctx.save();
  ctx.beginPath();
  path3D(ctx, points);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}

function fillPlane(ctx, points, fill, stroke, alpha) {
  ctx.save();
  ctx.beginPath();
  path3D(ctx, points);
  ctx.closePath();
  ctx.fillStyle = rgba(fill, alpha);
  ctx.fill();
  ctx.strokeStyle = rgba(stroke, Math.min(1, alpha * 2.2));
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

function circleOnLeftWall(segments = 96) {
  const points = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * TAU;
    points.push({
      x: CENTERS.circle.x,
      y: CENTERS.circle.y + Math.sin(angle) * RADII.circle,
      z: CENTERS.circle.z + Math.cos(angle) * RADII.circle,
    });
  }
  return points;
}

function curvePoints(kind, reveal, samples = 180) {
  const points = [];
  const count = Math.max(2, Math.floor(samples * clamp(reveal)));
  for (let index = 0; index <= count; index += 1) {
    const theta = (index / samples) * TAU;
    if (kind === "sin") {
      points.push({
        x: waveX(theta),
        y: CENTERS.back.y + Math.sin(theta) * RADII.wave,
        z: CENTERS.back.z,
      });
    } else {
      points.push({
        x: waveX(theta),
        y: CENTERS.floor.y,
        z: CENTERS.floor.z + Math.cos(theta) * RADII.wave,
      });
    }
  }
  return points;
}

function drawGlowPoint(ctx, point, color, radius, alpha = 1) {
  const projected = projectPoint(point);
  ctx.save();
  const gradient = ctx.createRadialGradient(projected.x, projected.y, 0, projected.x, projected.y, radius * 4);
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(0.22, rgba(color, alpha * 0.8));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(projected.x, projected.y, radius * 4, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#f4fff9";
  ctx.beginPath();
  ctx.arc(projected.x, projected.y, radius, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx, reveal) {
  const alpha = 0.08 + reveal * 0.16;
  for (let x = -4; x <= 4; x += 1) {
    strokePath(ctx, [{ x, y: -2.55, z: -1.7 }, { x, y: -2.55, z: 4.15 }], "#77ffd1", 1, alpha);
    strokePath(ctx, [{ x, y: -2.55, z: 4.15 }, { x, y: 2.8, z: 4.15 }], "#77ffd1", 1, alpha * 0.8);
  }
  for (let z = -1; z <= 4; z += 1) {
    strokePath(ctx, [{ x: -4.55, y: -2.55, z }, { x: 4.65, y: -2.55, z }], "#77ffd1", 1, alpha);
  }
  for (let y = -2; y <= 2; y += 1) {
    strokePath(ctx, [{ x: -4.55, y, z: 4.15 }, { x: 4.65, y, z: 4.15 }], "#77ffd1", 1, alpha * 0.8);
  }
}

function drawAxisLabels(ctx, reveal) {
  if (reveal < 0.35) return;
  const labels = [
    [{ x: -4.55, y: 2.15, z: 0.65 }, "UNIT CIRCLE", "#f9c74f"],
    [{ x: 4.55, y: 2.35, z: 4.15 }, "SIN θ / BACK WALL", "#57e6ff"],
    [{ x: 4.45, y: -2.55, z: -1.25 }, "COS θ / FLOOR", "#ff5ca8"],
  ];
  ctx.save();
  ctx.font = "700 17px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  for (const [point, label, color] of labels) {
    const projected = projectPoint(point);
    ctx.fillStyle = rgba(color, reveal);
    ctx.fillText(label, projected.x, projected.y);
  }
  ctx.restore();
}

export function drawFrame(ctx, state) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const roomReveal = clamp(state.roomReveal ?? 1);
  const mappingReveal = clamp(state.mappingReveal ?? 1);
  const traceProgress = clamp(state.traceProgress ?? 0);
  const theta = state.theta ?? traceProgress * TAU;
  const resolve = clamp(state.resolve ?? 0);
  const model = buildFrameModel(theta, traceProgress);

  ctx.clearRect(0, 0, width, height);
  const wash = ctx.createRadialGradient(1120, 540, 40, 1120, 540, 940);
  wash.addColorStop(0, "rgba(21, 57, 55, 0.34)");
  wash.addColorStop(0.55, "rgba(5, 17, 20, 0.12)");
  wash.addColorStop(1, "rgba(2, 7, 10, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  const back = [
    { x: -4.55, y: -2.55, z: 4.15 },
    { x: 4.65, y: -2.55, z: 4.15 },
    { x: 4.65, y: 2.8, z: 4.15 },
    { x: -4.55, y: 2.8, z: 4.15 },
  ];
  const floor = [
    { x: -4.55, y: -2.55, z: -1.7 },
    { x: 4.65, y: -2.55, z: -1.7 },
    { x: 4.65, y: -2.55, z: 4.15 },
    { x: -4.55, y: -2.55, z: 4.15 },
  ];
  const left = [
    { x: -4.55, y: -2.55, z: -1.7 },
    { x: -4.55, y: -2.55, z: 4.15 },
    { x: -4.55, y: 2.8, z: 4.15 },
    { x: -4.55, y: 2.8, z: -1.7 },
  ];
  fillPlane(ctx, back, "#0d2528", "#78ffd3", 0.08 + roomReveal * 0.2);
  fillPlane(ctx, floor, "#071a1e", "#78ffd3", 0.08 + roomReveal * 0.16);
  fillPlane(ctx, left, "#112124", "#f9c74f", 0.05 + roomReveal * 0.12);
  drawGrid(ctx, roomReveal);

  strokePath(ctx, circleOnLeftWall(), "#f9c74f", 3.2, mappingReveal);
  strokePath(ctx, [
    { x: -4.55, y: -1.4, z: 0.65 },
    { x: -4.55, y: 2.05, z: 0.65 },
  ], "#f9c74f", 1.4, mappingReveal * 0.45);
  strokePath(ctx, [
    { x: -4.55, y: 0.3, z: -1.05 },
    { x: -4.55, y: 0.3, z: 2.35 },
  ], "#f9c74f", 1.4, mappingReveal * 0.45);

  // MAP 阶段先建立完整、低亮的静态关系；TRACE 阶段再沿既有基线高亮推进。
  strokePath(ctx, curvePoints("sin", mappingReveal), "#57e6ff", 1.8, mappingReveal * 0.34, []);
  strokePath(ctx, curvePoints("cos", mappingReveal), "#ff5ca8", 1.8, mappingReveal * 0.34, []);
  strokePath(ctx, curvePoints("sin", traceProgress), "#57e6ff", 4.2, mappingReveal, []);
  strokePath(ctx, curvePoints("cos", traceProgress), "#ff5ca8", 4.2, mappingReveal, []);

  if (mappingReveal > 0.02) {
    strokePath(ctx, [model.circlePoint, model.backPoint], "#57e6ff", 1.8, mappingReveal * 0.7, [8, 8]);
    strokePath(ctx, [model.circlePoint, model.floorPoint], "#ff5ca8", 1.8, mappingReveal * 0.7, [8, 8]);
    strokePath(ctx, [model.backPoint, model.floorPoint], "#c7fff0", 1.1, mappingReveal * 0.25, [4, 9]);
    drawGlowPoint(ctx, model.circlePoint, "#f9c74f", 7, mappingReveal);
    drawGlowPoint(ctx, model.backPoint, "#57e6ff", 6, mappingReveal);
    drawGlowPoint(ctx, model.floorPoint, "#ff5ca8", 6, mappingReveal);
  }

  drawAxisLabels(ctx, roomReveal);

  if (resolve > 0) {
    ctx.save();
    ctx.strokeStyle = rgba("#f4fff9", resolve * 0.24);
    ctx.lineWidth = 2;
    ctx.strokeRect(382, 107, 1458, 854);
    ctx.restore();
  }

  return model;
}
