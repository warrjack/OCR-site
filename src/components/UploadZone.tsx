import { useRef, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'

const ACCEPTED = '.jpg,.jpeg,.png,.webp'

export function UploadZone() {
  const addToQueue = useAppStore((s) => s.addToQueue)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const filtered = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      )
      if (filtered.length > 0) addToQueue(filtered)
    },
    [addToQueue],
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragging(false)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={dragging ? '' : 'upload-zone-idle'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        minHeight: '200px',
        padding: '40px 24px',
        border: `2px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
        backgroundColor: dragging ? 'rgba(184,255,87,0.05)' : 'var(--color-surface)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
      />

      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: dragging ? 'var(--color-accent)' : 'var(--color-muted)' }}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            fontWeight: 500,
            color: dragging ? 'var(--color-accent)' : 'var(--color-text)',
            marginBottom: '6px',
          }}
        >
          {dragging ? 'Drop images here' : 'Tap to add photos'}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
          }}
        >
          JPG · PNG · WEBP — multiple files OK
        </p>
      </div>
    </div>
  )
}
