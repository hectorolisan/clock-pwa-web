import { effect, signal } from "@preact/signals";

const KEY = "settings";
const DEFAULTS = { h24: true, seconds: true };

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
