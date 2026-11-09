export const pad = (n: number, len = 2) => String(Math.floor(n)).padStart(len, "0");

/** ms -> "HH:MM:SS" (horas solo si hacen falta o se fuerzan) */
export function formatDuration(ms: number, { hours = false, centis = false } = {}) {
  const total = Math.max(0, ms);
  const s = Math.floor(total / 1000);
  const h = Math.floor(s / 3600);
  const body = `${pad((s / 60) % 60)}:${pad(s % 60)}`;
  const head = h > 0 || hours ? `${pad(h)}:` : "";
  const tail = centis ? `.${pad((total % 1000) / 10)}` : "";
  return head + body + tail;
}
