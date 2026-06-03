import { useState, useCallback } from 'react'
import { initEconomy, updateEconomy } from '../engine/economy'
import type { GameState, RoundResult, Side } from '../engine/types'

function createInitialState(ourSide: Side): GameState {
  return {
    ourSide,
    score: { us: 0, them: 0 },
    currentEconomy: initEconomy(ourSide),
    history: [],
  }
}

export function useGameState(defaultSide: Side = 'CT') {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(defaultSide)
  )

  const submitRound = useCallback((result: RoundResult) => {
    setGameState((prev) => {
      const economyBefore = prev.currentEconomy
      const economyAfter = updateEconomy(economyBefore, result)

      // opponentWon = true means opponent won (they scored), we lost
      const newScore = {
        us: result.opponentWon ? prev.score.us : prev.score.us + 1,
        them: result.opponentWon ? prev.score.them + 1 : prev.score.them,
      }

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
      }
    })
  }, [])

  const resetGame = useCallback((ourSide?: Side) => {
    setGameState((prev) => createInitialState(ourSide ?? prev.ourSide))
  }, [])

  return { gameState, submitRound, resetGame }
}
