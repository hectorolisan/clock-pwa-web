import { describe, expect, it } from "vitest";
import {
  addTime,
  createCountdown,
  isIdle,
  lapsToCsv,
  nextPhase,
  pause,
  remaining,
  reset,
  splits,
  start,
  toggle,
  untilNext,
} from "./timer";

describe("countdown", () => {
  const t0 = createCountdown(60_000);

  it("arranca en reposo", () => {
    expect(isIdle(t0)).toBe(true);
    expect(remaining(t0, 123)).toBe(60_000);
  });

  it("start fija endAt y descuenta con el tiempo", () => {
    const t = start(t0, 1_000);
    expect(t.endAt).toBe(61_000);
    expect(remaining(t, 11_000)).toBe(50_000);
    expect(isIdle(t)).toBe(false);
  });

  it("pause guarda lo que queda", () => {
    const t = pause(start(t0, 0), 20_000);
    expect(t).toEqual({ duration: 60_000, left: 40_000, endAt: null });
    expect(isIdle(t)).toBe(false);
  });

  it("pause no deja negativos", () => {
    expect(pause(start(t0, 0), 90_000).left).toBe(0);
  });

  it("toggle alterna", () => {
    const running = toggle(t0, 0);
    expect(running.endAt).toBe(60_000);
    expect(toggle(running, 30_000).endAt).toBeNull();
  });

  it("start no hace nada si ya terminó", () => {
    const done = { ...t0, left: 0 };
    expect(start(done, 0)).toBe(done);
  });

  it("reset vuelve a la duración", () => {
    expect(reset(pause(start(t0, 0), 10_000))).toEqual(t0);
  });

  it("addTime en pausa suma a duración y restante", () => {
    expect(addTime(t0, 60_000)).toEqual({ duration: 120_000, left: 120_000, endAt: null });
  });

  it("addTime en marcha retrasa endAt", () => {
    expect(addTime(start(t0, 0), 60_000).endAt).toBe(120_000);
  });
});

describe("nextPhase", () => {
  it("tras un pomodoro va a pausa corta", () => {
    expect(nextPhase("focus", 1, 4)).toEqual({ mode: "short", round: 1 });
  });

  it("cada longEvery pomodoros va a pausa larga", () => {
    expect(nextPhase("focus", 4, 4)).toEqual({ mode: "long", round: 4 });
  });

  it("tras una pausa vuelve a pomodoro y sube la ronda", () => {
    expect(nextPhase("short", 1, 4)).toEqual({ mode: "focus", round: 2 });
    expect(nextPhase("long", 4, 4)).toEqual({ mode: "focus", round: 5 });
  });
});

describe("untilNext", () => {
  const now = new Date(2026, 0, 1, 10, 0, 0).getTime();

  it("misma día si la hora no ha pasado", () => {
    expect(untilNext("10:30", now)).toBe(30 * 60_000);
  });

  it("día siguiente si ya pasó o es ahora", () => {
    expect(untilNext("09:00", now)).toBe(23 * 3_600_000);
    expect(untilNext("10:00", now)).toBe(24 * 3_600_000);
  });
});

describe("laps", () => {
  it("calcula parciales", () => {
    expect(splits([1_000, 3_000, 6_000])).toEqual([1_000, 2_000, 3_000]);
  });

  it("exporta CSV", () => {
    expect(lapsToCsv([1_000, 3_000], (ms) => String(ms))).toBe("lap,split,total\n1,1000,1000\n2,2000,3000");
  });
});
