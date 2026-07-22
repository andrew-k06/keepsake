import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { exportBinder, readBackupFile } from '../lib/backup'
import { Button, Card, DemoTag, Pill } from '../components/ui'
import { BookHeart, Gift, TrendingUp, CircleCheckBig, FileText, Undo2 } from '../components/icons'
import { STARTER_ITEM_LIMIT } from '../types'
import { useConfirm } from '../components/Confirm'

/**
 * Plans. Structure over copy: the senior-facing offer is buy-once-own-forever
 * (this generation is right to distrust subscriptions); the only subscription
 * is the Family Plan, meant to be paid by an adult child. Checkout here is a
 * labeled preview — no payment is ever taken in this build.
 */
export function Plan() {
  const navigate = useNavigate()
  const { state, setPlan, logEvent, replaceBinder } = useStore()
  const tier = state.plan.tier
  const confirm = useConfirm()
  const importRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState('')

  const doExport = async () => {
    await exportBinder(state)
    logEvent('You downloaded a backup of your binder')
  }

  const doImport = async (file: File) => {
    setImportError('')
    try {
      const next = await readBackupFile(file)
      if (
        await confirm({
          title: `Restore “${next.binderName}”?`,
          body: `Your current binder (${state.binderName}) will be replaced by the one in this file.`,
          confirmLabel: 'Restore it',
          cancelLabel: 'Go back',
        })
      ) {
        replaceBinder(next)
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'That file could not be read.')
    }
  }

  const activate = (t: 'binder' | 'family') => {
    setPlan({
      ...state.plan,
      tier: t,
      activatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl">Your Keepsake plan</h1>
      <p className="mt-2 text-lg text-ink-soft">
        One honest price, no monthly fees for you, and your binder is always yours — print it or
        export it anytime, whatever you decide.
      </p>
      <p className="mt-3">
        <DemoTag>Preview checkout — no payment is taken in this demo</DemoTag>
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {/* Starter */}
        <Card className={`p-6 ${tier === 'starter' ? 'border-2 border-sage' : ''}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Starter</h2>
            {tier === 'starter' && <Pill tone="sage">Your plan</Pill>}
          </div>
          <p className="mt-1 text-3xl font-semibold">Free</p>
          <ul className="mt-4 space-y-2 text-ink-soft">
            <Feature>Up to {STARTER_ITEM_LIMIT} items, each with room for its story</Feature>
            <Feature>The “In an emergency” guide</Feature>
            <Feature>Family members &amp; wishes</Feature>
          </ul>
        </Card>

        {/* Binder */}
        <Card className={`p-6 ${tier === 'binder' ? 'border-2 border-sage' : ''}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Keepsake Binder</h2>
            {tier === 'binder' && <Pill tone="sage">Your plan</Pill>}
          </div>
          <p className="mt-1 text-3xl font-semibold">
            $129 <span className="text-base font-normal text-ink-soft">once — yours forever</span>
          </p>
          <ul className="mt-4 space-y-2 text-ink-soft">
            <Feature>Unlimited items and rooms</Feature>
            <Feature>Printable “For my family” book</Feature>
            <Feature>Photo suggestions &amp; value help</Feature>
            <Feature>No subscription. Ever.</Feature>
          </ul>
          {tier === 'starter' && (
            <div className="mt-5">
              <Button full icon={BookHeart} onClick={() => activate('binder')}>
                Get the Binder (preview)
              </Button>
            </div>
          )}
        </Card>

        {/* Family */}
        <Card className={`p-6 ${tier === 'family' ? 'border-2 border-sage' : ''}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Family Plan</h2>
            {tier === 'family' && <Pill tone="sage">Your plan</Pill>}
          </div>
          <p className="mt-1 text-3xl font-semibold">
            $79<span className="text-base font-normal text-ink-soft">/yr — usually paid by family</span>
          </p>
          <ul className="mt-4 space-y-2 text-ink-soft">
            <Feature>Everything in the Binder</Feature>
            <Feature>
              <span className="inline-flex items-center gap-1">
                Market watching on your items <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </span>
            </Feature>
            <Feature>Priority appraisal booking</Feature>
          </ul>
          {tier !== 'family' && (
            <div className="mt-5">
              <Button full variant="secondary" icon={Gift} onClick={() => activate('family')}>
                Activate (preview)
              </Button>
            </div>
          )}
        </Card>
      </div>

      {state.plan.giftFrom && (
        <Card className="mt-8 flex items-start gap-4 bg-sage/5 p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
            <Gift className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="text-ink-soft">
            <span className="font-semibold text-ink">This binder was a gift from {state.plan.giftFrom}.</span>{' '}
            There is nothing for you to pay, ever — they wanted your stories kept safe.
          </p>
        </Card>
      )}

      {/* Your data — the export that makes "always yours" literal */}
      <Card className="mt-8 p-6">
        <h2 className="text-2xl">Your binder is yours</h2>
        <p className="mt-2 text-ink-soft">
          Download everything — photos, stories, wishes, notes — as one file you keep. It works on
          any plan, forever, and you can bring it back here (or take it anywhere else) whenever you
          like.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" icon={FileText} onClick={() => void doExport()}>
            Download everything
          </Button>
          <Button variant="ghost" icon={Undo2} onClick={() => importRef.current?.click()}>
            Restore from a backup file
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void doImport(f)
              e.target.value = ''
            }}
          />
        </div>
        {importError && (
          <p aria-live="polite" className="mt-3 font-semibold text-clay-dark">
            {importError}
          </p>
        )}
      </Card>

      <p className="mt-8 text-sm text-ink-soft">
        Our promise: one plain price, no countdown timers, no surprise renewals, and cancelling the
        Family Plan takes one phone call. Your binder — every photo and story — can always be printed
        or exported, on any plan.
      </p>

      <div className="mt-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    </div>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CircleCheckBig className="mt-1 h-4 w-4 shrink-0 text-sage-deep" strokeWidth={2.25} aria-hidden="true" />
      <span>{children}</span>
    </li>
  )
}
