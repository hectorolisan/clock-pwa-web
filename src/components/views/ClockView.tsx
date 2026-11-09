import { useRef } from "preact/hooks";
import { Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { pad } from "@/lib/time";

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ClockView() {
  const [opts, setOpts] = useStored("clock", { h24: true, seconds: true });
  const panel = useRef<HTMLDivElement>(null);
  const d = new Date(useNow(500));

  const h = opts.h24 ? d.getHours() : d.getHours() % 12 || 12;
  const ampm = opts.h24 ? "" : d.getHours() < 12 ? "AM" : "PM";

  return (
    <div class="flex flex-col gap-6">
      <div ref={panel} class="bg-background">
        <Panel class="min-h-80 justify-center [:fullscreen_&]:h-dvh [:fullscreen_&]:rounded-none [:fullscreen_&]:border-0">
          <Display sub={dateFmt.format(d)}>
            {pad(h)}
            <span class="animate-pulse">:</span>
            {pad(d.getMinutes())}
            {opts.seconds && <span class="text-[0.45em] text-muted-foreground">{pad(d.getSeconds())}</span>}
            {ampm && <span class="ml-2 text-[0.25em] text-muted-foreground">{ampm}</span>}
          </Display>
        </Panel>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-6">
        <Label className="gap-2">
          <Switch checked={opts.h24} onCheckedChange={(h24) => setOpts({ ...opts, h24 })} />
          24 h
        </Label>
        <Label className="gap-2">
          <Switch checked={opts.seconds} onCheckedChange={(seconds) => setOpts({ ...opts, seconds })} />
          Segundos
        </Label>
        <Button variant="outline" onClick={() => panel.current?.requestFullscreen()}>
          <Maximize /> Pantalla completa
        </Button>
      </div>
    </div>
  );
}
