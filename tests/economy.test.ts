import { describe, it, expect } from 'vitest'
import { initEconomy, updateEconomy, predictBuy } from '../src/engine/economy'
import type { EconomyState, RoundResult } from '../src/engine/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A do-nothing round result: opponent loses, no survivors, no bomb plant */
const lossResult = (overrides: Partial<RoundResult> = {}): RoundResult => ({
  opponentWon: false,
  opponentSurvivors: 0,
  bombPlanted: false,
  ...overrides,
})

const winResult = (overrides: Partial<RoundResult> = {}): RoundResult => ({
  opponentWon: true,
  opponentSurvivors: 0,
  bombPlanted: false,
  ...overrides,
})

/** Drive `n` identical results through updateEconomy, starting from `state`. */
function applyResults(
  state: EconomyState,
  results: RoundResult[]
): EconomyState {
  return results.reduce((s, r) => updateEconomy(s, r), state)
}

// ---------------------------------------------------------------------------
// Constants mirrored from engine (so tests don't import from constants.ts)
// ---------------------------------------------------------------------------
const PISTOL_ROUND_MONEY = 800
const BOMB_PLANT_BONUS = 160
const MAX_MONEY = 16_000

// ---------------------------------------------------------------------------
// 1. initEconomy
// ---------------------------------------------------------------------------
describe('initEconomy', () => {
  it('starts at round 1', () => {
    expect(initEconomy('CT').round).toBe(1)
  })

  it('sets estimatedMoneyPerPlayer to $800 (pistol round money)', () => {
    expect(initEconomy('CT').estimatedMoneyPerPlayer).toBe(PISTOL_ROUND_MONEY)
  })

  it('sets predictedBuy to "pistol"', () => {
    expect(initEconomy('CT').predictedBuy).toBe('pistol')
  })

  it('sets lossStreak to 0', () => {
    expect(initEconomy('CT').lossStreak).toBe(0)
  })

  it('preserves the ourSide argument', () => {
    expect(initEconomy('CT').ourSide).toBe('CT')
    expect(initEconomy('T').ourSide).toBe('T')
  })
})

