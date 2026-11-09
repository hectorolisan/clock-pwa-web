import { useEffect, useRef } from "preact/hooks";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { requestNotifications, startAlert, unlockAudio } from "@/lib/alert";
import { settings } from "@/lib/settings";
import { pad } from "@/lib/time";

const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const nextNewYear = () => toLocalInput(new Date(new Date().getFullYear() + 1, 0, 1));

export function CountdownView() {
  const [st, setSt] = useStored("countdown", { target: nextNewYear(), done: false });
  const picker = useRef<HTMLInputElement>(null);
  const now = useNow(250);
  const left = Math.max(0, new Date(st.target).getTime() - now);

  useEffect(() => {
    if (!left && !st.done) {
      setSt({ ...st, done: true });
      startAlert("¡Cuenta atrás terminada!");
    }
  }, [left]);

  const openPicker = () => {
    unlockAudio();
    requestNotifications();
    const el = picker.current;
    el?.showPicker ? el.showPicker() : el?.focus();
  };

  const s = Math.floor(left / 1000);

  return (
    <Panel>
      <Display sub={!left && "¡Llegó el momento!"}>
        {pad(s / 86400)}
        <span class="ml-[0.4em]">{pad((s / 3600) % 24)}</span>
        <span class="animate-pulse">:</span>
        {pad((s / 60) % 60)}
        {settings.value.seconds && <span class="text-[0.45em] text-muted-foreground">{pad(s % 60)}</span>}
      </Display>

      <div class="relative">
        <Button variant="outline" onClick={openPicker}>
          <CalendarClock /> Cambiar fecha
        </Button>
        {/* Input oculto: solo aporta el selector nativo de fecha */}
        <input
          ref={picker}
          type="datetime-local"
          tabIndex={-1}
          aria-hidden="true"
          value={st.target}
          onChange={(e) => setSt({ ...st, target: e.currentTarget.value, done: false })}
          class="pointer-events-none absolute inset-x-0 bottom-0 h-0 opacity-0"
        />
      </div>
    </Panel>
  );
}
