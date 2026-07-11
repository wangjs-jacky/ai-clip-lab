import assert from "node:assert/strict";
import test from "node:test";

import {
  TAU,
  buildFrameModel,
  normalizePhase,
  phaseComponents,
  projectPoint,
} from "./projection.js";

const EPSILON = 1e-9;

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < EPSILON, `${message}: ${actual} != ${expected}`);
}

test("五个基准相位的 sin/cos 分量正确", () => {
  const cases = [
    [0, 0, 1],
    [Math.PI / 2, 1, 0],
    [Math.PI, 0, -1],
    [(3 * Math.PI) / 2, -1, 0],
    [TAU, 0, 1],
  ];

  for (const [theta, expectedSin, expectedCos] of cases) {
    const point = phaseComponents(theta);
    close(point.sin, expectedSin, `sin(${theta})`);
    close(point.cos, expectedCos, `cos(${theta})`);
  }
});

test("2π 与 0 归一化到同一相位", () => {
  close(normalizePhase(0), 0, "0");
  close(normalizePhase(TAU), 0, "2π");
  close(normalizePhase(-Math.PI / 2), (3 * Math.PI) / 2, "负相位");
});

test("同一相位生成完全相同的模型", () => {
  const first = buildFrameModel(Math.PI * 1.25, 0.625);
  const second = buildFrameModel(Math.PI * 1.25, 0.625);
  assert.deepEqual(first, second);
});

test("圆点、后墙正弦与地面余弦共享同一分量", () => {
  const theta = (3 * Math.PI) / 4;
  const model = buildFrameModel(theta, 0.375);
  close(model.circlePoint.y - model.centers.circle.y, model.components.sin * model.radii.circle, "圆点 sin");
  close(model.backPoint.y - model.centers.back.y, model.components.sin * model.radii.wave, "后墙 sin");
  close(model.floorPoint.z - model.centers.floor.z, model.components.cos * model.radii.wave, "地面 cos");
});

test("透视投影没有随机性且返回有限值", () => {
  const camera = {
    position: { x: 8.6, y: 5.4, z: -12.8 },
    target: { x: 0, y: -0.2, z: 1.2 },
    focal: 1180,
    center: { x: 1120, y: 555 },
  };
  const point = { x: 1.2, y: -0.5, z: 3.1 };
  const first = projectPoint(point, camera);
  const second = projectPoint(point, camera);
  assert.deepEqual(first, second);
  assert.ok(Number.isFinite(first.x));
  assert.ok(Number.isFinite(first.y));
  assert.ok(first.depth > 0);
});
