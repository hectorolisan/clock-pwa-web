import { useEffect, useState } from "preact/hooks";
import { BellPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TimeDialog } from "@/components/TimeDialog";
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
  const [editing, setEditing] = useState<number | "new" | null>(null);
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

  const save = (time: string) => {
    const next =
      editing === "new"
        ? [...alarms, { id: Date.now(), time, on: true }]
        : alarms.map((a) => (a.id === editing ? { ...a, time, on: true } : a));
    setAlarms(next.sort((a, b) => a.time.localeCompare(b.time)));
  };

  const add = () => {
    unlockAudio();
    requestNotifications();
    setEditing("new");
  };

  return (
    <div class="flex flex-col gap-6">
      <Button size="lg" className="mx-auto h-12 w-48 text-base" disabled={full} onClick={add}>
        <BellPlus /> Añadir alarma
      </Button>

      {alarms.length === 0 ? (
        <p class="text-center font-mono text-xs text-muted-foreground">Sin alarmas todavía.</p>
      ) : (
        <ul class="mx-auto flex w-full max-w-xl flex-col divide-y border-y">
          {alarms.map((a) => (
            <li key={a.id} class="flex items-center gap-4 py-4">
              <div class="flex-1">
                <button
                  type="button"
                  aria-label="Cambiar hora"
                  onClick={() => setEditing(a.id)}
                  class={cn(
                    "rounded-md font-pixel text-4xl text-primary tabular-nums transition-opacity outline-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-foreground",
                    !a.on && "text-muted-foreground dark:text-muted-foreground",
                  )}
                >
                  {formatHHMM(a.time, settings.value.h24)}
                </button>
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

      <TimeDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Nueva alarma" : "Cambiar hora"}
        value={alarms.find((a) => a.id === editing)?.time ?? "07:00"}
        onConfirm={save}
      />
    </div>
  );
}
