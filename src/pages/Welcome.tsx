import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { BookHeart, Camera, Quote, Gift, Lock, ArrowRight } from '../components/icons'

const STEPS = [
  {
    icon: Camera,
    t: 'Photograph it',
    d: 'Snap a picture — we help fill in the details for you.',
  },
  {
    icon: Quote,
    t: 'Tell its story',
    d: 'Capture why it matters, in your own words.',
  },
  {
    icon: Gift,
    t: 'Pass it on',
    d: 'Share it with your family when you’re ready.',
  },
]

export function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="min-h-full bg-gradient-to-b from-cream to-cream-deep">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-clay text-white shadow-lift">
          <BookHeart className="h-10 w-10" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <h1 className="mt-8 text-5xl leading-tight md:text-6xl">
          A warm place for the things <br className="hidden md:block" /> that matter most.
        </h1>

        <p className="mt-6 max-w-xl text-xl text-ink-soft">
          Keepsake helps you gather your treasured belongings, their stories, and your wishes — into
          one gentle binder you can pass on to the people you love.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" icon={BookHeart} onClick={() => navigate('/binder')}>
            Open Margaret’s Binder
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/binder')}>
            Take a tour
          </Button>
        </div>

        <div className="mt-20 w-full max-w-2xl">
          <div className="mb-8 flex items-center justify-center gap-4 text-ink-soft">
            <span className="h-px w-12 bg-line-strong" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">How it works</span>
            <span className="h-px w-12 bg-line-strong" aria-hidden="true" />
          </div>

          <div className="grid gap-5 text-left sm:grid-cols-3">
            {STEPS.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.t}
                  className="rounded-3xl border border-line bg-white/80 p-6 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream-deep text-clay">
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-ink-soft">Step {i + 1}</span>
                  </div>
                  <div className="mt-4 text-lg font-semibold">{f.t}</div>
                  <div className="mt-1 text-ink-soft">{f.d}</div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="mt-16 inline-flex items-center gap-2 text-sm text-ink-soft">
          <Lock className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          Private by design. Only the people you invite can ever see your binder.
        </p>

        <button
          onClick={() => navigate('/binder')}
          className="mt-8 inline-flex items-center gap-1.5 text-base font-semibold text-clay transition hover:text-clay-dark"
        >
          Start your own binder
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
