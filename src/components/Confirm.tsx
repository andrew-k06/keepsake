import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from './ui'

interface ConfirmOptions {
  title: string
  body?: string
  confirmLabel?: string
  cancelLabel?: string
}

type Ask = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Ask | null>(null)

/**
 * Designed replacement for window.confirm: large type, warm styling, explicit
 * verb buttons ("Keep it / Remove it" beats OK/Cancel for this audience), and
 * it can't be missed or mis-styled by the OS.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<(v: boolean) => void>(() => {})

  const ask = useCallback<Ask>((o) => {
    setOpts(o)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const answer = (v: boolean) => {
    setOpts(null)
    resolver.current(v)
  }

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {opts && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={opts.title}
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-5"
          onClick={() => answer(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-2xl">{opts.title}</h2>
            {opts.body && <p className="mt-2 text-lg text-ink-soft">{opts.body}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => answer(false)}>
                {opts.cancelLabel ?? 'Go back'}
              </Button>
              <Button onClick={() => answer(true)}>{opts.confirmLabel ?? 'Yes'}</Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): Ask {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
