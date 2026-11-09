import { computed, effect, signal } from "@preact/signals";

const es = {
  "app.description": "Reloj digital, pomodoro, cuenta atrás, temporizador, cronómetro y alarmas.",
  "tab.clock": "Reloj",
  "tab.pomodoro": "Pomodoro",
  "tab.countdown": "Cuenta atrás",
  "tab.timer": "Temporizador",
  "tab.stopwatch": "Cronómetro",
  "tab.alarm": "Alarma",
  "tabs.label": "Herramientas",

  "header.settings": "Ajustes",
  "header.theme": "Tema",
  "header.themeToggle": "Cambiar tema",
  "footer.by": "Desarrollado por",
  "footer.code": "Código",

  "action.start": "Empezar",
  "action.pause": "Pausar",
  "action.resume": "Reanudar",
  "action.stop": "Parar",
  "action.reset": "Reiniciar",
  "action.skip": "Saltar",
  "action.lap": "Vuelta",
  "action.accept": "Aceptar",
  "action.delete": "Eliminar",
  "action.add": "Añadir",
  "action.cancel": "Cancelar",

  "settings.h24": "Formato 24 h",
  "settings.h24Hint": "Si se desactiva, usa AM/PM.",
  "settings.seconds": "Mostrar segundos",
  "settings.secondsHint": "En el reloj y la cuenta atrás.",
  "settings.wakeLock": "Mantener pantalla encendida",
  "settings.wakeLockHint": "Mientras haya un temporizador en marcha.",
  "settings.language": "Idioma",
  "settings.color": "Color principal",
  "settings.sound": "Sonido",
  "settings.volume": "Volumen",
  "settings.test": "Probar",
  "settings.notifications": "Notificaciones",
  "settings.notificationsHint": "Avisan aunque la pestaña esté en segundo plano.",
  "settings.notificationsOn": "Activadas",
  "settings.notificationsOff": "Bloqueadas en el navegador",
  "settings.notificationsEnable": "Activar",
  "settings.shortcuts": "Atajos de teclado",

  "sound.chime": "Xilófono",
  "sound.bell": "Campana",
  "sound.digital": "Digital",
  "sound.soft": "Suave",

  "shortcut.toggle": "Empezar / pausar",
  "shortcut.reset": "Reiniciar",
  "shortcut.lap": "Vuelta (cronómetro)",
  "shortcut.skip": "Saltar fase (pomodoro)",
  "shortcut.tabs": "Cambiar de pestaña",

  "alert.dialog": "Alerta",
  "alert.title": "Clock",

  "clock.world": "Reloj mundial",
  "clock.addZone": "Añadir zona horaria",
  "clock.search": "Buscar ciudad o zona…",
  "clock.noResults": "Sin resultados.",
  "clock.removeZone": "Quitar {zone}",
  "clock.sameTime": "misma hora",
  "clock.ahead": "+{h} h",
  "clock.behind": "−{h} h",

  "pomodoro.focus": "Pomodoro",
  "pomodoro.short": "Pausa corta",
  "pomodoro.long": "Pausa larga",
  "pomodoro.focusSub": "concéntrate",
  "pomodoro.shortSub": "descansa",
  "pomodoro.longSub": "relájate",
  "pomodoro.focusDone": "¡Pomodoro terminado! Toca descansar.",
  "pomodoro.breakDone": "Pausa terminada. ¡A trabajar!",
  "pomodoro.round": "Ciclo {n}",
  "pomodoro.completed": "{n} completados hoy",
  "pomodoro.resetCount": "Poner a cero el contador",
  "pomodoro.config": "Configurar",
  "pomodoro.minutes": "{label} (min)",
  "pomodoro.longEvery": "Pausa larga cada (ciclos)",
  "pomodoro.autoStart": "Encadenar fases automáticamente",
  "pomodoro.progress": "Progreso",

  "countdown.change": "Cambiar fecha",
  "countdown.done": "¡Cuenta atrás terminada!",
  "countdown.arrived": "¡Llegó el momento!",
  "countdown.days": "días",

  "timer.running": "en marcha",
  "timer.ready": "listo",
  "timer.paused": "en pausa",
  "timer.done": "¡Tiempo! ({name})",
  "timer.name": "Temporizador {n}",
  "timer.new": "Nuevo temporizador",
  "timer.list": "Temporizadores",
  "timer.addMinute": "1 min",
  "timer.addMinuteLabel": "Añadir 1 minuto",
  "timer.preset": "{n} min",

  "stopwatch.lap": "Vuelta",
  "stopwatch.split": "Parcial",
  "stopwatch.total": "Total",
  "stopwatch.export": "Exportar CSV",
  "stopwatch.copy": "Copiar",
  "stopwatch.copied": "Vueltas copiadas",
  "stopwatch.lapAdded": "Vuelta {n}: {time}",

  "alarm.add": "Añadir alarma",
  "alarm.new": "Nueva alarma",
  "alarm.change": "Cambiar hora",
  "alarm.empty": "Sin alarmas todavía.",
  "alarm.off": "Desactivada",
  "alarm.in": "en {h} h {m} min",
  "alarm.toggle": "Activar alarma {time}",
  "alarm.delete": "Eliminar alarma {time}",
  "alarm.count": "{n}/{max} alarmas",
  "alarm.ring": "Alarma {time}",

  "time.hour": "Hora",
  "time.minutes": "Minutos",
  "time.started": "En marcha",
  "time.paused": "En pausa",
  "time.reset": "Reiniciado",
};

type Key = keyof typeof es;

