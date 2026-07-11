import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  FINAL_CENTER,
  PRE_SETTLE_CENTER,
  POSTER_COUNT,
  START_CENTER,
  TARGET_INDEX,
  TIMING,
  buildCrossingTimes,
  centerAtTime,
  coverflowLayout,
  lockAtTime,
  spreadAtTime,
  visualOpacityAt,
  wrappedOffset,
} from "./coverflow.js";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");

function close(actual, expected, message, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) < epsilon, `${message}: ${actual} != ${expected}`);
}

test("环形距离对 12 张海报保持周期性与中心对称", () => {
  close(wrappedOffset(5, 5), 0, "中心距离");
  close(wrappedOffset(5 + POSTER_COUNT, 5), 0, "一圈后仍是中心");
  close(wrappedOffset(4, 5), -1, "左邻居");
  close(wrappedOffset(6, 5), 1, "右邻居");
});

test("同距海报的缩放明暗一致，方向只影响横移与转角", () => {
  const left = coverflowLayout(4, 5, 1);
  const center = coverflowLayout(5, 5, 1);
  const right = coverflowLayout(6, 5, 1);

  close(left.x, -right.x, "横移镜像");
  close(left.rotationY, -right.rotationY, "转角镜像");
  close(left.scale, right.scale, "同距缩放");
  close(left.opacity, right.opacity, "同距透明度");
  close(left.brightness, right.brightness, "同距明暗");
  assert.ok(center.scale > left.scale);
  assert.ok(center.brightness > left.brightness);
  assert.ok(center.z > left.z);
});

test("距离增加会后退、缩小、变暗并逐渐失焦", () => {
  const near = coverflowLayout(6, 5, 1);
  const middle = coverflowLayout(8, 5, 1);
  const far = coverflowLayout(10, 5, 1);

  assert.ok(near.z > middle.z && middle.z > far.z);
  assert.ok(near.scale > middle.scale && middle.scale > far.scale);
  assert.ok(near.opacity > middle.opacity && middle.opacity > far.opacity);
  assert.ok(near.brightness > middle.brightness && middle.brightness > far.brightness);
  assert.ok(near.blur < middle.blur && middle.blur < far.blur);
});

test("中心位置只由时间决定，先减速再于 7 秒完成定格", () => {
  close(centerAtTime(0), START_CENTER, "开场中心");
  close(centerAtTime(TIMING.spinStart), START_CENTER, "轮转起点");
  close(centerAtTime(TIMING.settleStart), PRE_SETTLE_CENTER, "减速终点");
  close(centerAtTime(TIMING.lockStart), FINAL_CENTER, "定格终点");
  close(centerAtTime(TIMING.duration), FINAL_CENTER, "末帧中心");
  assert.equal(TARGET_INDEX, 5);
});

test("组装、锁定与末帧淡出都由绝对时间派生", () => {
  close(spreadAtTime(0), 0.22, "初始展开量");
  close(spreadAtTime(0.8), 1, "组装完成");
  close(lockAtTime(6.99), 0, "锁定前");
  close(lockAtTime(8), 1, "锁定完成");
  close(visualOpacityAt(9.3), 1, "退场起点");
  close(visualOpacityAt(10 - 1 / 30), 0, "最后可见帧");
});

test("敲击时间严格递增，间隔由密到疏，最后一下压在定格上", () => {
  const crossings = buildCrossingTimes();
  assert.equal(crossings.length, FINAL_CENTER - START_CENTER);
  assert.equal(crossings.at(-1).posterIndex, TARGET_INDEX);
  assert.equal(crossings.at(-1).final, true);
  close(crossings.at(-1).time, TIMING.lockStart, "最终敲击时间", 1e-6);

  const gaps = crossings.slice(1).map((crossing, index) => crossing.time - crossings[index].time);
  assert.ok(gaps.every((gap) => gap > 0));
  assert.ok(gaps.at(-1) > gaps[0] * 5, "末段间隔应显著长于开头");
  for (let index = 1; index < gaps.length; index += 1) {
    assert.ok(gaps[index] > gaps[index - 1], `第 ${index + 1} 个间隔没有变长`);
  }
});

test("公开 HTML 提供 12 张可替换海报 fixture", () => {
  const variables = [...html.matchAll(/data-var-src="poster(\d{2})"/g)].map((match) => match[1]);
  const fixtures = [...html.matchAll(/src="assets\/fixtures\/poster-(\d{2})\.svg"/g)].map(
    (match) => match[1],
  );
  const expected = Array.from({ length: POSTER_COUNT }, (_, index) =>
    String(index + 1).padStart(2, "0"),
  );

  assert.deepEqual(variables, expected);
  assert.deepEqual(fixtures, expected);
});

test("公开脚本生成规格固定的 PCM 音效 fixture", async () => {
  const fixtures = [
    ["center-tick.wav", 0.11],
    ["final-hit.wav", 0.5],
  ];

  for (const [filename, expectedDuration] of fixtures) {
    const wav = await readFile(new URL(`./assets/fixtures/${filename}`, import.meta.url));
    assert.equal(wav.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(wav.subarray(8, 12).toString("ascii"), "WAVE");
    assert.equal(wav.readUInt32LE(24), 48_000);
    assert.equal(wav.readUInt16LE(34), 16);
    assert.equal(wav.readUInt32LE(40) / 2 / 48_000, expectedDuration);
  }
});

test("时间线、音频和锁定机制保持单一且可 seek", () => {
  assert.equal((html.match(/gsap\.timeline\(/g) ?? []).length, 1);
  assert.match(html, /gsap\.timeline\(\{\s*paused:\s*true/);
  assert.match(html, /window\.__timelines\.main\s*=\s*tl/);
  assert.equal((html.match(/<audio\b/g) ?? []).length, buildCrossingTimes().length);
  assert.match(html, /id="final-hit"[\s\S]*data-start="7"/);
  assert.match(html, /const clock = \{ time: 0 \}/);
  assert.match(html, /centerAtTime\(time\)/);
  assert.match(html, /layout\.blur \+ \(isTarget \? 0 : lock \* 3\)/);
  assert.match(html, /id="lock-glow"/);
});
