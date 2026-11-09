import type { ComponentType } from "preact";
import { useEffect, useState } from "preact/hooks";
import { AlarmClock, BellRing, CalendarClock, Clock, Hourglass, Timer, Watch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { alertMessage, stopAlert } from "@/lib/alert";
import { baseTitle } from "@/lib/title";
import { t } from "@/lib/i18n";
import { announcement } from "@/lib/announce";
import { activeTab } from "@/lib/status";
import { shouldIgnore } from "@/hooks/useShortcuts";
import { ClockView } from "./views/ClockView";
import { PomodoroView } from "./views/PomodoroView";
import { CountdownView } from "./views/CountdownView";
import { TimerView } from "./views/TimerView";
import { StopwatchView } from "./views/StopwatchView";
import { AlarmView } from "./views/AlarmView";

type ViewComponent = ComponentType<{ active: boolean }>;

const TABS = [
  { id: "clock", icon: Clock, View: ClockView as ViewComponent },
  { id: "pomodoro", icon: Timer, View: PomodoroView as ViewComponent },
  { id: "countdown", icon: CalendarClock, View: CountdownView as ViewComponent },
  { id: "timer", icon: Hourglass, View: TimerView as ViewComponent },
  { id: "stopwatch", icon: Watch, View: StopwatchView as ViewComponent },
  { id: "alarm", icon: AlarmClock, View: AlarmView as ViewComponent },
] as const;

const label = (id: (typeof TABS)[number]["id"]) => t(`tab.${id}`);

const fromHash = () => {
  const h = location.hash.slice(1);
  return TABS.find((x) => x.id === h)?.id ?? "clock";
};

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(fromHash);

  useEffect(() => {
    const onHash = () => setTab(fromHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    baseTitle.value = `${label(tab)} · clock-pwa-web`;
    activeTab.value = tab;
  }, [tab, label(tab)]);

  const select = (id: string) => {
    setTab(id as typeof tab);
    history.replaceState(null, "", `#${id}`);
  };

  // 1-6 cambian de pestaña
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (shouldIgnore(e) || !TABS[i]) return;
      setTab(TABS[i].id);
      history.replaceState(null, "", `#${TABS[i].id}`);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <p role="status" aria-live="polite" class="sr-only">
        {announcement.value}
      </p>

      {alertMessage.value && (
        <div class="fixed inset-0 z-50 grid animate-in place-items-center bg-black/50 p-4 backdrop-blur-sm duration-300 fade-in">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={alertMessage.value}
            class="flex w-full max-w-sm flex-col items-center gap-6 rounded-xl border bg-background p-8 text-center shadow-lg"
          >
            <BellRing className="size-10 text-brand motion-safe:animate-bounce" aria-hidden="true" />
            <p class="font-pixel text-2xl">{alertMessage.value}</p>
            <Button size="lg" className="h-12 w-full text-base" onClick={stopAlert} autoFocus>
              {t("action.stop")}
            </Button>
          </div>
        </div>
      )}

      <Tabs value={tab} onValueChange={select} className="min-h-0 flex-1 gap-8">
        <TabsList
          variant="line"
          className="mx-auto max-w-full [scrollbar-width:none] justify-start overflow-x-auto overflow-y-hidden pb-1.5 group-data-horizontal/tabs:h-auto [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map(({ id, icon: Icon }, i) => (
            <TabsTrigger
              key={id}
              value={id}
              className="px-3 font-mono text-xs"
              aria-label={label(id)}
              aria-keyshortcuts={String(i + 1)}
            >
              <Icon aria-hidden="true" /> <span class="hidden sm:inline">{label(id)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ id, View }) => (
          <TabsContent
            key={id}
            value={id}
            forceMount
            className="flex min-h-0 flex-col duration-300 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=inactive]:hidden motion-reduce:animate-none"
          >
            <View active={tab === id} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
