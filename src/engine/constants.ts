import type { BuyState } from './types'

export const MAX_MONEY = 16_000
export const PISTOL_ROUND_MONEY = 800
export const HALFTIME_ROUND = 13

export const WIN_REWARD = 3_250
export const BOMB_PLANT_BONUS_PER_PLAYER = 160

export const LOSS_BONUS_LADDER: readonly number[] = [
  1_400, // 1st consecutive loss
  1_900, // 2nd
  2_400, // 3rd
  2_900, // 4th
  3_400, // 5th+
]

export const BUY_COST: Record<BuyState, number> = {
  pistol: 800,
  eco: 500,
  half: 2_500,
  full: 4_750,
}

export const BUY_THRESHOLD_FULL = 4_750
export const BUY_THRESHOLD_HALF = 2_000

export const STRATEGY_TIPS: Record<BuyState, string> = {
  full: 'Expect rifles, armor, and utilities — play standard',
  half: 'Expect SMGs or armor pistols — stay grouped, avoid isolated duels',
  eco: 'Expect pistols only — play aggressive, take map control',
  pistol: 'Pistol round — expect full eco or deagle play',
}
