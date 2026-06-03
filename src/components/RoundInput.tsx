import { useState } from 'react'
import type { RoundResult } from '../engine/types'

interface RoundInputProps {
  round: number
  isMatchOver: boolean
  isOvertime: boolean
  onSubmit: (result: RoundResult) => void
}

const SURVIVOR_COUNTS = [0, 1, 2, 3, 4, 5]

export function RoundInput({ round, isMatchOver, isOvertime, onSubmit }: RoundInputProps) {
  const [opponentWon, setOpponentWon] = useState<boolean | null>(null)
  const [survivors, setSurvivors] = useState<number>(0)
  const [bombPlanted, setBombPlanted] = useState(false)

  function handleSubmit() {
    if (opponentWon === null) return
    onSubmit({
      opponentWon,
      opponentSurvivors: survivors,
      bombPlanted,
    })
    // Reset form
    setOpponentWon(null)
    setSurvivors(0)
    setBombPlanted(false)
  }

  const sectionStyle: React.CSSProperties = {
    backgroundColor: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '2px',
  }

  const outcomeBtn = (
    active: boolean,
    isWin: boolean
  ): React.CSSProperties => ({
    flex: 1,
    minHeight: '52px',
    borderRadius: '8px',
    border: active
      ? `2px solid ${isWin ? '#22c55e' : '#ef4444'}`
      : '2px solid #2a2a2a',
    backgroundColor: active
      ? isWin
        ? 'rgba(34,197,94,0.12)'
        : 'rgba(239,68,68,0.12)'
      : 'transparent',
    color: active ? (isWin ? '#22c55e' : '#ef4444') : '#9ca3af',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'none',
  })

  const survivorBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    minHeight: '44px',
    borderRadius: '6px',
    border: active ? '2px solid #3b82f6' : '2px solid #2a2a2a',
    backgroundColor: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? '#3b82f6' : '#9ca3af',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  })

  const toggleBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    minHeight: '44px',
    borderRadius: '6px',
    border: active ? '2px solid #3b82f6' : '2px solid #2a2a2a',
    backgroundColor: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? '#3b82f6' : '#9ca3af',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  })

  const submitDisabled = opponentWon === null

  if (isMatchOver) {
    return (
      <section style={{ ...sectionStyle, alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '24px' }}>🏆</div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>
          Match Over
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
          Start a new game to track another match.
        </div>
      </section>
    )
  }

  return (
    <section style={sectionStyle}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
        {isOvertime ? `OT Round ${round}` : `Round ${round}`} result
      </div>

      {/* Win / Loss toggle */}
      <div>
        <div style={labelStyle}>Outcome</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={outcomeBtn(opponentWon === false, true)}
            onClick={() => setOpponentWon(false)}
          >
            WE WON
          </button>
          <button
            style={outcomeBtn(opponentWon === true, false)}
            onClick={() => setOpponentWon(true)}
          >
            WE LOST
          </button>
        </div>
      </div>

      {/* Opponent survivors stepper */}
      <div>
        <div style={labelStyle}>Opponent survivors</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {SURVIVOR_COUNTS.map((n) => (
            <button
              key={n}
              style={survivorBtn(survivors === n)}
              onClick={() => setSurvivors(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Bomb planted toggle */}
      <div>
        <div style={labelStyle}>Bomb planted</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={toggleBtn(bombPlanted)}
            onClick={() => setBombPlanted(true)}
          >
            YES
          </button>
          <button
            style={toggleBtn(!bombPlanted)}
            onClick={() => setBombPlanted(false)}
          >
            NO
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitDisabled}
        style={{
          width: '100%',
          minHeight: '48px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: submitDisabled ? '#1a1a1a' : '#3b82f6',
          color: submitDisabled ? '#4b5563' : '#ffffff',
          fontSize: '15px',
          fontWeight: 700,
          cursor: submitDisabled ? 'not-allowed' : 'pointer',
          letterSpacing: '0.04em',
        }}
      >
        Submit Round
      </button>
    </section>
  )
}
