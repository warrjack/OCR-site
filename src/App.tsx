import { useEffect, useState } from 'react'
import { useAppStore, loadStoredResults, type ResultRow } from './store/useAppStore'
import { UploadZone } from './components/UploadZone'
import { QueueItem } from './components/QueueItem'
import { ResultsTable } from './components/ResultsTable'
import { ExportButton } from './components/ExportButton'

export default function App() {
  const queue = useAppStore((s) => s.queue)
  const results = useAppStore((s) => s.results)
  const isProcessing = useAppStore((s) => s.isProcessing)
  const processAll = useAppStore((s) => s.processAll)
  const restoreResults = useAppStore((s) => s.restoreResults)
  const clearAll = useAppStore((s) => s.clearAll)

  const [savedData, setSavedData] = useState<ResultRow[] | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    const stored = loadStoredResults()
    if (stored) setSavedData(stored)
  }, [])

  const showBanner = savedData !== null && !bannerDismissed && results.length === 0

  function handleContinue() {
    if (savedData) restoreResults(savedData)
    setBannerDismissed(true)
  }

  function handleStartFresh() {
    clearAll()
    setSavedData(null)
    setBannerDismissed(true)
  }

  const pendingCount = queue.filter((q) => q.status === 'pending').length
  const activeCount = queue.filter((q) => q.status === 'processing').length
  const canProcess = pendingCount > 0 && !isProcessing

  const processLabel = isProcessing
    ? `Processing${activeCount > 0 ? '…' : ' — queued'}`
    : `Process all  ·  ${pendingCount} pending`

  return (
    <div style={{ minHeight: '100svh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: '16px',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--color-accent)',
                margin: 0,
                lineHeight: 1,
              }}
            >
              SheetScan
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--color-muted)',
                marginTop: '4px',
              }}
            >
              in-browser OCR → CSV
            </p>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '24px 16px',
          paddingBottom: results.length > 0 ? '100px' : '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Session banner */}
        {showBanner && (
          <div
            style={{
              border: '1px solid var(--color-warning)',
              backgroundColor: 'rgba(255,170,0,0.07)',
              padding: '16px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
                marginBottom: '14px',
              }}
            >
              You have{' '}
              <span style={{ color: 'var(--color-warning)' }}>
                {savedData!.length} record{savedData!.length !== 1 ? 's' : ''}
              </span>{' '}
              from your last session.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleContinue}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  backgroundColor: 'var(--color-accent)',
                  color: '#0f0f0f',
                  border: 'none',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Continue
              </button>
              <button
                onClick={handleStartFresh}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  backgroundColor: 'transparent',
                  color: 'var(--color-muted)',
                  border: '1px solid var(--color-border)',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Start fresh
              </button>
            </div>
          </div>
        )}

        {/* Upload */}
        <section>
          <SectionLabel>Upload</SectionLabel>
          <UploadZone />
        </section>

        {/* Queue */}
        {queue.length > 0 && (
          <section>
            <SectionLabel>
              {queue.length} image{queue.length !== 1 ? 's' : ''} queued
            </SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {queue.map((item) => (
                <QueueItem key={item.id} item={item} />
              ))}
            </div>

            <button
              onClick={processAll}
              disabled={!canProcess}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '12px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                backgroundColor: canProcess ? 'var(--color-accent)' : 'var(--color-border)',
                color: canProcess ? '#0f0f0f' : 'var(--color-muted)',
                border: 'none',
                cursor: canProcess ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.15s',
              }}
            >
              {processLabel}
            </button>
          </section>
        )}

        {/* Results */}
        {results.length > 0 && (
          <section>
            <SectionLabel>Extracted Records</SectionLabel>
            <ResultsTable />
          </section>
        )}
      </main>

      {/* Fixed export bar */}
      {results.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: '12px 16px',
          }}
        >
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <ExportButton />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--color-muted)',
        marginBottom: '10px',
      }}
    >
      {children}
    </p>
  )
}
