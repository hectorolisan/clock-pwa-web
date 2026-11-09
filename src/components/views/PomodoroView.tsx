import { useEffect } from "preact/hooks";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const cfg = { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false };

export function PomodoroView() {
  const [st, setSt] = useStored("pomodoro", {
    mode: "focus" as Mode,
    round: 1,
    endAt: null as number | null,
    left: cfg.focus * 60_000,
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

  return (
    <div class="flex flex-1 flex-col gap-6">
      <Panel>
        <div class="flex flex-wrap justify-center gap-1">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <Button key={m} size="sm" variant={m === st.mode ? "secondary" : "ghost"} onClick={() => go(m)}>
              {MODES[m]}
            </Button>
          ))}
        </div>

        <Display sub={{ focus: "concéntrate", short: "descansa", long: "relájate" }[st.mode]}>
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
    </div>
  );
}
