import { useState } from 'react'
import type { RoundRecord, BuyState } from '../engine/types'

interface RoundHistoryProps {
  history: RoundRecord[]
}

const BUY_LABEL: Record<BuyState, string> = {
  full: 'FULL',
  half: 'HALF',
  eco: 'ECO',
  pistol: 'PSTL',
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

export function RoundHistory({ history }: RoundHistoryProps) {
  const [open, setOpen] = useState(true)

  if (history.length === 0) return null

  const cellStyle: React.CSSProperties = {
    padding: '6px 8px',
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'left' as const,
    borderBottom: '1px solid #1e1e1e',
    whiteSpace: 'nowrap' as const,
  }

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    color: '#9ca3af',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    borderBottom: '1px solid #2a2a2a',
  }

  return (
    <section
      style={{
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="round-history-table"
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: '#9ca3af',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        <span>Round History ({history.length})</span>
        <span style={{ fontSize: '10px', color: '#9ca3af' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div id="round-history-table" style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed' as const,
              minWidth: '420px',
            }}
          >
            <colgroup>
              <col style={{ width: '46px' }} />
              <col style={{ width: '46px' }} />
              <col style={{ width: '56px' }} />
              <col style={{ width: '52px' }} />
              <col />
              <col style={{ width: '72px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={headerCellStyle}>#</th>
                <th style={headerCellStyle}>W/L</th>
                <th style={headerCellStyle}>Surv.</th>
                <th style={headerCellStyle}>Bomb</th>
                <th style={headerCellStyle}>Prediction</th>
                <th style={headerCellStyle}>After $</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((record) => {
                const won = !record.result.opponentWon
                const buy = record.economyBefore.predictedBuy
                return (
                  <tr key={record.round}>
                    <td style={{ ...cellStyle, color: '#6b7280' }}>
                      {record.round}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        color: won ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                      }}
                    >
                      {won ? 'W' : 'L'}
                    </td>
                    <td style={cellStyle}>{record.result.opponentSurvivors}</td>
                    <td
                      style={{
                        ...cellStyle,
                        color: record.result.bombPlanted
                          ? '#f59e0b'
                          : '#3a3a3a',
                      }}
                    >
                      {record.result.bombPlanted ? 'YES' : 'NO'}
                    </td>
                    <td style={{ ...cellStyle }}>
                      <span
                        style={{
                          color: BUY_COLOR[buy],
                          fontWeight: 600,
                          fontSize: '11px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {BUY_LABEL[buy]}
                      </span>
                      <span
                        style={{
                          color: '#9ca3af',
                          marginLeft: '6px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                      >
                        ~
                        {formatMoney(
                          record.economyBefore.estimatedMoneyPerPlayer
                        )}
                      </span>
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        fontFamily: 'monospace',
                        color: '#ffffff',
                        fontSize: '11px',
                      }}
                    >
                      {formatMoney(record.economyAfter.estimatedMoneyPerPlayer)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
