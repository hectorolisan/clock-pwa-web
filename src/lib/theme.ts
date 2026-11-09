import { effect, signal } from "@preact/signals";

export const COLORS = [
  "default",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export type Color = (typeof COLORS)[number];

const stored = localStorage.getItem("color") as Color | null;

export const color = signal<Color>(stored && COLORS.includes(stored) ? stored : "default");

effect(() => {
  document.documentElement.dataset.color = color.value;
  localStorage.setItem("color", color.value);
});
