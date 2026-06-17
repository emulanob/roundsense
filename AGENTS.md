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

**Always commit to a feature branch and open a PR — never push directly to main.**

Workflow:

1. Make changes and commit on a feature branch (e.g. `fix/description` or `feat/description`)
2. Show `git diff origin/main..HEAD` and wait for explicit user approval
3. Push the branch and open a PR with `gh pr create`

Do not add `Co-Authored-By` lines to commit messages.

The `main` branch has a GitHub ruleset enforcing PRs + 1 approval. The repo owner has a bypass actor configured, so direct pushes are technically possible but should not be used.

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

- Engine tests: `tests/economy.test.ts` — 42 tests, `environment: node` (default)
- Hook tests: `tests/useGameState.test.tsx` — 21 tests, declare `// @vitest-environment jsdom` at the top of the file
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

- **CI**: GitHub Actions (`.github/workflows/ci.yml`) — runs on every push to `main` and on every PR targeting `main`. Steps: `npm ci → lint → typecheck → test --coverage → build`. Must stay green.
- **Hosting**: Vercel, connected to the GitHub repo. Every push to `main` triggers a production deploy automatically. Every PR gets a preview URL. Live at [roundsense.vercel.app](https://roundsense.vercel.app).

---

## Backlog / issue management

GitHub Issues is the product backlog. Three templates are configured (blank issues disabled):

- **Bug report** — `[Bug]` prefix, `bug` label
- **Feature request** — `[Feature]` prefix, `enhancement` label
- **Economy rule change** — `[Economy]` prefix, `economy,patch` labels — use this whenever a CS2 patch changes money values

---

## Dependency notes

- `vitest` and `@vitest/coverage-v8` are on v4.x; `vite` is on v6.x; `@vitejs/plugin-react` is on v5.x. These three must be upgraded together — `@vitejs/plugin-react` v6 requires vite v8 only, so do not jump to vite v7/8 without also upgrading `@vitejs/plugin-react` to v6+.
- `lint-staged` is pinned to v15.x — v17+ requires Node ≥22, CI runs Node 20.
- Packages were installed with `--legacy-peer-deps` due to peer dep conflicts. If adding new packages, use the same flag to keep the lockfile consistent.
