/** Cuenta regresiva pausable: guarda `endAt` absoluto para sobrevivir a recargas */
export type Countdown = { duration: number; left: number; endAt: number | null };

export const MINUTE = 60_000;
const DAY = 86_400_000;

export const createCountdown = (duration: number): Countdown => ({ duration, left: duration, endAt: null });

export const remaining = (t: Countdown, now: number) => (t.endAt ? t.endAt - now : t.left);

export const isIdle = (t: Countdown) => !t.endAt && t.left === t.duration;

export const start = (t: Countdown, now: number): Countdown =>
  t.endAt || t.left <= 0 ? t : { ...t, endAt: now + t.left };

export const pause = (t: Countdown, now: number): Countdown =>
  t.endAt ? { ...t, endAt: null, left: Math.max(0, t.endAt - now) } : t;

export const toggle = (t: Countdown, now: number) => (t.endAt ? pause(t, now) : start(t, now));

export const reset = (t: Countdown): Countdown => createCountdown(t.duration);

export const addTime = (t: Countdown, ms: number): Countdown =>
  t.endAt ? { ...t, endAt: t.endAt + ms } : { ...t, left: t.left + ms, duration: t.duration + ms };

export type PomodoroMode = "focus" | "short" | "long";

/** Siguiente fase: tras cada `longEvery` pomodoros toca pausa larga */
export function nextPhase(mode: PomodoroMode, round: number, longEvery: number) {
  if (mode !== "focus") return { mode: "focus" as const, round: round + 1 };
  return { mode: round % longEvery === 0 ? ("long" as const) : ("short" as const), round };
}

/** ms hasta la próxima vez que el reloj marque `time` (HH:MM) */
export function untilNext(time: string, now: number) {
  const [h, m] = time.split(":").map(Number);
  const t = new Date(now);
  t.setHours(h, m, 0, 0);
  const diff = t.getTime() - now;
  return diff > 0 ? diff : diff + DAY;
}

/** Parciales de cada vuelta a partir de los tiempos totales acumulados */
export const splits = (laps: number[]) => laps.map((t, i) => t - (laps[i - 1] ?? 0));

export function lapsToCsv(laps: number[], format: (ms: number) => string) {
  const s = splits(laps);
  return ["lap,split,total", ...laps.map((t, i) => `${i + 1},${format(s[i])},${format(t)}`)].join("\n");
}
