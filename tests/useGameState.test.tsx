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
