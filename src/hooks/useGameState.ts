import { useState, useCallback } from 'react'
import { initEconomy, updateEconomy } from '../engine/economy'
import { OVERTIME_WIN_THRESHOLD } from '../engine/constants'
import type { GameState, RoundResult, Side } from '../engine/types'

const MATCH_WIN_THRESHOLD = 13

function createInitialState(ourSide: Side): GameState {
  return {
    ourSide,
    score: { us: 0, them: 0 },
    currentEconomy: initEconomy(ourSide),
    history: [],
    isOvertime: false,
    overtimeScore: { us: 0, them: 0 },
    isMatchOver: false,
  }
}

export function useGameState(defaultSide: Side = 'CT') {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(defaultSide)
  )

  const submitRound = useCallback((result: RoundResult) => {
    setGameState((prev) => {
      if (prev.isMatchOver) return prev

      const economyBefore = prev.currentEconomy
      const economyAfter = updateEconomy(economyBefore, result)

      const newScore = {
        us: result.opponentWon ? prev.score.us : prev.score.us + 1,
        them: result.opponentWon ? prev.score.them + 1 : prev.score.them,
      }

      const wasOvertime = prev.isOvertime
      const enteringOvertime =
        !wasOvertime && newScore.us === 12 && newScore.them === 12

      let newOvertimeScore = { ...prev.overtimeScore }
      if (wasOvertime) {
        newOvertimeScore = {
          us: result.opponentWon
            ? prev.overtimeScore.us
            : prev.overtimeScore.us + 1,
          them: result.opponentWon
            ? prev.overtimeScore.them + 1
            : prev.overtimeScore.them,
        }
      }

      // 3:3 in an OT period → new OT period begins
      const isOTDraw =
        wasOvertime &&
        newOvertimeScore.us === 3 &&
        newOvertimeScore.them === 3
      const finalOvertimeScore = isOTDraw
        ? { us: 0, them: 0 }
        : newOvertimeScore

      const isOvertime = wasOvertime || enteringOvertime

      const isMatchOver =
        (!isOvertime &&
          (newScore.us >= MATCH_WIN_THRESHOLD ||
            newScore.them >= MATCH_WIN_THRESHOLD)) ||
        (wasOvertime &&
          (newOvertimeScore.us >= OVERTIME_WIN_THRESHOLD ||
            newOvertimeScore.them >= OVERTIME_WIN_THRESHOLD))

      return {
        ...prev,
        ourSide: economyAfter.ourSide,
        score: newScore,
        currentEconomy: economyAfter,
        history: [
          ...prev.history,
          {
            round: economyBefore.round,
            result,
            economyBefore,
            economyAfter,
          },
        ],
        isOvertime,
        overtimeScore: finalOvertimeScore,
        isMatchOver,
      }
    })
  }, [])

  const resetGame = useCallback((ourSide?: Side) => {
    setGameState((prev) => createInitialState(ourSide ?? prev.ourSide))
  }, [])

  return { gameState, submitRound, resetGame }
}
