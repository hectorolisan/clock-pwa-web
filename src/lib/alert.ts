import { signal } from "@preact/signals";
import { settings, type Sound } from "@/lib/settings";
import { t } from "@/lib/i18n";

/** Mensaje de la alerta sonando; null = silencio */
export const alertMessage = signal<string | null>(null);

let ctx: AudioContext | undefined;
let loop: ReturnType<typeof setInterval> | undefined;
let timeout: ReturnType<typeof setTimeout> | undefined;

/** Nota con envolvente: ataque corto y caída exponencial */
function tone(out: AudioNode, at: number, freq: number, vol: number, decay: number, type: OscillatorType = "sine") {
  const osc = ctx!.createOscillator();
  const gain = ctx!.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(vol, at + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + decay);
}

const PATTERNS: Record<Sound, (out: AudioNode, t0: number) => void> = {
  // Xilófono: arpegio Do mayor (C6 E6 G6 C7), fundamental + parcial ~4x
  chime: (out, t0) =>
    [1047, 1319, 1568, 2093].forEach((f, i) => {
      tone(out, t0 + i * 0.14, f, 0.25, 0.6);
      tone(out, t0 + i * 0.14, f * 3.9, 0.06, 0.15);
    }),
  // Campana: parciales inarmónicos con caída larga
  bell: (out, t0) => [1, 2.76, 5.4].forEach((m, i) => tone(out, t0, 660 * m, [0.3, 0.1, 0.05][i], 1.6 / (i + 1))),
  // Despertador digital: 4 pitidos cuadrados
  digital: (out, t0) => [0, 0.12, 0.24, 0.36].forEach((d) => tone(out, t0 + d, 2000, 0.08, 0.08, "square")),
  // Suave: dos notas graves
  soft: (out, t0) => [523, 659].forEach((f, i) => tone(out, t0 + i * 0.3, f, 0.25, 0.9)),
};

export function beep(sound = settings.value.sound, volume = settings.value.volume) {
  ctx ??= new AudioContext();
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  PATTERNS[sound](master, ctx.currentTime);
}

/** Desbloquea audio en iOS/Safari: llamar desde un gesto del usuario */
export function unlockAudio() {
  ctx ??= new AudioContext();
  void ctx.resume();
}

/** Permiso de notificaciones como señal para que la UI reaccione */
export const notifyPermission = signal<NotificationPermission | "unsupported">(
  "Notification" in window ? Notification.permission : "unsupported",
);

export function requestNotifications() {
  if (notifyPermission.value === "default") {
    void Notification.requestPermission().then((p) => (notifyPermission.value = p));
  }
}

export function startAlert(message: string) {
  alertMessage.value = message;
  clearInterval(loop);
  clearTimeout(timeout);
  beep();
  loop = setInterval(beep, 2000);
  timeout = setTimeout(stopAlert, 60_000);
  if ("Notification" in window && Notification.permission === "granted") {
    const opts = { body: message, tag: "clock", icon: `${import.meta.env.BASE_URL}pwa-192x192.png` };
    navigator.serviceWorker?.ready
      .then((reg) => reg.showNotification(t("alert.title"), opts))
      .catch(() => new Notification(t("alert.title"), opts));
  }
}

export function stopAlert() {
  clearInterval(loop);
  clearTimeout(timeout);
  alertMessage.value = null;
}
