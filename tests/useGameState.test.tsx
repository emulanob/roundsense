// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from '../src/hooks/useGameState'

const winRound = {
  opponentWon: false,
  opponentSurvivors: 0,
  bombPlanted: false,
}
const loseRound = {
  opponentWon: true,
  opponentSurvivors: 5,
  bombPlanted: false,
}

describe('useGameState — initial state', () => {
  it('defaults to CT side, round 1, pistol buy, 0-0 score', () => {
    const { result } = renderHook(() => useGameState())
    const { gameState } = result.current
    expect(gameState.ourSide).toBe('CT')
    expect(gameState.score).toEqual({ us: 0, them: 0 })
    expect(gameState.currentEconomy.round).toBe(1)
    expect(gameState.currentEconomy.predictedBuy).toBe('pistol')
    expect(gameState.history).toHaveLength(0)
  })

  it('accepts a custom starting side', () => {
    const { result } = renderHook(() => useGameState('T'))
    expect(result.current.gameState.ourSide).toBe('T')
  })
})

describe('useGameState — submitRound', () => {
  it('increments our score when we win (opponent lost)', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.submitRound(winRound))
    expect(result.current.gameState.score).toEqual({ us: 1, them: 0 })
  })

  it('increments their score when opponent wins', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.submitRound(loseRound))
    expect(result.current.gameState.score).toEqual({ us: 0, them: 1 })
  })

  it('appends a record to history each round', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.submitRound(winRound))
    act(() => result.current.submitRound(loseRound))
    expect(result.current.gameState.history).toHaveLength(2)
  })

  it('history record contains correct round number and result', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.submitRound(winRound))
    const record = result.current.gameState.history[0]
    expect(record.round).toBe(1)
    expect(record.result).toEqual(winRound)
  })

  it('advances the economy round after each submit', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.submitRound(winRound))
    expect(result.current.gameState.currentEconomy.round).toBe(2)
  })

  it('score accumulates correctly over multiple rounds', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.submitRound(winRound))
    act(() => result.current.submitRound(winRound))
    act(() => result.current.submitRound(loseRound))
    expect(result.current.gameState.score).toEqual({ us: 2, them: 1 })
  })

  it('syncs ourSide on state after halftime (round 13)', () => {
    const { result } = renderHook(() => useGameState('CT'))
    for (let i = 0; i < 12; i++) {
      act(() => result.current.submitRound(winRound))
    }
    expect(result.current.gameState.currentEconomy.round).toBe(13)
    expect(result.current.gameState.ourSide).toBe('T')
  })
})

describe('useGameState — resetGame', () => {
  it('resets score, history and economy to round 1', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.submitRound(winRound))
    act(() => result.current.resetGame())
    const { gameState } = result.current
    expect(gameState.score).toEqual({ us: 0, them: 0 })
    expect(gameState.history).toHaveLength(0)
    expect(gameState.currentEconomy.round).toBe(1)
  })

  it('preserves current side when called without argument', () => {
    const { result } = renderHook(() => useGameState('T'))
    act(() => result.current.resetGame())
    expect(result.current.gameState.ourSide).toBe('T')
  })

  it('switches side when called with a new side argument', () => {
    const { result } = renderHook(() => useGameState('CT'))
    act(() => result.current.resetGame('T'))
    expect(result.current.gameState.ourSide).toBe('T')
  })
})

describe('useGameState — match end at 13 wins', () => {
  it('sets isMatchOver when us score reaches 13', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 0; i < 13; i++) {
      act(() => result.current.submitRound(winRound))
    }
    expect(result.current.gameState.isMatchOver).toBe(true)
  })

  it('sets isMatchOver when them score reaches 13', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 0; i < 13; i++) {
      act(() => result.current.submitRound(loseRound))
    }
    expect(result.current.gameState.isMatchOver).toBe(true)
  })

  it('does NOT set isMatchOver at 12:12 (overtime case)', () => {
    const { result } = renderHook(() => useGameState())
    // 12 wins and 12 losses alternating, reaching 12:12
    for (let i = 0; i < 12; i++) {
      act(() => result.current.submitRound(winRound))
    }
    for (let i = 0; i < 12; i++) {
      act(() => result.current.submitRound(loseRound))
    }
    expect(result.current.gameState.score).toEqual({ us: 12, them: 12 })
    expect(result.current.gameState.isMatchOver).toBe(false)
    expect(result.current.gameState.isOvertime).toBe(true)
  })

  it('ignores further submits once match is over', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 0; i < 13; i++) {
      act(() => result.current.submitRound(winRound))
    }
    const scoreSnapshot = { ...result.current.gameState.score }
    act(() => result.current.submitRound(winRound))
    expect(result.current.gameState.score).toEqual(scoreSnapshot)
  })
})

describe('useGameState — overtime', () => {
  function reachScore12_12() {
    const { result } = renderHook(() => useGameState())
    for (let i = 0; i < 12; i++) {
      act(() => result.current.submitRound(winRound))
    }
    for (let i = 0; i < 12; i++) {
      act(() => result.current.submitRound(loseRound))
    }
    return result
  }

  it('enters overtime when score hits 12:12', () => {
    const result = reachScore12_12()
    expect(result.current.gameState.isOvertime).toBe(true)
  })

  it('overtime score starts at 0:0', () => {
    const result = reachScore12_12()
    expect(result.current.gameState.overtimeScore).toEqual({ us: 0, them: 0 })
  })

  it('increments overtime score', () => {
    const result = reachScore12_12()
    act(() => result.current.submitRound(winRound))
    expect(result.current.gameState.overtimeScore.us).toBe(1)
  })

  it('sets isMatchOver when OT score reaches 4', () => {
    const result = reachScore12_12()
    for (let i = 0; i < 4; i++) {
      act(() => result.current.submitRound(winRound))
    }
    expect(result.current.gameState.isMatchOver).toBe(true)
  })

  it('resets OT score to 0:0 at 3:3 and continues', () => {
    const result = reachScore12_12()
    for (let i = 0; i < 3; i++) {
      act(() => result.current.submitRound(winRound))
    }
    for (let i = 0; i < 3; i++) {
      act(() => result.current.submitRound(loseRound))
    }
    // 3:3 in OT → reset
    expect(result.current.gameState.overtimeScore).toEqual({ us: 0, them: 0 })
    expect(result.current.gameState.isMatchOver).toBe(false)
    expect(result.current.gameState.isOvertime).toBe(true)
  })
})
