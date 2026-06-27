import { useStore, money } from '../store'
import { Button, Card } from '../components/ui'

export function Summary() {
  const { state, personById } = useStore()

  const total = state.items.reduce((s, it) => s + (it.appraisedValue ?? it.estValue ?? 0), 0)
  const heirs = state.people.filter((p) => p.role !== 'owner')

  return (
    <div>
      <h1 className="text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
        For my family
      </h1>
      <p className="text-ink-soft mt-1 text-lg">
        A gentle summary of everything in {state.ownerName}’s binder — written so loved ones understand
        not just what each thing is, but what it means.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={() => window.print()}>🖨️ Print this binder</Button>
        <Button variant="secondary" onClick={() => alert('In the full app, this shares a beautiful summary with your family by email.')}>
          💌 Share with family
        </Button>
      </div>

      {/* Overview */}
      <Card className="mt-6 p-6">
        <p className="text-lg leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
          This binder holds <strong>{state.items.length} treasured belongings</strong>, with a combined
          estimated value of <strong>{money(total)}</strong>. {heirs.length} family members are part of
          it. Below is what each person has been entrusted with, and the story behind it.
        </p>
      </Card>

      {/* By heir */}
      {heirs.map((heir) => {
        const theirs = state.items.filter((it) => it.beneficiaryId === heir.id)
        if (theirs.length === 0) return null
        const sum = theirs.reduce((s, it) => s + (it.appraisedValue ?? it.estValue ?? 0), 0)
        return (
          <div key={heir.id} className="mt-8">
            <h2 className="text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
              For {heir.name} <span className="text-ink-soft text-lg">· {heir.relationship}</span>
            </h2>
            <p className="text-ink-soft">
              {theirs.length} item{theirs.length === 1 ? '' : 's'} · {money(sum)}
            </p>
            <div className="mt-3 space-y-3">
              {theirs.map((it) => (
                <Card key={it.id} className="p-5 flex gap-4">
                  <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cream-deep text-3xl">
                    {it.photo ? <img src={it.photo} className="h-full w-full object-cover" alt="" /> : it.emoji}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {it.name} <span className="text-ink-soft font-normal">— {money(it.appraisedValue ?? it.estValue)}</span>
                    </h3>
                    <p className="text-ink-soft mt-1 italic" style={{ fontFamily: 'Georgia, serif' }}>
                      “{it.story}”
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Not yet assigned */}
      {(() => {
        const unassigned = state.items.filter((it) => !it.beneficiaryId)
        if (unassigned.length === 0) return null
        return (
          <div className="mt-8">
            <h2 className="text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
              Not yet decided
            </h2>
            <p className="text-ink-soft">
              {unassigned.length} item{unassigned.length === 1 ? '' : 's'} haven’t been assigned to anyone yet:
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {unassigned.map((it) => {
                void personById
                return (
                  <li key={it.id} className="rounded-full bg-cream-deep px-4 py-2">
                    {it.emoji} {it.name}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })()}
    </div>
  )
}
