import { computed, effect, signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { settings } from "@/lib/settings";
import { baseTitle } from "@/lib/title";

/** Herramienta en marcha: texto para el título y progreso 0-1 para el favicon */
type Status = { text: string; progress?: number };

export const activeTab = signal("clock");
const statuses = signal<Record<string, Status>>({});

/** Lo que se muestra: la pestaña activa si está en marcha, si no la primera que lo esté */
const shown = computed(() => statuses.value[activeTab.value] ?? Object.values(statuses.value)[0]);

export function useStatus(id: string, status: Status | null) {
  const key = status && `${status.text}|${status.progress}`;
  useEffect(() => {
    const { [id]: _, ...rest } = statuses.value;
    statuses.value = status ? { ...rest, [id]: status } : rest;
  }, [key]);
  useEffect(
    () => () => {
      const { [id]: _, ...rest } = statuses.value;
      statuses.value = rest;
    },
    [],
  );
}

effect(() => {
  document.title = shown.value ? shown.value.text : baseTitle.value;
});

// Favicon con anillo de progreso
let originals: Map<HTMLLinkElement, string> | undefined;
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 64;

function drawIcon(progress: number | undefined) {
  const c = canvas.getContext("2d")!;
  const color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#333b4b";
  c.clearRect(0, 0, 64, 64);
  c.lineWidth = 10;
  c.strokeStyle = "#d4d4d8";
  c.beginPath();
  c.arc(32, 32, 26, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = color;
  c.beginPath();
  c.arc(32, 32, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (progress ?? 1));
  c.stroke();
  return canvas.toDataURL("image/png");
}

effect(() => {
  const s = shown.value;
  const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')];
  if (!s) {
    originals?.forEach((href, link) => (link.href = href));
    originals = undefined;
    return;
  }
  originals ??= new Map(links.map((l) => [l, l.href]));
  // Redondeo a 2 % para no redibujar en cada tick
  const href = drawIcon(s.progress === undefined ? undefined : Math.round(s.progress * 50) / 50);
  links.forEach((l) => (l.href = href));
});

// Screen Wake Lock mientras haya algo en marcha
const visible = signal(document.visibilityState === "visible");
document.addEventListener("visibilitychange", () => (visible.value = document.visibilityState === "visible"));

let lock: WakeLockSentinel | null = null;
const wantLock = computed(() => settings.value.wakeLock && visible.value && Object.keys(statuses.value).length > 0);

effect(() => {
  if (!("wakeLock" in navigator)) return;
  if (wantLock.value && !lock) {
    navigator.wakeLock
      .request("screen")
      .then((l) => {
        lock = l;
        l.addEventListener("release", () => (lock = null));
        if (!wantLock.peek()) void l.release();
      })
      .catch(() => {});
  } else if (!wantLock.value && lock) {
    void lock.release();
  }
});
