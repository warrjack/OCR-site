import { createWorker } from 'tesseract.js'
import { parseOcrText, type ParsedContact } from './parse'

export interface OcrResult extends ParsedContact {
  confidence: number
  rawText: string
}

function preprocessImage(objectUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const MAX_DIM = 2000
      const MIN_DIM = 800
      const longestSide = Math.max(img.width, img.height)
      let scale = 1
      if (longestSide < MIN_DIM) scale = MIN_DIM / longestSide
      if (longestSide * scale > MAX_DIM) scale = MAX_DIM / longestSide

      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.6 + 128))
        d[i] = d[i + 1] = d[i + 2] = contrasted
      }
      ctx.putImageData(imageData, 0, 0)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = objectUrl
  })
}

export async function runOcr(
  objectUrl: string,
  onProgress?: (p: number) => void,
): Promise<OcrResult> {
  const preprocessed = await preprocessImage(objectUrl)

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round((m.progress ?? 0) * 100))
      }
    },
  })

  try {
    const { data } = await worker.recognize(preprocessed)
    const parsed = parseOcrText(data.text)
    return {
      ...parsed,
      confidence: data.confidence,
      rawText: data.text,
    }
  } finally {
    await worker.terminate()
  }
}
