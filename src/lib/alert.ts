import { signal } from "@preact/signals";

/** Mensaje de la alerta sonando; null = silencio */
export const alertMessage = signal<string | null>(null);

let ctx: AudioContext | undefined;
let loop: ReturnType<typeof setInterval> | undefined;

// Arpegio Do mayor (C6 E6 G6 C7)
const NOTES = [1047, 1319, 1568, 2093];

/** Golpe de xilófono: fundamental + parcial a ~3x con caída rápida */
function strike(at: number, freq: number) {
  for (const [mult, vol, decay] of [
    [1, 0.25, 0.6],
    [3.9, 0.06, 0.15],
  ]) {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(vol, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(gain).connect(ctx!.destination);
    osc.start(at);
    osc.stop(at + decay);
  }
}

export function beep() {
  ctx ??= new AudioContext();
  const t0 = ctx.currentTime;
  NOTES.forEach((f, i) => strike(t0 + i * 0.14, f));
}

/** Desbloquea audio en iOS/Safari: llamar desde un gesto del usuario */
export function unlockAudio() {
  ctx ??= new AudioContext();
  void ctx.resume();
}

export function requestNotifications() {
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function startAlert(message: string) {
  alertMessage.value = message;
  clearInterval(loop);
  beep();
  loop = setInterval(beep, 2000);
  setTimeout(stopAlert, 60_000);
  if ("Notification" in window && Notification.permission === "granted") {
    navigator.serviceWorker?.ready
      .then((reg) => reg.showNotification("Clock", { body: message, tag: "clock" }))
      .catch(() => new Notification("Clock", { body: message }));
  }
}

export function stopAlert() {
  clearInterval(loop);
  alertMessage.value = null;
}
