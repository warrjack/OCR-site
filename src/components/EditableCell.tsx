import { useState, useRef, useEffect } from 'react'

interface EditableCellProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function EditableCell({ value, onChange, placeholder }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  function commit() {
    setEditing(false)
    onChange(draft)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        style={{
          display: 'block',
          width: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-accent)',
          color: 'var(--color-text)',
          padding: '10px 8px',
          outline: 'none',
          minHeight: '44px',
        }}
      />
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
      style={{
        display: 'block',
        width: '100%',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem',
        padding: '10px 8px',
        minHeight: '44px',
        cursor: 'text',
        userSelect: 'none',
        color: value ? 'var(--color-text)' : 'var(--color-muted)',
      }}
    >
      {value || (placeholder ?? '—')}
    </span>
  )
}
