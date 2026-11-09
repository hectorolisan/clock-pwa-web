# clock-web

PWA de reloj: reloj digital, pomodoro, cuenta atrás, temporizador, cronómetro y alarmas.

Stack: Astro 7 + Preact (`compat`) + shadcn/ui (Radix) + Tailwind CSS 4 + `@vite-pwa/astro`.

## Comandos

```bash
pnpm install
pnpm dev       # localhost:4321
pnpm build     # ./dist con service worker y manifest
pnpm preview   # probar la PWA instalable/offline
```

## Estructura

- `src/pages/index.astro` — Header + isla `App` (`client:only`) + Footer.
- `src/components/App.tsx` — pestañas sincronizadas con el hash (`#pomodoro`, `#timer`…) y banner de alerta global.
- `src/components/views/` — una vista por herramienta. Todas quedan montadas para que sigan corriendo al cambiar de pestaña.
- `src/hooks/useStored.ts` — estado persistido en `localStorage`; los temporizadores guardan `endAt`, así sobreviven a recargas.
- `src/lib/alert.ts` — pitido con Web Audio + notificación del sistema.
- `src/styles/global.css` — tokens del tema (paleta `#333b4b`, Geist / Geist Mono / Geist Pixel).

Las alarmas solo suenan con la app abierta (pestaña o PWA en segundo plano), la web no permite despertar sin servidor push.
