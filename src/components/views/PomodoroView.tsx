import { useEffect } from "preact/hooks";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { startAlert, unlockAudio, requestNotifications } from "@/lib/alert";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";

type Mode = "focus" | "short" | "long";

const MODES: Record<Mode, string> = {
  focus: "Pomodoro",
  short: "Pausa corta",
  long: "Pausa larga",
};

const DEFAULTS = { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false };

export function PomodoroView() {
  const [cfg, setCfg] = useStored("pomodoro-config", DEFAULTS);
  const [st, setSt] = useStored("pomodoro", {
    mode: "focus" as Mode,
    round: 1,
    endAt: null as number | null,
    left: DEFAULTS.focus * 60_000,
  });

  const now = useNow(250, st.endAt !== null);
  const left = st.endAt ? st.endAt - now : st.left;
  const total = cfg[st.mode] * 60_000;

  const go = (mode: Mode, round = st.round, run = false) => {
    const ms = cfg[mode] * 60_000;
    setSt({ mode, round, left: ms, endAt: run ? Date.now() + ms : null });
  };

  const next = (auto: boolean) => {
    if (st.mode === "focus") {
      go(st.round % cfg.longEvery === 0 ? "long" : "short", st.round, auto);
    } else {
      go("focus", st.round + 1, auto);
    }
  };

  useEffect(() => {
    if (st.endAt && left <= 0) {
      startAlert(st.mode === "focus" ? "¡Pomodoro terminado! Toca descansar." : "Pausa terminada. ¡A trabajar!");
      next(cfg.autoStart);
    }
  }, [left]);

  useEffect(() => {
    if (!st.endAt) return;
    const prev = document.title;
    document.title = `${formatDuration(left)} · ${MODES[st.mode]}`;
    return () => void (document.title = prev);
  });

  const toggle = () => {
    unlockAudio();
    requestNotifications();
    setSt(st.endAt ? { ...st, endAt: null, left } : { ...st, endAt: Date.now() + st.left });
  };

  const setMin = (key: Mode, v: string) => {
    const n = Math.min(180, Math.max(1, Number(v) || 1));
    setCfg({ ...cfg, [key]: n });
    if (key === st.mode && !st.endAt) setSt({ ...st, left: n * 60_000 });
  };

  return (
    <div class="flex flex-col gap-6">
      <Panel>
        <div class="flex flex-wrap justify-center gap-1">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <Button key={m} size="sm" variant={m === st.mode ? "secondary" : "ghost"} onClick={() => go(m)}>
              {MODES[m]}
            </Button>
          ))}
        </div>

        <Display sub={st.mode === "focus" ? `#${st.round} · concéntrate` : `#${st.round} · descansa`}>
          {formatDuration(left)}
        </Display>

        <div class="h-1 w-full max-w-md overflow-hidden rounded-full bg-border">
          <div
            class="h-full bg-primary transition-[width] dark:bg-brand"
            style={{ width: `${(1 - left / total) * 100}%` }}
          />
        </div>

        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon-lg" aria-label="Reiniciar" onClick={() => go(st.mode)}>
            <RotateCcw />
          </Button>
          <Button size="lg" className={cn("h-12 w-40 text-base")} onClick={toggle}>
            {st.endAt ? <Pause /> : <Play />}
            {st.endAt ? "Pausar" : "Empezar"}
          </Button>
          <Button variant="ghost" size="icon-lg" aria-label="Saltar" onClick={() => next(false)}>
            <SkipForward />
          </Button>
        </div>
      </Panel>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <Label key={m} className="flex-col items-start gap-2">
            <span class="eyebrow text-muted-foreground">{MODES[m]} (min)</span>
            <Input type="number" min={1} max={180} value={cfg[m]} onChange={(e) => setMin(m, e.currentTarget.value)} />
          </Label>
        ))}
        <Label className="flex-col items-start gap-2">
          <span class="eyebrow text-muted-foreground">Pausa larga cada</span>
          <Input
            type="number"
            min={2}
            max={12}
            value={cfg.longEvery}
            onChange={(e) => setCfg({ ...cfg, longEvery: Math.max(2, Number(e.currentTarget.value) || 4) })}
          />
        </Label>
      </div>
      <Label className="gap-2 self-center">
        <Switch checked={cfg.autoStart} onCheckedChange={(autoStart) => setCfg({ ...cfg, autoStart })} />
        Encadenar automáticamente
      </Label>
    </div>
  );
}
