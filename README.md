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

## Status (Phase 1 — UI foundation)

All data is **sample data** (fictional skaters and matches), and the app shows a banner saying so. Add `?sample=empty`, `?sample=error` or `?sample=slow` to any URL to preview the empty, error and loading states. The choice is remembered for the tab; `?sample=default` resets it.

| Area | State |
| --- | --- |
| Bottom nav (Home, Trickbook, Play, Sessions, Profile) | Working; becomes a left rail at ≥ 900px |
| Play, Current Match, Friends Ranking, Match History, Match Details | Working on sample data |
| Start a Match | Game picker and rules work; mode picker and **Start** are disabled until live gameplay ships |
| Trickbook, Sessions, Achievements, Edit Profile | Marked "Coming soon" |

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
  components/      Reusable UI (nav, buttons, panels, stickers, rows, states)
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
