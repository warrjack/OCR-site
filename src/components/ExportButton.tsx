import Papa from 'papaparse'
import { useAppStore } from '../store/useAppStore'

export function ExportButton() {
  const results = useAppStore((s) => s.results)
  const disabled = results.length === 0

  function handleExport() {
    if (disabled) return

    const rows = results.map((r) => ({
      'First Name': r.firstName,
      'Last Name': r.lastName,
      'Phone Number': r.phone,
      Email: r.email,
    }))

    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const date = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts_${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      style={{
        display: 'block',
        width: '100%',
        padding: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        backgroundColor: disabled ? 'var(--color-border)' : 'var(--color-accent)',
        color: disabled ? 'var(--color-muted)' : '#0f0f0f',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s',
      }}
    >
      {disabled
        ? 'No records to export'
        : `Export CSV — ${results.length} record${results.length !== 1 ? 's' : ''}`}
    </button>
  )
}
