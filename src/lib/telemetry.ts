// Crash telemetry for a privacy-first, device-local app: a small local ring
// buffer, no network. It ships out only inside the user's own backup file so
// support can diagnose without the app ever phoning home. Never include story
// text or binder content — messages and stacks only.

const KEY = 'keepsake.errors'
const LIMIT = 20

export interface ErrorRecord {
  at: string
  kind: string
  message: string
  stack?: string
}

export function recordError(kind: string, message: string, stack?: string): void {
  try {
    const log = readErrorLog()
    log.unshift({
      at: new Date().toISOString(),
      kind,
      message: String(message).slice(0, 300),
      stack: stack?.slice(0, 600),
    })
    localStorage.setItem(KEY, JSON.stringify(log.slice(0, LIMIT)))
  } catch {
    /* telemetry must never be the thing that crashes */
  }
}

export function readErrorLog(): ErrorRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as ErrorRecord[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function installGlobalErrorCapture(): void {
  window.addEventListener('error', (e) =>
    recordError('window.onerror', e.message, e.error instanceof Error ? e.error.stack : undefined),
  )
  window.addEventListener('unhandledrejection', (e) => {
    const r: unknown = e.reason
    recordError(
      'unhandledrejection',
      r instanceof Error ? r.message : String(r),
      r instanceof Error ? r.stack : undefined,
    )
  })
}
