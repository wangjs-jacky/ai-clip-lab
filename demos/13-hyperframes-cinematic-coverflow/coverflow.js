export const POSTER_COUNT = 12;
export const START_CENTER = 0;
export const PRE_SETTLE_CENTER = 16.05;
export const FINAL_CENTER = 17;
export const TARGET_INDEX = FINAL_CENTER % POSTER_COUNT;

export const TIMING = Object.freeze({
  duration: 10,
  assembleStart: 0.18,
  assembleDuration: 0.62,
  spinStart: 0.8,
  spinDuration: 5.3,
  settleStart: 6.1,
  lockStart: 7,
  lockDuration: 1,
  exitStart: 9.3,
  exitDuration: 0.7,
});

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function positiveMod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

export function wrappedOffset(index, center, count = POSTER_COUNT) {
  const half = count / 2;
  return positiveMod(index - center + half, count) - half;
}

export function power2Out(progress) {
  const p = clamp(progress);
  return 1 - (1 - p) ** 2;
}

export function inversePower2Out(progress) {
  return 1 - Math.sqrt(1 - clamp(progress));
}

export function power3Out(progress) {
  const p = clamp(progress);
  return 1 - (1 - p) ** 3;
}

export function progressBetween(time, start, end) {
  return clamp((time - start) / (end - start));
}

export function smoothstep(progress) {
  const p = clamp(progress);
  return p * p * (3 - 2 * p);
}

export function centerAtTime(timeSeconds) {
  if (timeSeconds <= TIMING.spinStart) return START_CENTER;
  if (timeSeconds < TIMING.settleStart) {
    const progress = progressBetween(timeSeconds, TIMING.spinStart, TIMING.settleStart);
    return START_CENTER + (PRE_SETTLE_CENTER - START_CENTER) * power2Out(progress);
  }
  if (timeSeconds < TIMING.lockStart) {
    const progress = progressBetween(timeSeconds, TIMING.settleStart, TIMING.lockStart);
    return PRE_SETTLE_CENTER + (FINAL_CENTER - PRE_SETTLE_CENTER) * power3Out(progress);
  }
  return FINAL_CENTER;
}

export function spreadAtTime(timeSeconds) {
  if (timeSeconds <= TIMING.assembleStart) return 0.22;
  const progress = progressBetween(
    timeSeconds,
    TIMING.assembleStart,
    TIMING.assembleStart + TIMING.assembleDuration,
  );
  return 0.22 + (1 - 0.22) * power3Out(progress);
}

export function lockAtTime(timeSeconds) {
  return power3Out(progressBetween(timeSeconds, TIMING.lockStart, TIMING.lockStart + TIMING.lockDuration));
}

export function visualOpacityAt(timeSeconds, fps = 30) {
  const lastVisibleFrame = TIMING.duration - 1 / fps;
  if (timeSeconds <= TIMING.exitStart) return 1;
  if (timeSeconds >= lastVisibleFrame) return 0;
  return 1 - smoothstep(progressBetween(timeSeconds, TIMING.exitStart, lastVisibleFrame));
}

export function coverflowLayout(index, center, spread = 1) {
  const normalizedSpread = clamp(spread);
  const offset = wrappedOffset(index, center);
  const distance = Math.abs(offset);
  const direction = Math.sign(offset);
  const boundedDistance = Math.min(distance, POSTER_COUNT / 2);

  const finalX = direction * Math.pow(boundedDistance, 0.82) * 286;
  const finalRotationY =
    distance < 0.001 ? 0 : -direction * (22 + Math.min(distance, 4.8) * 9.5);
  const finalScale = Math.max(0.46, 1.08 - distance * 0.115);
  const farEdgeFade = distance > 5.2 ? clamp((6 - distance) / 0.8) : 1;
  const distanceOpacity = clamp(1 - Math.max(0, distance - 0.35) * 0.15) * farEdgeFade;

  return {
    offset,
    distance,
    x: finalX * normalizedSpread,
    y: distance * 6 * normalizedSpread,
    z: 260 - distance * 150 * normalizedSpread,
    rotationY: finalRotationY * normalizedSpread,
    scale: 0.68 + (finalScale - 0.68) * normalizedSpread,
    opacity: distanceOpacity * clamp((normalizedSpread - 0.18) / 0.82),
    brightness: Math.max(0.28, 1.08 - distance * 0.13),
    blur: Math.max(0, distance - 2) * 0.72,
  };
}

export function buildCrossingTimes() {
  const crossings = [];

  for (let center = 1; center <= Math.floor(PRE_SETTLE_CENTER); center += 1) {
    const easedProgress = center / PRE_SETTLE_CENTER;
    const timelineProgress = inversePower2Out(easedProgress);
    crossings.push({
      center,
      posterIndex: positiveMod(center, POSTER_COUNT),
      time: Number((TIMING.spinStart + timelineProgress * TIMING.spinDuration).toFixed(6)),
      final: false,
    });
  }

  crossings.push({
    center: FINAL_CENTER,
    posterIndex: TARGET_INDEX,
    time: TIMING.lockStart,
    final: true,
  });

  return crossings;
}
