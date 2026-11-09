import { useEffect } from "preact/hooks";
import { Input } from "@/components/ui/input";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { requestNotifications, startAlert, unlockAudio } from "@/lib/alert";
import { pad } from "@/lib/time";

const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const nextNewYear = () => toLocalInput(new Date(new Date().getFullYear() + 1, 0, 1));

export function CountdownView() {
  const [st, setSt] = useStored("countdown", { target: nextNewYear(), label: "Año nuevo", done: false });
  const now = useNow(250);
  const left = Math.max(0, new Date(st.target).getTime() - now);

  useEffect(() => {
    if (!left && !st.done) {
      setSt({ ...st, done: true });
      startAlert(`¡${st.label || "Cuenta atrás"}!`);
    }
  }, [left]);

  const s = Math.floor(left / 1000);

  return (
    <div class="flex flex-col gap-6">
      <Panel class="min-h-80 justify-center">
        <input
          value={st.label}
          maxLength={40}
          placeholder="Cuenta atrás"
          aria-label="Nombre del evento"
          onInput={(e) => setSt({ ...st, label: e.currentTarget.value })}
          class="eyebrow w-full max-w-md rounded-md bg-transparent py-1 text-center text-muted-foreground outline-none placeholder:text-muted-foreground/60 hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Display sub={!left && "¡Llegó el momento!"}>
          {pad(s / 86400)}
          <span class="animate-pulse">:</span>
          {pad((s / 3600) % 24)}:{pad((s / 60) % 60)}
          <span class="text-[0.45em] text-muted-foreground">{pad(s % 60)}</span>
        </Display>
      </Panel>

      <label class="mx-auto flex w-full max-w-xs flex-col gap-2">
        <span class="eyebrow text-muted-foreground">Fecha y hora</span>
        <Input
          type="datetime-local"
          value={st.target}
          onChange={(e) => {
            unlockAudio();
            requestNotifications();
            setSt({ ...st, target: e.currentTarget.value, done: false });
          }}
        />
      </label>
    </div>
  );
}
