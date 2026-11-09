import { useEffect, useState } from "preact/hooks";
import { BellPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { requestNotifications, startAlert, unlockAudio } from "@/lib/alert";
import { pad } from "@/lib/time";
import { cn } from "@/lib/utils";

type Alarm = { id: number; time: string; label: string; on: boolean; daily: boolean };

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
  const [draft, setDraft] = useState({ time: "07:00", label: "" });
  const [fired, setFired] = useState("");
  const now = useNow(1000);

  const update = (id: number, patch: Partial<Alarm>) =>
    setAlarms(alarms.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  useEffect(() => {
    const d = new Date(now);
    const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const key = `${d.toDateString()} ${hhmm}`;
    if (fired === key) return;
    const ringing = alarms.filter((a) => a.on && a.time === hhmm);
    if (!ringing.length) return;
    setFired(key);
    startAlert(ringing.map((a) => a.label || `Alarma ${a.time}`).join(" · "));
    setAlarms(alarms.map((a) => (ringing.includes(a) && !a.daily ? { ...a, on: false } : a)));
  }, [now]);

  const add = (e: Event) => {
    e.preventDefault();
    unlockAudio();
    requestNotifications();
    const next = [...alarms, { id: Date.now(), ...draft, on: true, daily: false }];
    setAlarms(next.sort((a, b) => a.time.localeCompare(b.time)));
    setDraft({ ...draft, label: "" });
  };

  return (
    <div class="flex flex-col gap-6">
      <form
        onSubmit={add}
        class="mx-auto flex w-full max-w-xl flex-wrap items-end gap-3 rounded-xl border bg-muted/50 p-4"
      >
        <label class="flex flex-col gap-2">
          <span class="eyebrow text-muted-foreground">Hora</span>
          <Input
            type="time"
            required
            value={draft.time}
            onChange={(e) => setDraft({ ...draft, time: e.currentTarget.value })}
            className="w-32 font-mono"
          />
        </label>
        <label class="flex min-w-40 flex-1 flex-col gap-2">
          <span class="eyebrow text-muted-foreground">Etiqueta</span>
          <Input
            value={draft.label}
            maxLength={40}
            placeholder="Despertar"
            onInput={(e) => setDraft({ ...draft, label: e.currentTarget.value })}
          />
        </label>
        <Button type="submit">
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
                <p class={cn("font-pixel text-4xl tabular-nums", !a.on && "text-muted-foreground")}>{a.time}</p>
                <p class="mt-1 font-mono text-xs text-muted-foreground">
                  {a.label || "Alarma"}
                  {a.on && ` · ${fmtLeft(untilNext(a.time, now))}`}
                </p>
              </div>
              <label class="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Switch size="sm" checked={a.daily} onCheckedChange={(daily) => update(a.id, { daily })} />
                Diaria
              </label>
              <Switch checked={a.on} aria-label="Activar" onCheckedChange={(on) => update(a.id, { on })} />
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
    </div>
  );
}
