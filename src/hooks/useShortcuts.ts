import { useEffect, useLayoutEffect, useRef } from "preact/hooks";

type Handlers = Partial<Record<"toggle" | "reset" | "lap" | "skip", () => void>>;

const KEYS: Record<string, keyof Handlers> = { " ": "toggle", k: "toggle", r: "reset", l: "lap", n: "skip" };

/** Ignora teclas dentro de campos, controles con foco (Espacio) o diálogos abiertos */
export function shouldIgnore(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return true;
  const el = e.target as HTMLElement | null;
  if (el?.closest("input, textarea, select, [contenteditable=true], [role=dialog], [role=alertdialog]")) return true;
  if (e.key === " " && el?.closest("button, a, [role=button], [role=tab], [role=switch]")) return true;
  return !!document.querySelector("[role=dialog], [role=alertdialog]");
}

export function useShortcuts(active: boolean, handlers: Handlers) {
  const ref = useRef(handlers);
  useLayoutEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (shouldIgnore(e)) return;
      const fn = ref.current[KEYS[e.key.toLowerCase()]];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [active]);
}
