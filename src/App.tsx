import { useCallback } from 'react'
import { useGameState } from './hooks/useGameState'
import { Header } from './components/Header'
import { Prediction } from './components/Prediction'
import { RoundInput } from './components/RoundInput'
import { RoundHistory } from './components/RoundHistory'
import type { Side } from './engine/types'

export default function App() {
  const { gameState, submitRound, resetGame } = useGameState('CT')

  const handleSideToggle = useCallback(() => {
    const newSide: Side = gameState.ourSide === 'CT' ? 'T' : 'CT'
    resetGame(newSide)
  }, [gameState.ourSide, resetGame])

  const handleReset = useCallback(() => {
    resetGame()
  }, [resetGame])

  const outerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0a0a0a',
  }

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    gap: '12px',
  }

  const contentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }

  return (
    <div style={outerStyle}>
      <Header
        score={gameState.score}
        ourSide={gameState.ourSide}
        round={gameState.currentEconomy.round}
        onSideToggle={handleSideToggle}
        onReset={handleReset}
      />
      <main style={mainStyle}>
        <div style={contentStyle}>
          <Prediction economy={gameState.currentEconomy} />
          <RoundInput
            round={gameState.currentEconomy.round}
            onSubmit={submitRound}
          />
          <RoundHistory history={gameState.history} />
        </div>
      </main>
    </div>
  )
}
