import { useCallback, useState, useEffect } from 'react'
import { useGameState } from './hooks/useGameState'
import { Header } from './components/Header'
import { InfoBanner } from './components/InfoBanner'
import { Prediction } from './components/Prediction'
import { RoundInput } from './components/RoundInput'
import { RoundHistory } from './components/RoundHistory'
import type { Side } from './engine/types'

const BANNER_STORAGE_KEY = 'roundsense_banner_dismissed'

export default function App() {
  const { gameState, submitRound, resetGame } = useGameState('CT')

  const [bannerVisible, setBannerVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_STORAGE_KEY) !== 'true'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      if (!bannerVisible) {
        localStorage.setItem(BANNER_STORAGE_KEY, 'true')
      } else {
        localStorage.removeItem(BANNER_STORAGE_KEY)
      }
    } catch {
      // localStorage unavailable
    }
  }, [bannerVisible])

  const handleSideToggle = useCallback(() => {
    const newSide: Side = gameState.ourSide === 'CT' ? 'T' : 'CT'
    resetGame(newSide)
  }, [gameState.ourSide, resetGame])

  const handleReset = useCallback(() => {
    resetGame()
  }, [resetGame])

  const handleDismissBanner = useCallback(() => {
    setBannerVisible(false)
  }, [])

  const handleToggleBanner = useCallback(() => {
    setBannerVisible((v) => !v)
  }, [])

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
        isOvertime={gameState.isOvertime}
        overtimeScore={gameState.overtimeScore}
        isMatchOver={gameState.isMatchOver}
        onSideToggle={handleSideToggle}
        onReset={handleReset}
        onToggleBanner={handleToggleBanner}
      />
      {bannerVisible && <InfoBanner onDismiss={handleDismissBanner} />}
      <main style={mainStyle}>
        <div style={contentStyle}>
          <Prediction economy={gameState.currentEconomy} />
          <RoundInput
            round={gameState.currentEconomy.round}
            isMatchOver={gameState.isMatchOver}
            isOvertime={gameState.isOvertime}
            onSubmit={submitRound}
          />
          <RoundHistory history={gameState.history} />
        </div>
      </main>
    </div>
  )
}