// ---------------------------------------------------------------------------
// 2. Pistol round win — opponent wins round 1
// ---------------------------------------------------------------------------
describe('pistol round win', () => {
  // Engine state: we are CT, so opponent is T.
  // Round 1: predictedBuy='pistol', estimatedMoney=800
  // spend = BUY_COST.pistol = 800; survivorRatio = 0/5 = 0; actualSpend = 800
  // moneyBeforeIncome = max(0, 800 - 800) = 0
  // opponent won → income = WIN_REWARD = 3250
  // newMoney = 0 + 3250 = 3250
  const state = initEconomy('CT') // round 1
  const next = updateEconomy(state, winResult())

  it('advances to round 2', () => {
    expect(next.round).toBe(2)
  })

  it('credits the $3,250 win reward (resulting in $3,250)', () => {
    expect(next.estimatedMoneyPerPlayer).toBe(3_250)
  })

  it('predicts a "half" buy (3250 is between $2000 and $4749)', () => {
    expect(next.predictedBuy).toBe('half')
  })

  it('resets lossStreak to 0 after a win', () => {
    expect(next.lossStreak).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 3. Loss bonus ladder — five consecutive losses
// ---------------------------------------------------------------------------
describe('loss bonus ladder', () => {
  // We use round 2 so the pistol override does not apply.
  // Build a state at round 2, with predictedBuy forced to something deterministic.
  // initEconomy gives round 1 / pistol. Applying one win brings us to round 2
  // with money=3250 / predictedBuy='half'.
  // From there we track every loss step.

  const pistolState = initEconomy('CT')
  // Win round 1 so we land at a well-defined round-2 state.
  const round2State = updateEconomy(pistolState, winResult())
  // round2State: round=2, money=3250, predictedBuy='half', lossStreak=0

  it('first loss gives income of $1,400 (first rung)', () => {
    // spend = BUY_COST.half = 2500; actualSpend = 2500*(1-0) = 2500
    // moneyBefore = max(0, 3250 - 2500) = 750
    // income = LOSS_BONUS_LADDER[0] = 1400
    // newMoney = 750 + 1400 = 2150
    const s1 = updateEconomy(round2State, lossResult())
    expect(s1.estimatedMoneyPerPlayer).toBe(2_150)
    expect(s1.lossStreak).toBe(1)
  })

  it('second loss gives income of $1,900 (second rung)', () => {
    // s1: money=2150, predictedBuy='half' (2150>=2000), lossStreak=1
    // spend = 2500; moneyBefore = max(0, 2150-2500) = 0
    // income = LOSS_BONUS_LADDER[1] = 1900
    // newMoney = 0 + 1900 = 1900
    const s1 = updateEconomy(round2State, lossResult())
    const s2 = updateEconomy(s1, lossResult())
    expect(s2.estimatedMoneyPerPlayer).toBe(1_900)
    expect(s2.lossStreak).toBe(2)
  })

  it('third loss gives income of $2,400 (third rung)', () => {
    // s2: money=1900, predictedBuy='eco' (1900<2000), lossStreak=2
    // spend = BUY_COST.eco = 500; moneyBefore = max(0, 1900-500) = 1400
    // income = LOSS_BONUS_LADDER[2] = 2400
    // newMoney = 1400 + 2400 = 3800
    const s1 = updateEconomy(round2State, lossResult())
    const s2 = updateEconomy(s1, lossResult())
    const s3 = updateEconomy(s2, lossResult())
    expect(s3.estimatedMoneyPerPlayer).toBe(3_800)
    expect(s3.lossStreak).toBe(3)
  })

  it('fourth loss gives income of $2,900 (fourth rung)', () => {
    // s3: money=3800, predictedBuy='eco'? No: 3800>=2000 → 'half', lossStreak=3
    // spend = BUY_COST.half = 2500; moneyBefore = max(0, 3800-2500) = 1300
    // income = LOSS_BONUS_LADDER[3] = 2900
    // newMoney = 1300 + 2900 = 4200
    const s1 = updateEconomy(round2State, lossResult())
    const s2 = updateEconomy(s1, lossResult())
    const s3 = updateEconomy(s2, lossResult())
    const s4 = updateEconomy(s3, lossResult())
    expect(s4.estimatedMoneyPerPlayer).toBe(4_200)
    expect(s4.lossStreak).toBe(4)
  })

  it('fifth loss gives income of $3,400 (fifth rung / cap)', () => {
    // s4: money=4200, predictedBuy='half' (4200<4750), lossStreak=4
    // spend = BUY_COST.half = 2500; moneyBefore = max(0, 4200-2500) = 1700
    // income = LOSS_BONUS_LADDER[4] = 3400
    // newMoney = 1700 + 3400 = 5100
    const s1 = updateEconomy(round2State, lossResult())
    const s2 = updateEconomy(s1, lossResult())
    const s3 = updateEconomy(s2, lossResult())
    const s4 = updateEconomy(s3, lossResult())
    const s5 = updateEconomy(s4, lossResult())
    expect(s5.estimatedMoneyPerPlayer).toBe(5_100)
    expect(s5.lossStreak).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// 4. Loss streak resets on win
// ---------------------------------------------------------------------------
describe('loss streak resets on win', () => {
  // Win round 1 → round 2 (lossStreak=0), then lose 3 times
  const base = updateEconomy(initEconomy('CT'), winResult()) // round 2
  const after3Losses = applyResults(base, [
    lossResult(),
    lossResult(),
    lossResult(),
  ])

  it('has lossStreak of 3 after three consecutive losses', () => {
    expect(after3Losses.lossStreak).toBe(3)
  })

  it('resets lossStreak to 0 after the next win', () => {
    const afterWin = updateEconomy(after3Losses, winResult())
    expect(afterWin.lossStreak).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 5. Bomb plant bonus on T side
// ---------------------------------------------------------------------------
describe('bomb plant bonus when opponent is T', () => {
  // ourSide='CT' → opponent is T, so bomb plant bonus applies.
  // Use round 2 via a preliminary win.
  const round2 = updateEconomy(initEconomy('CT'), winResult())
  // round2: money=3250, predictedBuy='half'

  it('adds $160 to income when bomb is planted and opponent is T', () => {
    // Without plant:
    // spend=2500, moneyBefore=750, income=3250(win), newMoney=4000
    // With plant:
    // income=3250+160=3410, newMoney=750+3410=4160
    const withoutPlant = updateEconomy(
      round2,
      winResult({ bombPlanted: false })
    )
    const withPlant = updateEconomy(round2, winResult({ bombPlanted: true }))
    expect(
      withPlant.estimatedMoneyPerPlayer - withoutPlant.estimatedMoneyPerPlayer
    ).toBe(BOMB_PLANT_BONUS)
  })
})

// ---------------------------------------------------------------------------
// 6. No bomb plant bonus when opponent is CT
// ---------------------------------------------------------------------------
describe('bomb plant bonus is absent when opponent is CT', () => {
  // ourSide='T' → opponent is CT, so no bomb plant bonus.
  const round2 = updateEconomy(initEconomy('T'), winResult())

  it('does not add $160 when bomb is planted but opponent is CT', () => {
    const withoutPlant = updateEconomy(
      round2,
      winResult({ bombPlanted: false })
    )
    const withPlant = updateEconomy(round2, winResult({ bombPlanted: true }))
    expect(withPlant.estimatedMoneyPerPlayer).toBe(
      withoutPlant.estimatedMoneyPerPlayer
    )
  })
})

// ---------------------------------------------------------------------------
// 7. Money capped at $16,000
// ---------------------------------------------------------------------------
describe('money cap at $16,000', () => {
  // Force the opponent into maximum accumulation: win every round with
  // the bomb planted while we're on CT (opponent is T).
  // After enough rounds the cap should kick in.
  it('never exceeds $16,000 regardless of accumulated income', () => {
    let state = initEconomy('CT')
    // Run 10 rounds of wins with bomb plants — enough to saturate the cap.
    for (let i = 0; i < 10; i++) {
      // Guard against halftime: once round reaches 12, the next call produces round 13.
      if (state.round >= 12) break
      state = updateEconomy(state, winResult({ bombPlanted: true }))
      expect(state.estimatedMoneyPerPlayer).toBeLessThanOrEqual(MAX_MONEY)
    }
  })

  it('clamps money to exactly $16,000 when raw total would exceed it', () => {
    // Build a state where we can force rawMoney > 16000.
    // Manually craft a state close to the cap.
    const nearCapEco: EconomyState = {
      round: 5,
      ourSide: 'CT',
      lossStreak: 4,
      estimatedMoneyPerPlayer: 14_000,
      predictedBuy: 'eco',
      strategyTip: '',
    }
    // spend=500; moneyBefore=13500; income=3250(win)+160(plant)=3410
    // rawMoney=13500+3410=16910 > 16000 → clamped to 16000
    const result = updateEconomy(nearCapEco, winResult({ bombPlanted: true }))
    expect(result.estimatedMoneyPerPlayer).toBe(MAX_MONEY)
  })
})

// ---------------------------------------------------------------------------
// 8. Halftime reset at round 13
// ---------------------------------------------------------------------------
describe('halftime reset', () => {
  // Build a state exactly at round 12 with some money and ongoing lossStreak.
  const preHalftime: EconomyState = {
    round: 12,
    ourSide: 'CT',
    lossStreak: 2,
    estimatedMoneyPerPlayer: 5_000,
    predictedBuy: 'full',
    strategyTip: '',
  }
  const half = updateEconomy(preHalftime, lossResult())

  it('advances round counter to 13', () => {
    expect(half.round).toBe(13)
  })

  it('flips ourSide from CT to T', () => {
    expect(half.ourSide).toBe('T')
  })

  it('resets estimatedMoneyPerPlayer to $800', () => {
    expect(half.estimatedMoneyPerPlayer).toBe(PISTOL_ROUND_MONEY)
  })

  it('predicts "pistol" buy for round 13', () => {
    expect(half.predictedBuy).toBe('pistol')
  })

  it('also flips from T to CT', () => {
    const tSide: EconomyState = { ...preHalftime, ourSide: 'T' }
    expect(updateEconomy(tSide, lossResult()).ourSide).toBe('CT')
  })
})

// ---------------------------------------------------------------------------
// 9. predictBuy thresholds
// ---------------------------------------------------------------------------
describe('predictBuy thresholds', () => {
  it('returns "pistol" for round 1 regardless of money', () => {
    expect(predictBuy(10_000, 1).buyState).toBe('pistol')
  })

  it('returns "pistol" for round 13 (halftime) regardless of money', () => {
    expect(predictBuy(10_000, 13).buyState).toBe('pistol')
  })

  it('returns "full" when money is exactly $4,750', () => {
    expect(predictBuy(4_750, 2).buyState).toBe('full')
  })

  it('returns "full" when money is above $4,750', () => {
    expect(predictBuy(6_000, 2).buyState).toBe('full')
  })

  it('returns "half" when money is exactly $2,000', () => {
    expect(predictBuy(2_000, 2).buyState).toBe('half')
  })

  it('returns "half" when money is $4,749 (just below full threshold)', () => {
    expect(predictBuy(4_749, 2).buyState).toBe('half')
  })

  it('returns "eco" when money is $1,999 (just below half threshold)', () => {
    expect(predictBuy(1_999, 2).buyState).toBe('eco')
  })

  it('returns "eco" when money is $0', () => {
    expect(predictBuy(0, 2).buyState).toBe('eco')
  })

  it('includes a non-empty strategyTip for every buy state', () => {
    for (const round of [1, 2]) {
      const { strategyTip } = predictBuy(5_000, round)
      expect(strategyTip.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// 10. Full buy prediction after opponent win streak
// ---------------------------------------------------------------------------
describe('full buy prediction after opponent win streak', () => {
  // Opponent wins 3 rounds in a row starting from round 1.
  // Round 1 (pistol win):
  //   spend=800, moneyBefore=0, income=3250 → money=3250, predictedBuy='half'
  // Round 2 (win):
  //   spend=2500, moneyBefore=750, income=3250 → money=4000, predictedBuy='half'
  // Round 3 (win):
  //   spend=2500, moneyBefore=1500, income=3250 → money=4750, predictedBuy='full'
  it('predicts "full" buy after the opponent wins three rounds in a row', () => {
    const state = initEconomy('CT')
    const after3Wins = applyResults(state, [
      winResult(),
      winResult(),
      winResult(),
    ])
    expect(after3Wins.predictedBuy).toBe('full')
  })

  it('round counter is 4 after three rounds played', () => {
    const state = initEconomy('CT')
    const after3Wins = applyResults(state, [
      winResult(),
      winResult(),
      winResult(),
    ])
    expect(after3Wins.round).toBe(4)
  })

  it('estimated money after three wins is $4,750 (exactly at full threshold)', () => {
    // Walkthrough:
    // R1→R2: spend=800, mBefore=0, income=3250, money=3250
    // R2→R3: spend=2500(half), mBefore=750, income=3250, money=4000
    // R3→R4: spend=2500(half), mBefore=1500, income=3250, money=4750
    const state = initEconomy('CT')
    const after3Wins = applyResults(state, [
      winResult(),
      winResult(),
      winResult(),
    ])
    expect(after3Wins.estimatedMoneyPerPlayer).toBe(4_750)
  })
})

// ---------------------------------------------------------------------------
// 11. Overtime economy resets
// ---------------------------------------------------------------------------
describe('overtime economy — money and side reset', () => {
  // Build a state at round 24 (last regulation round) so nextRound = 25 = OT start
  const preOT: EconomyState = {
    round: 24,
    ourSide: 'CT',
    lossStreak: 0,
    estimatedMoneyPerPlayer: 5_000,
    predictedBuy: 'full',
    strategyTip: '',
  }

  it('resets money to $10,000 when entering overtime (round 25)', () => {
    const ot = updateEconomy(preOT, lossResult())
    expect(ot.round).toBe(25)
    expect(ot.estimatedMoneyPerPlayer).toBe(10_000)
  })

  it('swaps sides at overtime start (round 25)', () => {
    const ot = updateEconomy(preOT, lossResult())
    expect(ot.ourSide).toBe('T')
  })

  it('predicts "full" buy for OT round (money=$10,000)', () => {
    const ot = updateEconomy(preOT, lossResult())
    expect(ot.predictedBuy).toBe('full')
  })

  it('swaps sides again at OT half (round 28)', () => {
    const ot = updateEconomy(preOT, lossResult()) // round 25 (T)
    // Play 2 more rounds without hitting a new half
    const ot2 = updateEconomy(ot, lossResult()) // round 26
    const ot3 = updateEconomy(ot2, lossResult()) // round 27
    const ot4 = updateEconomy(ot3, lossResult()) // round 28 — side swap
    expect(ot4.round).toBe(28)
    expect(ot4.ourSide).toBe('CT') // swapped back
    expect(ot4.estimatedMoneyPerPlayer).toBe(10_000) // money reset
  })

  it('continues accumulating money within an OT half', () => {
    const ot = updateEconomy(preOT, lossResult()) // round 25, $10,000
    const ot2 = updateEconomy(ot, winResult()) // round 26, wins + money update
    // money should differ from $10,000 (it's been updated)
    expect(ot2.round).toBe(26)
    expect(ot2.estimatedMoneyPerPlayer).not.toBe(10_000)
  })
})
