export type Side = 'CT' | 'T'

export type BuyState = 'pistol' | 'eco' | 'half' | 'full'

export interface RoundResult {
  opponentWon: boolean
  opponentSurvivors: number // 0–5
  bombPlanted: boolean
}

export interface EconomyState {
  round: number // 1-based
  ourSide: Side // which side WE are playing
  lossStreak: number // opponent's consecutive loss count
  estimatedMoneyPerPlayer: number
  predictedBuy: BuyState
  strategyTip: string
}

export interface RoundRecord {
  round: number
  result: RoundResult
  economyBefore: EconomyState
  economyAfter: EconomyState
}

export interface GameState {
  ourSide: Side
  score: { us: number; them: number }
  currentEconomy: EconomyState
  history: RoundRecord[]
  isOvertime: boolean
  overtimeScore: { us: number; them: number }
  isMatchOver: boolean
}
