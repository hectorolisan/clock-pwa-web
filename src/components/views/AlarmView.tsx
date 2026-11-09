import { useEffect, useState } from "preact/hooks";
import { BellPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { requestNotifications, startAlert, unlockAudio } from "@/lib/alert";
import { settings } from "@/lib/settings";
import { formatHHMM, pad } from "@/lib/time";
import { cn } from "@/lib/utils";

type Alarm = { id: number; time: string; on: boolean };

const MAX = 3;
const DAY = 86_400_000;

/** ms hasta la próxima vez que el reloj marque `time` (HH:MM) */
function untilNext(time: string, now: number) {
  const [h, m] = time.split(":").map(Number);
  const t = new Date(now);
  t.setHours(h, m, 0, 0);
  const diff = t.getTime() - now;
  return diff > 0 ? diff : diff + DAY;
}

const fmtLeft = (ms: number) => {
  const min = Math.ceil(ms / 60_000);
  return `en ${Math.floor(min / 60)} h ${min % 60} min`;
};

export function AlarmView() {
  const [alarms, setAlarms] = useStored<Alarm[]>("alarms", []);
  const [time, setTime] = useState("07:00");
  const [fired, setFired] = useState("");
  const now = useNow(1000);
  const full = alarms.length >= MAX;

  useEffect(() => {
    const d = new Date(now);
    const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const key = `${d.toDateString()} ${hhmm}`;
    if (fired === key) return;
    const ringing = alarms.filter((a) => a.on && a.time === hhmm);
    if (!ringing.length) return;
    setFired(key);
    startAlert(`Alarma ${formatHHMM(hhmm, settings.value.h24)}`);
    setAlarms(alarms.map((a) => (ringing.includes(a) ? { ...a, on: false } : a)));
  }, [now]);

  const add = (e: Event) => {
    e.preventDefault();
    if (full) return;
    unlockAudio();
    requestNotifications();
    const next = [...alarms, { id: Date.now(), time, on: true }];
    setAlarms(next.sort((a, b) => a.time.localeCompare(b.time)));
  };

  return (
    <div class="flex flex-col gap-6">
      <form
        onSubmit={add}
        class="mx-auto flex w-full max-w-xl flex-wrap items-end gap-3 rounded-xl border bg-muted/50 p-4"
      >
        <label class="flex flex-1 flex-col gap-2">
          <span class="eyebrow text-muted-foreground">Hora</span>
          <Input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.currentTarget.value)}
            className="font-mono"
          />
        </label>
        <Button type="submit" disabled={full}>
          <BellPlus /> Añadir
        </Button>
      </form>

      {alarms.length === 0 ? (
        <p class="text-center font-mono text-xs text-muted-foreground">Sin alarmas todavía.</p>
      ) : (
        <ul class="mx-auto flex w-full max-w-xl flex-col divide-y border-y">
          {alarms.map((a) => (
            <li key={a.id} class="flex items-center gap-4 py-4">
              <div class="flex-1">
                <p class={cn("font-pixel text-4xl tabular-nums", !a.on && "text-muted-foreground")}>
                  {formatHHMM(a.time, settings.value.h24)}
                </p>
                <p class="mt-1 font-mono text-xs text-muted-foreground">
                  {a.on ? fmtLeft(untilNext(a.time, now)) : "Desactivada"}
                </p>
              </div>
              <Switch
                checked={a.on}
                aria-label="Activar"
                onCheckedChange={(on) => setAlarms(alarms.map((x) => (x.id === a.id ? { ...x, on } : x)))}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Eliminar"
                onClick={() => setAlarms(alarms.filter((x) => x.id !== a.id))}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p class="eyebrow text-center text-muted-foreground">
        {alarms.length}/{MAX} alarmas
      </p>
    </div>
  );
}
