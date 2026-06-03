import type { EconomyState, BuyState } from '../engine/types'

interface PredictionProps {
  economy: EconomyState
}

const BUY_LABEL: Record<BuyState, string> = {
  full: 'FULL BUY',
  half: 'HALF BUY',
  eco: 'ECO',
  pistol: 'PISTOL',
}

const BUY_COLOR: Record<BuyState, string> = {
  full: '#ef4444',
  half: '#f97316',
  eco: '#f59e0b',
  pistol: '#6b7280',
}

function formatMoney(amount: number): string {
  return '$' + amount.toLocaleString('en-US')
}

function LossStreakPips({ streak }: { streak: number }) {
  const MAX_PIPS = 5
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: MAX_PIPS }, (_, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: i < streak ? '#ef4444' : '#2a2a2a',
            border: i < streak ? 'none' : '1px solid #3a3a3a',
            flexShrink: 0,
          }}
          title={i < streak ? `Loss ${i + 1}` : 'No loss'}
        />
      ))}
    </div>
  )
}

export function Prediction({ economy }: PredictionProps) {
  const isFirstRound = economy.round === 1

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
  }

  if (isFirstRound) {
    return (
      <div style={cardStyle}>
        <div
          style={{
            fontSize: '13px',
            color: '#9ca3af',
            lineHeight: '1.6',
            maxWidth: '280px',
          }}
        >
          Input the first round result to get opponent economy predictions.
        </div>
      </div>
    )
  }

  const buyColor = BUY_COLOR[economy.predictedBuy]
  const buyLabel = BUY_LABEL[economy.predictedBuy]

  return (
    <div style={cardStyle}>
      {/* Side context */}
      <div
        style={{
          fontSize: '11px',
          color: '#9ca3af',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Opponent ({economy.ourSide === 'CT' ? 'T' : 'CT'}) next round
      </div>

      {/* Buy state label */}
      <div
        style={{
          fontSize: '36px',
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: buyColor,
          lineHeight: 1,
        }}
      >
        {buyLabel}
      </div>

      {/* Estimated money */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '22px',
          fontWeight: 600,
          color: '#ffffff',
          letterSpacing: '0.03em',
        }}
      >
        ~{formatMoney(economy.estimatedMoneyPerPlayer)}{' '}
        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}>
          per player
        </span>
      </div>

      {/* Loss streak */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: '#9ca3af',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Loss streak
        </div>
        <LossStreakPips streak={economy.lossStreak} />
        {economy.lossStreak > 0 && (
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            {economy.lossStreak} consecutive{' '}
            {economy.lossStreak === 1 ? 'loss' : 'losses'} — boosted income
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{ width: '100%', height: '1px', backgroundColor: '#2a2a2a' }}
      />

      {/* Strategy tip */}
      <div
        style={{
          fontSize: '13px',
          color: '#9ca3af',
          lineHeight: '1.55',
          maxWidth: '320px',
        }}
      >
        {economy.strategyTip}
      </div>
    </div>
  )
}
