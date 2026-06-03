# Agent Guide — RoundSense

CS2 second-screen economy tracker. Players, coaches, and IGLs input round results to get a prediction of what the opponent will buy next round (eco / half buy / full buy / pistol).

Built with React + Vite + TypeScript. Hosted on Vercel. Backlog managed via GitHub Issues.

---

## Commands

```bash
npm run dev          # local dev server at http://localhost:5173
npm test             # run all tests (vitest)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint src tests
npm run format       # prettier --write .
npm run build        # tsc + vite build
```

---

## Commit and push conventions

**Always show a `git diff` and wait for explicit user approval before pushing to main.**

Use `git diff HEAD~1 HEAD` (or `git diff origin/main..HEAD` if multiple commits are pending) and present it inline. Do not push until the user says yes.

Do not add `Co-Authored-By` lines to commit messages.

The `main` branch has a GitHub ruleset enforcing PRs + 1 approval. The repo owner has a bypass actor configured, so direct pushes work but will show a "Bypassed rule violations" notice — that's expected.

---

## Project structure

```
src/
  engine/
    types.ts        ← shared type contracts — edit carefully, tests depend on them
    constants.ts    ← all CS2 economy numbers live here (loss bonuses, buy costs, etc.)
    economy.ts      ← pure functions: initEconomy, updateEconomy, predictBuy
  components/       ← React UI components (presentational)
  hooks/
    useGameState.ts ← wires the engine to React state; manages score and history
  App.tsx
  main.tsx
tests/
  economy.test.ts       ← 37 tests, engine only, vitest environment: node
  useGameState.test.tsx ← 12 tests, hook, vitest environment: jsdom
```

The engine (`src/engine/`) is a pure TypeScript module with no React dependencies. It is the core of the app — keep it well-tested and free of side effects.

---

## Testing conventions

- Engine tests: `tests/economy.test.ts` — use `environment: node` (default)
- Hook tests: `tests/useGameState.test.tsx` — declare `// @vitest-environment jsdom` at the top of the file
- Coverage is enforced on `src/engine/**` with an 80% floor (currently at 100%)
- All assertions in economy tests use `opponentSurvivors: 0` so the survivor discount is zero and expected money values are exactly computable from constants

Run with coverage: `npx vitest run --coverage`

---

## CS2 economy rules (engine)

Key values in `src/engine/constants.ts`:

| Constant                      | Value                          | Notes                                    |
| ----------------------------- | ------------------------------ | ---------------------------------------- |
| `PISTOL_ROUND_MONEY`          | $800                           | Rounds 1 and 13                          |
| `HALFTIME_ROUND`              | 13                             | MR12 format                              |
| `WIN_REWARD`                  | $3,250                         | Both sides                               |
| `LOSS_BONUS_LADDER`           | [1400, 1900, 2400, 2900, 3400] | Indexed by consecutive loss count        |
| `BOMB_PLANT_BONUS_PER_PLAYER` | $160                           | T side only, regardless of round outcome |
| `MAX_MONEY`                   | $16,000                        | Per player cap                           |

If a CS2 patch changes these values, update `constants.ts` and the corresponding test expected values in `economy.test.ts`. Use the **Economy rule change** issue template on GitHub to track it.

---

## CI / hosting

- **CI**: GitHub Actions (`.github/workflows/ci.yml`) — runs on every push to `main`. Steps: `npm ci → lint → typecheck → test --coverage → build`. Must stay green.
- **Hosting**: Vercel, connected to the GitHub repo. Every push to `main` triggers a production deploy automatically. Every PR gets a preview URL. Live at [roundsense.vercel.app](https://roundsense.vercel.app).

---

## Backlog / issue management

GitHub Issues is the product backlog. Three templates are configured (blank issues disabled):

- **Bug report** — `[Bug]` prefix, `bug` label
- **Feature request** — `[Feature]` prefix, `enhancement` label
- **Economy rule change** — `[Economy]` prefix, `economy,patch` labels — use this whenever a CS2 patch changes money values

---

## Dependency notes

- `vitest` and `@vitest/coverage-v8` are pinned to v2.x to stay compatible with `vite` v5. Do not upgrade vitest to v4+ without also upgrading vite to v6+ (and `@vitejs/plugin-react` to v5+).
- `lint-staged` is pinned to v15.x — v17+ requires Node ≥22, CI runs Node 20.
- Packages were installed with `--legacy-peer-deps` due to vitest/vite peer dep conflicts. If adding new packages, use the same flag to keep the lockfile consistent.
