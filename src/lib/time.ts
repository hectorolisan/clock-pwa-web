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

/** "19:30" -> "07:30 PM" si no es formato 24 h */
export function formatHHMM(hhmm: string, h24: boolean) {
  if (h24) return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  return `${pad(h % 12 || 12)}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}

/** Desfase de una zona horaria respecto a UTC en minutos ("GMT+05:30" -> 330) */
export function zoneOffset(timeZone: string, date = new Date()) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")!.value;
  const m = name.match(/([+-])(\d{2}):(\d{2})/);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

/** "America/Argentina/Buenos_Aires" -> "Buenos Aires" */
export const zoneCity = (timeZone: string) => timeZone.split("/").pop()!.replace(/_/g, " ");
