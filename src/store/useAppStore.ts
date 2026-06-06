import { create } from 'zustand'
import { runOcr } from '../lib/ocr'

export type QueueStatus = 'pending' | 'processing' | 'done' | 'error'

export interface QueueItem {
  id: string
  file: File
  objectUrl: string
  status: QueueStatus
  progress: number
  error?: string
}

export interface ResultRow {
  id: string
  sourceImageName: string
  firstName: string
  lastName: string
  phone: string
  email: string
  lowConfidence: boolean
}

const STORAGE_KEY = 'sheetscan_results'

interface AppState {
  queue: QueueItem[]
  results: ResultRow[]
  isProcessing: boolean

  addToQueue: (files: FileList | File[]) => void
  removeFromQueue: (id: string) => void
  processAll: () => Promise<void>
  updateResult: (
    id: string,
    field: 'firstName' | 'lastName' | 'phone' | 'email',
    value: string,
  ) => void
  deleteResult: (id: string) => void
  loadFromStorage: () => ResultRow[] | null
  restoreResults: (rows: ResultRow[]) => void
  clearAll: () => void
}

function saveToStorage(results: ResultRow[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function loadStoredResults(): ResultRow[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ResultRow[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

export const useAppStore = create<AppState>((set, get) => ({
  queue: [],
  results: [],
  isProcessing: false,

  addToQueue: (files) => {
    const items: QueueItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      objectUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }))
    set((s) => ({ queue: [...s.queue, ...items] }))
  },

  removeFromQueue: (id) => {
    const item = get().queue.find((q) => q.id === id)
    if (item) URL.revokeObjectURL(item.objectUrl)
    set((s) => ({ queue: s.queue.filter((q) => q.id !== id) }))
  },

  processAll: async () => {
    const { queue, isProcessing } = get()
    if (isProcessing) return
    const pending = queue.filter((q) => q.status === 'pending')
    if (pending.length === 0) return

    set({ isProcessing: true })

    for (const item of pending) {
      set((s) => ({
        queue: s.queue.map((q) =>
          q.id === item.id ? { ...q, status: 'processing', progress: 0 } : q,
        ),
      }))

      try {
        const result = await runOcr(item.objectUrl, (progress) => {
          set((s) => ({
            queue: s.queue.map((q) =>
              q.id === item.id ? { ...q, progress } : q,
            ),
          }))
        })

        const row: ResultRow = {
          id: crypto.randomUUID(),
          sourceImageName: item.file.name,
          firstName: result.firstName,
          lastName: result.lastName,
          phone: result.phone,
          email: result.email,
          lowConfidence: result.confidence < 70,
        }

        set((s) => {
          const newResults = [...s.results, row]
          saveToStorage(newResults)
          return {
            results: newResults,
            queue: s.queue.map((q) =>
              q.id === item.id
                ? { ...q, status: 'done', progress: 100 }
                : q,
            ),
          }
        })
      } catch (err) {
        set((s) => ({
          queue: s.queue.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'OCR failed',
                }
              : q,
          ),
        }))
      }
    }

    set({ isProcessing: false })
  },

  updateResult: (id, field, value) => {
    set((s) => {
      const newResults = s.results.map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      )
      saveToStorage(newResults)
      return { results: newResults }
    })
  },

  deleteResult: (id) => {
    set((s) => {
      const newResults = s.results.filter((r) => r.id !== id)
      saveToStorage(newResults)
      return { results: newResults }
    })
  },

  loadFromStorage: () => loadStoredResults(),

  restoreResults: (rows) => {
    set({ results: rows })
  },

  clearAll: () => {
    get().queue.forEach((q) => URL.revokeObjectURL(q.objectUrl))
    clearStorage()
    set({ queue: [], results: [] })
  },
}))
