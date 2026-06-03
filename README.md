# RoundSense — CS2 Economy Tracker

Track your CS2 match economy round by round and predict what the enemy team can afford next round.

![RoundSense screenshot](https://roundsense.vercel.app)

## What it does

After each round, enter:
- **Outcome** — did we win or lose?
- **Opponent survivors** — how many enemies made it out alive?
- **Bomb planted?** — yes or no

RoundSense calculates the opponent's estimated money and tells you whether to expect an **eco**, **half-buy**, or **full buy** next round.

## Live site

[roundsense.vercel.app](https://roundsense.vercel.app)

## Run locally

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run build      # production build
npm run test       # run tests
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

## Tech stack

- React 18 + TypeScript
- Vite
- Vitest + Testing Library

## Economy model

RoundSense uses the CS2 MR12 economy rules:
- Win reward: $3,250
- Loss bonus ladder: $1,400 → $1,900 → $2,400 → $2,900 → $3,400
- Bomb plant bonus: $160 per player
- Overtime (12:12): sides swap every 3 rounds, starting money $10,000
