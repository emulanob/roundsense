import type { Side } from '../engine/types'

interface HeaderProps {
  score: { us: number; them: number }
  ourSide: Side
  round: number
  isOvertime: boolean
  overtimeScore: { us: number; them: number }
  isMatchOver: boolean
  bannerVisible: boolean
  onSideToggle: () => void
  onReset: () => void
  onToggleBanner: () => void
}

const styles = {
  header: {
    backgroundColor: '#141414',
    borderBottom: '1px solid #2a2a2a',
    padding: '12px 16px',
  } as React.CSSProperties,

  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '8px',
  } as React.CSSProperties,

  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  appName: {
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#3b82f6',
  } as React.CSSProperties,

  roundBadge: {
    fontSize: '12px',
    color: '#9ca3af',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '4px',
    padding: '2px 8px',
  } as React.CSSProperties,

  otBadge: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#f59e0b',
    backgroundColor: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.4)',
    borderRadius: '4px',
    padding: '2px 8px',
  } as React.CSSProperties,

  matchOverBadge: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: '4px',
    padding: '2px 8px',
  } as React.CSSProperties,

  scoreGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'monospace',
  } as React.CSSProperties,

  separator: {
    color: '#2a2a2a',
    fontSize: '20px',
  } as React.CSSProperties,

  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,

  btnSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#9ca3af',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    minHeight: '32px',
    whiteSpace: 'nowrap' as const,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  } as React.CSSProperties,

  btnPrimary: {
    backgroundColor: 'transparent',
    border: '1px solid #3b82f6',
    color: '#3b82f6',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    minHeight: '32px',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  btnIcon: {
    backgroundColor: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#9ca3af',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '13px',
    cursor: 'pointer',
    minHeight: '32px',
  } as React.CSSProperties,
}

export function Header({
  score,
  ourSide,
  round,
  isOvertime,
  overtimeScore,
  isMatchOver,
  bannerVisible,
  onSideToggle,
  onReset,
  onToggleBanner,
}: HeaderProps) {
  const oppSide: Side = ourSide === 'CT' ? 'T' : 'CT'

  const ctScore = ourSide === 'CT' ? score.us : score.them
  const tScore = ourSide === 'T' ? score.us : score.them

  return (
    <header style={styles.header}>
      <div style={styles.topRow}>
        <div style={styles.titleGroup}>
          <span style={styles.appName}>RoundSense</span>
          {isMatchOver ? (
            <span style={styles.matchOverBadge}>Match Over</span>
          ) : isOvertime ? (
            <span style={styles.otBadge}>
              OT {overtimeScore.us}:{overtimeScore.them}
            </span>
          ) : (
            <span style={styles.roundBadge}>Round {round}</span>
          )}
        </div>

        <div style={styles.scoreGroup}>
          <span style={{ color: ourSide === 'CT' ? '#3b82f6' : '#9ca3af' }}>
            CT
          </span>
          <span style={{ color: '#ffffff' }}>{ctScore}</span>
          <span style={styles.separator}>:</span>
          <span style={{ color: '#ffffff' }}>{tScore}</span>
          <span style={{ color: ourSide === 'T' ? '#3b82f6' : '#9ca3af' }}>
            T
          </span>
        </div>

        <div style={styles.actionGroup}>
          <button
            style={styles.btnIcon}
            onClick={onToggleBanner}
            aria-expanded={bannerVisible}
            aria-controls="info-banner"
            title="About RoundSense"
          >
            ?
          </button>
          <a
            href="https://paypal.me/emulanob"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.btnSecondary}
            title="Support this project"
          >
            ☕
          </a>
          <button
            style={styles.btnPrimary}
            onClick={onSideToggle}
            title="Toggle which side we are playing"
          >
            We play {ourSide} ↔ {oppSide}
          </button>
          <button
            style={styles.btnSecondary as React.CSSProperties}
            onClick={onReset}
          >
            New Game
          </button>
        </div>
      </div>
    </header>
  )
}
