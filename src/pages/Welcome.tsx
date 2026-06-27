import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'

export function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="min-h-full bg-gradient-to-b from-cream to-cream-deep">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-clay text-white text-4xl shadow-lg">
          ❦
        </span>
        <h1 className="mt-8 text-5xl md:text-6xl leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          A warm place for the things <br className="hidden md:block" /> that matter most.
        </h1>
        <p className="mt-6 max-w-xl text-xl text-ink-soft">
          Keepsake helps you gather your treasured belongings, their stories, and your wishes — into one
          gentle binder you can pass on to the people you love.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/binder')}>Open Margaret’s Binder →</Button>
          <Button variant="secondary" onClick={() => navigate('/binder')}>
            Take a tour
          </Button>
        </div>

        <div className="mt-16 grid w-full max-w-2xl gap-4 sm:grid-cols-3 text-left">
          {[
            { icon: '📷', t: 'Photograph it', d: 'Snap a picture — we help fill in the rest.' },
            { icon: '💬', t: 'Tell its story', d: 'Capture why it matters, in your own words.' },
            { icon: '💌', t: 'Pass it on', d: 'Share with your family when you’re ready.' },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl bg-white/70 border border-line p-5">
              <div className="text-3xl">{f.icon}</div>
              <div className="mt-2 font-semibold text-lg">{f.t}</div>
              <div className="text-ink-soft">{f.d}</div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-ink-soft">
          🔒 Private by design. Only the people you invite can ever see your binder.
        </p>
      </div>
    </div>
  )
}
