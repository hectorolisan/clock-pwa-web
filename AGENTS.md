# AGENTS.md

PWA clock: digital clock, pomodoro, countdown, timer, stopwatch, alarms. UI in Spanish.

## Stack

- Astro 7 + Preact (`compat: true`, `react`/`react-dom` aliased to `@preact/compat`)
- shadcn/ui (`radix-nova` style, Radix) + Tailwind CSS 4 (`@tailwindcss/vite`)
- `@preact/signals` for global settings
- `@vite-pwa/astro` (`autoUpdate`, `generateSW`)
- pnpm, TypeScript

## Commands

```bash
pnpm install
pnpm dev       # localhost:4321
pnpm build     # ./dist + service worker + manifest
pnpm preview   # test installable/offline PWA
```

No tests or linter. Verify with `pnpm build`.

## Structure

- `src/pages/index.astro`: Header + `App` island (`client:only`) + Footer.
- `src/components/App.tsx`: tabs synced with URL hash (`#pomodoro`, `#timer`…), global alert banner.
- `src/components/views/`: one view per tool. All stay mounted so they keep running when switching tabs.
- `src/components/ui/`: shadcn components. Add with `pnpm dlx shadcn@latest add <name>`, don't hand-write.
- `src/hooks/useStored.ts`: `localStorage`-persisted state. Timers store `endAt`, so they survive reloads.
- `src/lib/settings.ts`: global settings signal (`h24`, `seconds`), shared across islands.
- `src/lib/alert.ts`: Web Audio beep + system notification.
- `src/lib/time.ts`: time formatting helpers. Respect `h24`/`seconds` settings.
- `src/styles/global.css`: theme tokens (palette `#333b4b`, Geist / Geist Mono / Geist Pixel).
- `astro.config.mjs`: PWA manifest and shortcuts.

## Conventions

- Import alias `@/` → `src/`.
- Use `preact/hooks`, not `react` hooks.
- New state that must survive reload → `useStored`; store absolute timestamps, not remaining time.
- Use theme tokens from `global.css`, not hardcoded colors.
- UI text in Spanish; code and identifiers in English.
- Minimal comments, only when needed.
- Commits: Conventional Commits, English, lowercase (`feat(alarm): ...`, `fix(countdown): ...`).

## Limits

Alarms only ring while the app is open (tab or backgrounded PWA). No push server.
