# Seshy

**Good Friends. Good Sessions.** A skateboarding app for playing games, tracking tricks and competing with friends. Individual-first and friends-only: no crews, public feeds, public user search or global rankings.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + UI tests (Vitest, Testing Library)
npm run build      # typecheck + production build
```

Stack: Vite, React 19, TypeScript, React Router, CSS Modules, Lucide icons.

## Look & feel: Electric Concrete

Colours live in `src/styles/tokens.css`: background `#101820`, electric cyan `#00C2FF` (navigation, tabs, links, Skate Dice), volt yellow `#D9FF00` (calls to action, wins, the leader, Game of S.K.A.T.E.), concrete white `#F4F7FA` (text), coral `#FF4D6D` (losses, errors). Text/background pairs are checked to WCAG AA.

- **Logo:** `src/assets/brand/seshy-logo.webp`, a transparent brush-lettering logo (white with a volt crown and swoosh). Only `src/components/Logo.tsx` references it, so replacing that one file changes the logo everywhere.
- **Launch screen:** just the logo on the skatepark backdrop, shown once per browser session and then handed to Home. Visit `/welcome` to see it again. There is no sign-in yet, so there's nothing to hide behind it.
- **Backdrop:** `SkateparkBackdrop` draws low-contrast silhouettes (skyline, palms, quarter pipe, rail, bowl) behind every screen.

## Status

All data is **sample data** (fictional skaters and matches), and the app shows a banner saying so. Add `?sample=empty`, `?sample=error` or `?sample=slow` to any URL to preview the empty, error and loading states. The choice is remembered for the tab; `?sample=default` resets it.

| Area | State |
| --- | --- |
| Launch screen, bottom nav (Home, Trickbook, Play, Sessions, Profile), left rail at ≥ 900px | Working |
| Home (stats, live match, games, quick actions, recent games) | Working on sample data; stats are computed from results |
| Play, Current Match, Friends Ranking (all-time / this month / by game), Match History, Match Details | Working on sample data |
| Start a Match | Game, friends (1–4) and rounds can be chosen; **Start is disabled** until live scoring ships. Invite codes are marked "Soon" |
| Profile, Friends list, Settings | Working; editing, notifications, privacy, achievements and help are marked "Soon" |
| Trickbook, Sessions | "Coming soon" placeholders (there is no trick or session feature yet) |

## Code layout

```
src/
  domain/          Pure game logic, no React
    types.ts       Match, events, Standing, the standard MatchResult
    rules/         Game of S.K.A.T.E. + Skate Dice rules (derived from an event log)
    ranking.ts     Friends Ranking
  data/
    repository.ts  SeshyRepository interface: everything the UI reads
    DataProvider   Context + useQuery (loading/error/retry) + usePlayers
    sample/        SAMPLE DATA ONLY: fixtures, a seeded simulator, the sample repository
  assets/brand/    The Seshy logo SVGs
  components/      Reusable UI (nav, buttons, cards, stat strips, rows, backdrop, logo, launch screen)
  screens/         One file per route
  lib/             Formatting and display helpers
```

### Multiplayer-ready design

Matches are an **append-only event log** (`SkateAttempt[]` / `DiceAttempt[]`). Standings, the current turn and the winner are always *derived* from that log by the pure functions in `domain/rules`, which reject out-of-turn moves. So:

- **Pass-and-play** appends events locally.
- **Online** syncs the same events between phones.

Both run the same rules and produce the same `MatchResult` via `toMatchResult()`. Rankings and history only ever read `MatchResult`s.

### Ranking rules

Friends Ranking covers the viewer plus accepted friends only. Only **completed** matches count; in-progress and abandoned matches never do. Sort order is most wins, then higher win rate. Players still tied share a rank and are listed alphabetically.
