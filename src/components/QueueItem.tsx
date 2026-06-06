import { type QueueItem as QueueItemType, useAppStore } from '../store/useAppStore'

interface QueueItemProps {
  item: QueueItemType
}

const STATUS_COLORS: Record<QueueItemType['status'], string> = {
  pending: '#888888',
  processing: '#b8ff57',
  done: '#4caf50',
  error: '#ff4444',
}

const STATUS_LABELS: Record<QueueItemType['status'], string> = {
  pending: 'PENDING',
  processing: 'PROCESSING',
  done: 'DONE',
  error: 'ERROR',
}

export function QueueItem({ item }: QueueItemProps) {
  const removeFromQueue = useAppStore((s) => s.removeFromQueue)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          width: '64px',
          height: '64px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-border)',
        }}
      >
        <img
          src={item.objectUrl}
          alt={item.file.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Progress bar */}
        {item.status === 'processing' && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: 'var(--color-border)',
              overflow: 'hidden',
            }}
          >
            {item.progress > 0 ? (
              <div
                style={{
                  height: '100%',
                  width: `${item.progress}%`,
                  backgroundColor: 'var(--color-accent)',
                  transition: 'width 0.3s ease',
                }}
              />
            ) : (
              <div style={{ position: 'relative', height: '100%' }}>
                <div
                  className="progress-bar-anim"
                  style={{
                    position: 'absolute',
                    height: '100%',
                    width: '40%',
                    backgroundColor: 'var(--color-accent)',
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--color-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '4px',
          }}
        >
          {item.file.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              flexShrink: 0,
              backgroundColor: STATUS_COLORS[item.status],
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: STATUS_COLORS[item.status],
            }}
          >
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        {item.status === 'error' && item.error && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-error)',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.error}
          </p>
        )}
      </div>

      {/* Remove — always a full 44px touch target */}
      {item.status !== 'processing' ? (
        <button
          onClick={() => removeFromQueue(item.id)}
          aria-label="Remove"
          style={{
            flexShrink: 0,
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-muted)',
            fontSize: '1rem',
          }}
        >
          ✕
        </button>
      ) : (
        <div style={{ width: '44px', flexShrink: 0 }} />
      )}
    </div>
  )
}
