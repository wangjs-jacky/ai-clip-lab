import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 48_000;
const MAX_INT16 = 32_767;
const outputDir = resolve(dirname(fileURLToPath(import.meta.url)), "assets/fixtures");

function clamp(value, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function fadeEnvelope(time, duration, fadeIn, fadeOutStart) {
  const attack = Math.min(1, time / fadeIn);
  const release = time <= fadeOutStart ? 1 : 1 - (time - fadeOutStart) / (duration - fadeOutStart);
  return clamp(Math.min(attack, release), 0, 1);
}

function encodeMonoWav(duration, sampleAt) {
  const sampleCount = Math.round(duration * SAMPLE_RATE);
  const dataBytes = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / SAMPLE_RATE;
    const sample = Math.round(clamp(sampleAt(time, duration)) * MAX_INT16);
    buffer.writeInt16LE(sample, 44 + index * 2);
  }

  return buffer;
}

function tickSample(time, duration) {
  const envelope = fadeEnvelope(time, duration, 0.004, 0.028);
  const fundamental = Math.sin(2 * Math.PI * 1_180 * time);
  const overtone = Math.sin(2 * Math.PI * 2_360 * time) * 0.22;
  return (fundamental + overtone) * envelope * 0.2;
}

function finalHitSample(time, duration) {
  const lowEnvelope = fadeEnvelope(time, duration, 0.008, 0.12);
  const highDuration = 0.2;
  const highEnvelope = time < highDuration ? fadeEnvelope(time, highDuration, 0.004, 0.025) : 0;
  const low = Math.sin(2 * Math.PI * 108 * time) * lowEnvelope * 0.36;
  const high = Math.sin(2 * Math.PI * 640 * time) * highEnvelope * 0.14;
  return low + high;
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "center-tick.wav"), encodeMonoWav(0.11, tickSample));
writeFileSync(resolve(outputDir, "final-hit.wav"), encodeMonoWav(0.5, finalHitSample));

console.log("已生成确定性音效：center-tick.wav、final-hit.wav");
