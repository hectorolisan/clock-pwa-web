import { useEffect, useState } from "preact/hooks";
import { AlarmClock, BellRing, CalendarClock, Clock, Hourglass, Timer, Watch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { alertMessage, stopAlert } from "@/lib/alert";
import { ClockView } from "./views/ClockView";
import { PomodoroView } from "./views/PomodoroView";
import { CountdownView } from "./views/CountdownView";
import { TimerView } from "./views/TimerView";
import { StopwatchView } from "./views/StopwatchView";
import { AlarmView } from "./views/AlarmView";

const TABS = [
  { id: "clock", label: "Reloj", icon: Clock, View: ClockView },
  { id: "pomodoro", label: "Pomodoro", icon: Timer, View: PomodoroView },
  { id: "countdown", label: "Cuenta atrás", icon: CalendarClock, View: CountdownView },
  { id: "timer", label: "Temporizador", icon: Hourglass, View: TimerView },
  { id: "stopwatch", label: "Cronómetro", icon: Watch, View: StopwatchView },
  { id: "alarm", label: "Alarma", icon: AlarmClock, View: AlarmView },
];

const fromHash = () => {
  const h = location.hash.slice(1);
  return TABS.some((t) => t.id === h) ? h : "clock";
};

export default function App() {
  const [tab, setTab] = useState(fromHash);

  useEffect(() => {
    const onHash = () => setTab(fromHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  const select = (id: string) => {
    setTab(id);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      {alertMessage.value && (
        <div
          role="alert"
          class="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-background p-4 shadow-lg"
        >
          <BellRing className="size-5 animate-bounce text-brand" />
          <p class="flex-1 text-sm font-medium">{alertMessage.value}</p>
          <Button size="sm" onClick={stopAlert}>
            Parar
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={select} className="gap-8">
        <TabsList
          variant="line"
          className="mx-auto max-w-full justify-start overflow-x-auto overflow-y-hidden pb-1.5 [scrollbar-width:none] group-data-horizontal/tabs:h-auto [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="px-3 font-mono text-xs" aria-label={label}>
              <Icon /> <span class="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ id, View }) => (
          <TabsContent key={id} value={id} forceMount className="data-[state=inactive]:hidden">
            <View />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
