import { useEffect } from "preact/hooks";
import { Pause, Play, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { startAlert, unlockAudio, requestNotifications } from "@/lib/alert";
import { formatDuration } from "@/lib/time";

const PRESETS = [1, 3, 5, 10, 15, 30, 60];
const UNITS = [
  { key: "h", label: "Horas", max: 99, ms: 3_600_000 },
  { key: "m", label: "Minutos", max: 59, ms: 60_000 },
  { key: "s", label: "Segundos", max: 59, ms: 1000 },
] as const;

export function TimerView() {
  const [st, setSt] = useStored("timer", {
    duration: 5 * 60_000,
    left: 5 * 60_000,
    endAt: null as number | null,
  });

  const now = useNow(200, st.endAt !== null);
  const left = st.endAt ? st.endAt - now : st.left;
  const idle = !st.endAt && st.left === st.duration;

  useEffect(() => {
    if (st.endAt && left <= 0) {
      setSt({ ...st, endAt: null, left: st.duration });
      startAlert("¡Tiempo!");
    }
  }, [left]);

  const set = (duration: number) => setSt({ duration, left: duration, endAt: null });

  const toggle = () => {
    if (left <= 0) return;
    unlockAudio();
    requestNotifications();
    setSt(st.endAt ? { ...st, endAt: null, left } : { ...st, endAt: Date.now() + st.left });
  };

  const add = (ms: number) =>
    setSt(st.endAt ? { ...st, endAt: st.endAt + ms } : { ...st, left: st.left + ms, duration: st.duration + ms });

  const part = (ms: number) => Math.floor(st.duration / ms) % (ms === 3_600_000 ? 100 : 60);

  return (
    <div class="flex flex-col gap-6">
      <Panel>
        <Display sub={st.endAt ? "en marcha" : idle ? "listo" : "en pausa"}>
          {formatDuration(left, { hours: st.duration >= 3_600_000 })}
        </Display>

        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon-lg" aria-label="Reiniciar" onClick={() => set(st.duration)}>
            <RotateCcw />
          </Button>
          <Button size="lg" className="h-12 w-40 text-base" onClick={toggle}>
            {st.endAt ? <Pause /> : <Play />}
            {st.endAt ? "Pausar" : idle ? "Empezar" : "Reanudar"}
          </Button>
          <Button variant="ghost" size="lg" onClick={() => add(60_000)}>
            <Plus /> 1 min
          </Button>
        </div>
      </Panel>

      <div class="flex flex-wrap items-end justify-center gap-3">
        {UNITS.map((u) => (
          <label key={u.key} class="flex w-24 flex-col gap-2">
            <span class="eyebrow text-muted-foreground">{u.label}</span>
            <Input
              type="number"
              min={0}
              max={u.max}
              disabled={!idle}
              value={part(u.ms)}
              onChange={(e) => {
                const v = Math.min(u.max, Math.max(0, Number(e.currentTarget.value) || 0));
                set(st.duration + (v - part(u.ms)) * u.ms || 1000);
              }}
            />
          </label>
        ))}
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        {PRESETS.map((m) => (
          <Button key={m} variant="outline" size="sm" className="rounded-full font-mono" onClick={() => set(m * 60_000)}>
            {m} min
          </Button>
        ))}
      </div>
    </div>
  );
}
