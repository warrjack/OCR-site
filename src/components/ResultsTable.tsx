import { useAppStore } from '../store/useAppStore'
import { EditableCell } from './EditableCell'

export function ResultsTable() {
  const results = useAppStore((s) => s.results)
  const updateResult = useAppStore((s) => s.updateResult)
  const deleteResult = useAppStore((s) => s.deleteResult)

  if (results.length === 0) return null

  const needReview = results.filter((r) => r.lowConfidence).length

  return (
    <div style={{ width: '100%' }}>
      {/* Summary row */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          color: 'var(--color-muted)',
          marginBottom: '12px',
          paddingLeft: '2px',
        }}
      >
        <span style={{ color: 'var(--color-text)' }}>{results.length}</span>{' '}
        record{results.length !== 1 ? 's' : ''}
        {needReview > 0 && (
          <>
            {' — '}
            <span style={{ color: 'var(--color-warning)' }}>
              {needReview} need{needReview !== 1 ? '' : 's'} review
            </span>
          </>
        )}
      </p>

      {/* Scrollable table */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <table
          style={{
            width: '100%',
            minWidth: '520px',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {[
                { label: '#', w: '36px' },
                { label: 'First Name', w: 'auto' },
                { label: 'Last Name', w: 'auto' },
                { label: 'Phone', w: '140px' },
                { label: 'Email', w: '170px' },
                { label: '', w: '44px' },
              ].map((col, i) => (
                <th
                  key={i}
                  style={{
                    padding: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--color-muted)',
                    whiteSpace: 'nowrap',
                    width: col.w !== 'auto' ? col.w : undefined,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  backgroundColor: row.lowConfidence
                    ? 'rgba(255,170,0,0.07)'
                    : idx % 2 === 0
                    ? 'var(--color-surface)'
                    : 'var(--color-surface-alt)',
                  borderLeft: `3px solid ${row.lowConfidence ? 'var(--color-warning)' : 'transparent'}`,
                }}
              >
                {/* Row # + warning */}
                <td
                  style={{
                    padding: '0 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-muted)',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                  }}
                >
                  {row.lowConfidence && (
                    <span
                      title="Low OCR confidence — please review"
                      style={{ color: 'var(--color-warning)', marginRight: '3px' }}
                    >
                      ⚠
                    </span>
                  )}
                  {String(idx + 1).padStart(2, '0')}
                </td>

                <td style={{ padding: 0 }}>
                  <EditableCell
                    value={row.firstName}
                    onChange={(v) => updateResult(row.id, 'firstName', v)}
                    placeholder="first name"
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <EditableCell
                    value={row.lastName}
                    onChange={(v) => updateResult(row.id, 'lastName', v)}
                    placeholder="last name"
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <EditableCell
                    value={row.phone}
                    onChange={(v) => updateResult(row.id, 'phone', v)}
                    placeholder="phone"
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <EditableCell
                    value={row.email}
                    onChange={(v) => updateResult(row.id, 'email', v)}
                    placeholder="email"
                  />
                </td>

                {/* Delete — always visible at low opacity, not hover-only */}
                <td style={{ padding: 0, verticalAlign: 'middle', textAlign: 'center' }}>
                  <button
                    onClick={() => deleteResult(row.id)}
                    aria-label="Delete row"
                    style={{
                      width: '44px',
                      height: '44px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-muted)',
                      fontSize: '0.875rem',
                      opacity: 0.4,
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.4')}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
