import { signal } from "@preact/signals";

/** Mensaje de la alerta sonando; null = silencio */
export const alertMessage = signal<string | null>(null);

let ctx: AudioContext | undefined;
let loop: ReturnType<typeof setInterval> | undefined;

export function beep(times = 3) {
  ctx ??= new AudioContext();
  const t0 = ctx.currentTime;
  for (let i = 0; i < times; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, t0 + i * 0.25);
    gain.gain.setValueAtTime(0, t0 + i * 0.25 + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0 + i * 0.25);
    osc.stop(t0 + i * 0.25 + 0.15);
  }
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
  loop = setInterval(beep, 1500);
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
