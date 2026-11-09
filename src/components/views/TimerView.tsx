import { useEffect } from "preact/hooks";
import { Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { startAlert, unlockAudio, requestNotifications } from "@/lib/alert";
import { formatDuration } from "@/lib/time";
import {
  MINUTE,
  addTime,
  createCountdown,
  isIdle,
  remaining,
  reset,
  toggle as toggleCountdown,
  type Countdown,
} from "@/lib/timer";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useStatus } from "@/lib/status";

const PRESETS = [1, 5, 10, 15, 20, 30, 60];
const MAX = 6;

type Timer = Countdown & { id: number; n: number };

const newTimer = (n: number, duration = 5 * MINUTE): Timer => ({ id: Date.now(), n, ...createCountdown(duration) });

export function TimerView({ active }: { active: boolean }) {
  const [st, setSt] = useStored("timers", { items: [newTimer(1)], selected: 0 });
  const { items } = st;
  const sel = items.find((x) => x.id === st.selected) ?? items[0];

  const now = useNow(
    200,
    items.some((x) => x.endAt),
  );
  const left = remaining(sel, now);
  const idle = isIdle(sel);

  const update = (id: number, fn: (x: Timer) => Timer) =>
    setSt({ ...st, items: items.map((x) => (x.id === id ? fn(x) : x)) });

  useEffect(() => {
    const done = items.filter((x) => x.endAt && x.endAt <= now);
    if (!done.length) return;
    setSt({ ...st, items: items.map((x) => (done.includes(x) ? reset(x) : x) as Timer) });
    startAlert(t("timer.done", { name: done.map((x) => t("timer.name", { n: x.n })).join(", ") }));
  }, [now]);

  const toggle = () => {
    if (left <= 0) return;
    unlockAudio();
    requestNotifications();
    update(sel.id, (x) => ({ ...x, ...toggleCountdown(x, Date.now()) }));
  };

  const resetSel = () => update(sel.id, (x) => reset(x) as Timer);

  useShortcuts(active, { toggle, reset: resetSel });

  const running = sel.endAt ? sel : items.find((x) => x.endAt);
  const runLeft = running ? remaining(running, now) : 0;
  useStatus(
    "timer",
    running
      ? {
          text: `${formatDuration(runLeft)} · ${t("timer.name", { n: running.n })}`,
          progress: 1 - runLeft / running.duration,
        }
      : null,
  );

  const add = () => {
    const n = Math.max(0, ...items.map((x) => x.n)) + 1;
    const timer = newTimer(n);
    setSt({ items: [...items, timer], selected: timer.id });
  };

  const remove = () => {
    const rest = items.filter((x) => x.id !== sel.id);
    setSt({ items: rest, selected: rest[0].id });
  };

  return (
    <Panel>
      <div role="group" aria-label={t("timer.list")} class="flex flex-wrap justify-center gap-1">
        {items.map((x) => {
          const running = x.endAt !== null;
          return (
            <Button
              key={x.id}
              size="sm"
              aria-pressed={x.id === sel.id}
              variant={x.id === sel.id ? "secondary" : "ghost"}
              className="font-mono text-xs"
              onClick={() => setSt({ ...st, selected: x.id })}
            >
              <span class={cn("size-1.5 rounded-full", running ? "bg-emerald-500" : "bg-border")} aria-hidden="true" />
              {t("timer.name", { n: x.n })}
              {x.id !== sel.id && !isIdle(x) && (
                <span class="text-muted-foreground">{formatDuration(remaining(x, now))}</span>
              )}
            </Button>
          );
        })}
        <Button size="icon-sm" variant="ghost" aria-label={t("timer.new")} disabled={items.length >= MAX} onClick={add}>
          <Plus />
        </Button>
      </div>

      <Display sub={sel.endAt ? t("timer.running") : idle ? t("timer.ready") : t("timer.paused")}>
        {formatDuration(left, { hours: sel.duration >= 3_600_000 })}
      </Display>

      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon-lg" aria-label={t("action.reset")} onClick={resetSel}>
          <RotateCcw />
        </Button>
        <Button size="lg" className="h-12 w-40 text-base" onClick={toggle}>
          {sel.endAt ? <Pause /> : <Play />}
          {sel.endAt ? t("action.pause") : idle ? t("action.start") : t("action.resume")}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          aria-label={t("timer.addMinuteLabel")}
          onClick={() => update(sel.id, (x) => addTime(x, MINUTE) as Timer)}
        >
          <Plus /> {t("timer.addMinute")}
        </Button>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        {PRESETS.map((m) => (
          <Button
            key={m}
            variant="outline"
            size="sm"
            className="rounded-full font-mono"
            onClick={() => update(sel.id, (x) => ({ ...x, ...createCountdown(m * MINUTE) }))}
          >
            {t("timer.preset", { n: m })}
          </Button>
        ))}
      </div>

      {items.length > 1 && (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={remove}>
          <Trash2 /> {t("action.delete")}
        </Button>
      )}
    </Panel>
  );
}
