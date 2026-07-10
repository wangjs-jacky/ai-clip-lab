import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");

test("16 张海报都有独立变量入口和公开 fixture", () => {
  const variables = [...html.matchAll(/data-var-src="poster(\d{2})"/g)].map(
    (match) => match[1],
  );
  const fixtures = [...html.matchAll(/src="assets\/fixtures\/poster-(\d{2})\.svg"/g)].map(
    (match) => match[1],
  );

  assert.deepEqual(variables, Array.from({ length: 16 }, (_, index) => String(index + 1).padStart(2, "0")));
  assert.deepEqual(fixtures, variables);
});

test("四个方向组覆盖全部海报且保持错峰入口", () => {
  const counts = Object.fromEntries(
    ["top", "left", "right", "bottom"].map((direction) => [
      direction,
      [...html.matchAll(new RegExp(`class="poster-shell group-${direction}"`, "g"))].length,
    ]),
  );

  assert.deepEqual(counts, { top: 5, left: 3, right: 4, bottom: 4 });
  for (const direction of Object.keys(counts)) {
    assert.match(html, new RegExp(`"\\.group-${direction} \\.poster"`));
  }
});

test("透视、整体侧倾和后段巡航保持为三层独立机制", () => {
  assert.match(html, /perspective:\s*2200px/);
  assert.match(html, /"#tilt-world"[\s\S]*rotationX:\s*20,\s*rotationY:\s*-10/);
  assert.match(html, /"#camera"[\s\S]*x:\s*-920,\s*y:\s*-54,\s*scale:\s*1\.11/);
});

test("全片只暴露一条暂停时间线", () => {
  assert.equal((html.match(/gsap\.timeline\(/g) ?? []).length, 1);
  assert.match(html, /gsap\.timeline\(\{\s*paused:\s*true\s*\}\)/);
  assert.match(html, /window\.__timelines\.main\s*=\s*tl/);
});