const en: Record<Key, string> = {
  "app.description": "Digital clock, pomodoro, countdown, timer, stopwatch and alarms.",
  "tab.clock": "Clock",
  "tab.pomodoro": "Pomodoro",
  "tab.countdown": "Countdown",
  "tab.timer": "Timer",
  "tab.stopwatch": "Stopwatch",
  "tab.alarm": "Alarm",
  "tabs.label": "Tools",

  "header.settings": "Settings",
  "header.theme": "Theme",
  "header.themeToggle": "Toggle theme",
  "footer.by": "Made by",
  "footer.code": "Code",

  "action.start": "Start",
  "action.pause": "Pause",
  "action.resume": "Resume",
  "action.stop": "Stop",
  "action.reset": "Reset",
  "action.skip": "Skip",
  "action.lap": "Lap",
  "action.accept": "OK",
  "action.delete": "Delete",
  "action.add": "Add",
  "action.cancel": "Cancel",

  "settings.h24": "24-hour format",
  "settings.h24Hint": "When off, uses AM/PM.",
  "settings.seconds": "Show seconds",
  "settings.secondsHint": "On the clock and countdown.",
  "settings.wakeLock": "Keep screen on",
  "settings.wakeLockHint": "While a timer is running.",
  "settings.language": "Language",
  "settings.color": "Primary color",
  "settings.sound": "Sound",
  "settings.volume": "Volume",
  "settings.test": "Test",
  "settings.notifications": "Notifications",
  "settings.notificationsHint": "Alert you even when the tab is in the background.",
  "settings.notificationsOn": "Enabled",
  "settings.notificationsOff": "Blocked in the browser",
  "settings.notificationsEnable": "Enable",
  "settings.shortcuts": "Keyboard shortcuts",

  "sound.chime": "Xylophone",
  "sound.bell": "Bell",
  "sound.digital": "Digital",
  "sound.soft": "Soft",

  "shortcut.toggle": "Start / pause",
  "shortcut.reset": "Reset",
  "shortcut.lap": "Lap (stopwatch)",
  "shortcut.skip": "Skip phase (pomodoro)",
  "shortcut.tabs": "Switch tab",

  "alert.dialog": "Alert",
  "alert.title": "Clock",

  "clock.world": "World clock",
  "clock.addZone": "Add time zone",
  "clock.search": "Search city or zone…",
  "clock.noResults": "No results.",
  "clock.removeZone": "Remove {zone}",
  "clock.sameTime": "same time",
  "clock.ahead": "+{h} h",
  "clock.behind": "−{h} h",

  "pomodoro.focus": "Pomodoro",
  "pomodoro.short": "Short break",
  "pomodoro.long": "Long break",
  "pomodoro.focusSub": "focus",
  "pomodoro.shortSub": "rest",
  "pomodoro.longSub": "relax",
  "pomodoro.focusDone": "Pomodoro done! Time for a break.",
  "pomodoro.breakDone": "Break over. Back to work!",
  "pomodoro.round": "Cycle {n}",
  "pomodoro.completed": "{n} completed today",
  "pomodoro.resetCount": "Reset counter",
  "pomodoro.config": "Configure",
  "pomodoro.minutes": "{label} (min)",
  "pomodoro.longEvery": "Long break every (cycles)",
  "pomodoro.autoStart": "Auto-start next phase",
  "pomodoro.progress": "Progress",

  "countdown.change": "Change date",
  "countdown.done": "Countdown finished!",
  "countdown.arrived": "The moment has come!",
  "countdown.days": "days",

  "timer.running": "running",
  "timer.ready": "ready",
  "timer.paused": "paused",
  "timer.done": "Time's up! ({name})",
  "timer.name": "Timer {n}",
  "timer.new": "New timer",
  "timer.list": "Timers",
  "timer.addMinute": "1 min",
  "timer.addMinuteLabel": "Add 1 minute",
  "timer.preset": "{n} min",

  "stopwatch.lap": "Lap",
  "stopwatch.split": "Split",
  "stopwatch.total": "Total",
  "stopwatch.export": "Export CSV",
  "stopwatch.copy": "Copy",
  "stopwatch.copied": "Laps copied",
  "stopwatch.lapAdded": "Lap {n}: {time}",

  "alarm.add": "Add alarm",
  "alarm.new": "New alarm",
  "alarm.change": "Change time",
  "alarm.empty": "No alarms yet.",
  "alarm.off": "Off",
  "alarm.in": "in {h} h {m} min",
  "alarm.toggle": "Enable alarm {time}",
  "alarm.delete": "Delete alarm {time}",
  "alarm.count": "{n}/{max} alarms",
  "alarm.ring": "Alarm {time}",

  "time.hour": "Hour",
  "time.minutes": "Minutes",
  "time.started": "Started",
  "time.paused": "Paused",
  "time.reset": "Reset",
};

export const LANGS = { es: "Español", en: "English" } as const;
export type Lang = keyof typeof LANGS;

const dicts: Record<Lang, Record<Key, string>> = { es, en };

const detect = (): Lang => {
  const saved = localStorage.getItem("lang");
  if (saved === "es" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
};

export const lang = signal<Lang>(detect());

/** Locale de Intl para fechas y horas */
export const locale = computed(() => (lang.value === "es" ? "es-ES" : "en-US"));

export function t(key: Key, vars: Record<string, string | number> = {}) {
  return dicts[lang.value][key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

// Textos estáticos de Astro: data-i18n (texto) y data-i18n-label (aria-label)
effect(() => {
  const l = lang.value;
  localStorage.setItem("lang", l);
  document.documentElement.lang = l;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n as Key);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nLabel as Key));
  });
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("app.description"));
});
