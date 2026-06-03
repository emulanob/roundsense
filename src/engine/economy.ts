import type { Side, BuyState, EconomyState, RoundResult } from './types'
import {
  MAX_MONEY,
  PISTOL_ROUND_MONEY,
  HALFTIME_ROUND,
  WIN_REWARD,
  BOMB_PLANT_BONUS_PER_PLAYER,
  LOSS_BONUS_LADDER,
  BUY_COST,
  BUY_THRESHOLD_FULL,
  BUY_THRESHOLD_HALF,
  STRATEGY_TIPS,
} from './constants'

export function predictBuy(
  moneyPerPlayer: number,
  round: number
): { buyState: BuyState; strategyTip: string } {
  let buyState: BuyState

  if (round === 1 || round === HALFTIME_ROUND) {
    buyState = 'pistol'
  } else if (moneyPerPlayer >= BUY_THRESHOLD_FULL) {
    buyState = 'full'
  } else if (moneyPerPlayer >= BUY_THRESHOLD_HALF) {
    buyState = 'half'
  } else {
    buyState = 'eco'
  }

  return { buyState, strategyTip: STRATEGY_TIPS[buyState] }
}

export function initEconomy(ourSide: Side): EconomyState {
  const round = 1
  const money = PISTOL_ROUND_MONEY
  const { buyState, strategyTip } = predictBuy(money, round)

  return {
    round,
    ourSide,
    lossStreak: 0,
    estimatedMoneyPerPlayer: money,
    predictedBuy: buyState,
    strategyTip,
  }
}

export function updateEconomy(
  state: EconomyState,
  result: RoundResult
): EconomyState {
  const opponentSide: Side = state.ourSide === 'CT' ? 'T' : 'CT'

  const estimatedSpend = BUY_COST[state.predictedBuy]
  // Survivors kept gear; each survivor reduces the spend by half its per-player share
  const survivorRatio = result.opponentSurvivors / 5
  const actualSpend = estimatedSpend * (1 - survivorRatio * 0.5)

  const moneyBeforeIncome = Math.max(
    0,
    state.estimatedMoneyPerPlayer - actualSpend
  )

  let income: number
  let newLossStreak: number

  if (!result.opponentWon) {
    const streakIndex = Math.min(state.lossStreak, LOSS_BONUS_LADDER.length - 1)
    income = LOSS_BONUS_LADDER[streakIndex]
    newLossStreak = state.lossStreak + 1
  } else {
    income = WIN_REWARD
    newLossStreak = 0
  }

  if (result.bombPlanted && opponentSide === 'T') {
    income += BOMB_PLANT_BONUS_PER_PLAYER
  }

  const rawMoney = moneyBeforeIncome + income
  const nextRound = state.round + 1

  if (nextRound === HALFTIME_ROUND) {
    const newOurSide: Side = state.ourSide === 'CT' ? 'T' : 'CT'
    const { buyState, strategyTip } = predictBuy(PISTOL_ROUND_MONEY, nextRound)
    return {
      round: nextRound,
      ourSide: newOurSide,
      lossStreak: newLossStreak,
      estimatedMoneyPerPlayer: PISTOL_ROUND_MONEY,
      predictedBuy: buyState,
      strategyTip,
    }
  }

  const newMoney = Math.min(rawMoney, MAX_MONEY)
  const { buyState, strategyTip } = predictBuy(newMoney, nextRound)

  return {
    round: nextRound,
    ourSide: state.ourSide,
    lossStreak: newLossStreak,
    estimatedMoneyPerPlayer: newMoney,
    predictedBuy: buyState,
    strategyTip,
  }
}
