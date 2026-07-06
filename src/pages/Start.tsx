import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Button, Card, Field, InlineError, inputClass } from '../components/ui'
import { BookHeart, ChevronLeft } from '../components/icons'

/**
 * First-run onboarding: a real "start your own binder" path so no one lands
 * confused inside a stranger's demo data. One decision per screen.
 */
export function Start() {
  const navigate = useNavigate()
  const { state, startFresh } = useStore()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // If the current binder already has the user's own items, replacing it must
  // be a deliberate, explained choice — never a silent wipe.
  const hasExistingData = state.items.length > 0 || state.emergency.length > 0
  const isDemo = state.ownerName === 'Margaret'

  const begin = () => {
    if (!name.trim()) {
      setError('Please tell us your first name so the binder is yours.')
      return
    }
    if (
      hasExistingData &&
      !isDemo &&
      !window.confirm(
        `Start a brand-new binder? Your current binder (${state.binderName}) and everything in it will be replaced.`,
      )
    ) {
      return
    }
    startFresh(name)
    navigate('/add')
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-cream to-cream-deep">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <button
          onClick={() => navigate('/')}
          className="inline-flex min-h-11 items-center gap-1 self-start py-2 text-ink-soft hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          Back
        </button>

        <span className="mt-6 grid h-16 w-16 place-items-center rounded-3xl bg-clay text-white shadow-lift">
          <BookHeart className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-4xl">Let’s make it yours.</h1>
        <p className="mt-3 text-lg text-ink-soft">
          One question, then we’ll add your first item together. There’s no account and no bill —
          your binder lives on this device.
        </p>

        <Card className="mt-8 p-7">
          <Field label="What’s your name?">
            <input
              className={inputClass}
              value={name}
              autoFocus
              onChange={(e) => {
                setName(e.target.value)
                if (e.target.value.trim()) setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && begin()}
              placeholder="Margaret"
            />
          </Field>
          {error && <InlineError>{error}</InlineError>}
          <div className="mt-5">
            <Button full size="lg" onClick={begin}>
              Create my binder
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-sm text-ink-soft">
          Rather look around first?{' '}
          <button onClick={() => navigate('/binder')} className="font-semibold text-clay-dark underline">
            See Margaret’s example binder
          </button>
        </p>
      </div>
    </div>
  )
}
