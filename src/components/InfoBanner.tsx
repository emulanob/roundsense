const GITHUB_URL = 'https://github.com/emulanob/roundsense'

interface InfoBannerProps {
  onDismiss: () => void
}

export function InfoBanner({ onDismiss }: InfoBannerProps) {
  return (
    <aside
      id="info-banner"
      aria-label="About RoundSense"
      style={{
        backgroundColor: '#141414',
        borderBottom: '1px solid #2a2a2a',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <p
        style={{
          flex: 1,
          margin: 0,
          fontSize: '13px',
          color: '#9ca3af',
          lineHeight: '1.5',
        }}
      >
        <strong style={{ color: '#ffffff' }}>RoundSense</strong> tracks your CS2
        match economy round by round. After each round, enter the outcome, how
        many opponents survived, and whether the bomb was planted. RoundSense
        predicts what the enemy team can afford next round so you can plan your
        buy accordingly.{' '}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'none' }}
        >
          GitHub
        </a>
        <span
          style={{
            marginLeft: '8px',
            color: '#9ca3af',
            fontSize: '11px',
          }}
        >
          v{__APP_VERSION__}
        </span>
      </p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss info banner"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0 4px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </aside>
  )
}
