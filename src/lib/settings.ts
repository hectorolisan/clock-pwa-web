import { effect, signal } from "@preact/signals";

const KEY = "settings";
export const SOUNDS = ["chime", "bell", "digital", "soft"] as const;
export type Sound = (typeof SOUNDS)[number];

const DEFAULTS = { h24: true, seconds: true, wakeLock: true, sound: "chime" as Sound, volume: 0.7 };

const load = () => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
};

/** Ajustes globales compartidos entre islas (mismo módulo = misma instancia) */
export const settings = signal<typeof DEFAULTS>(load());

effect(() => localStorage.setItem(KEY, JSON.stringify(settings.value)));
