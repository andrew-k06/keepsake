import { useState } from 'react'
import { useStore } from '../store'
import { Avatar, Button, Card, Field, Pill, inputClass } from '../components/ui'
import { GuideReturnPill } from '../components/GuideReturnPill'
import { UserPlus, Lock, Trash2, LifeBuoy } from '../components/icons'
import type { Person } from '../types'

const roleTone: Record<string, 'neutral' | 'sage' | 'clay'> = {
  owner: 'clay',
  collaborator: 'sage',
  viewer: 'neutral',
  executor: 'clay',
}

const roleLabel = (role: Person['role']) =>
  role === 'owner'
    ? 'You'
    : role === 'collaborator'
      ? 'Can help add & edit'
      : role === 'executor'
        ? 'Trusted contact'
        : 'Can view'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Family() {
  const { state, addPerson, updatePerson, removePerson, setExecutorAccess } = useStore()
  const trusted = state.executorAccess?.personId
    ? state.people.find((p) => p.id === state.executorAccess?.personId)
    : undefined
  const [showInvite, setShowInvite] = useState(false)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [relationship, setRelationship] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [role, setRole] = useState<'collaborator' | 'viewer'>('viewer')

  const colors = ['#4a7c6a', '#d99a3f', '#c2603d', '#6b6157', '#356152']

  const invite = () => {
    let ok = true
    if (!name.trim()) {
      setNameError('Please add their name.')
      ok = false
    }
    if (email && !EMAIL_RE.test(email)) {
      setEmailError('That email doesn’t look complete — for example, sarah@example.com.')
      ok = false
    }
    if (!ok) return
    addPerson({
      name: name.trim(),
      relationship: relationship.trim() || 'Family',
      email: email.trim() || undefined,
      role,
      color: colors[state.people.length % colors.length],
    })
    setName('')
    setRelationship('')
    setEmail('')
    setShowInvite(false)
  }

  const remove = (p: Person) => {
    if (
      window.confirm(
        `Remove ${p.name} from your binder? Any items you wished for them will go back to “Not yet decided.”`,
      )
    ) {
      removePerson(p.id)
    }
  }

  return (
    <div>
      <GuideReturnPill />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">Family & loved ones</h1>
          <p className="text-ink-soft mt-1 text-lg">
            Add the people you trust, so you can assign keepsakes and print a summary for them.
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowInvite((s) => !s)}>
          Add someone
        </Button>
      </div>

      {showInvite && (
        <Card className="mt-6 p-6">
          <h2 className="text-2xl mb-4">Add a family member</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Their name" error={nameError}>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (e.target.value.trim()) setNameError('')
                }}
              />
            </Field>
            <Field label="Relationship">
              <input
                className={inputClass}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Daughter, Son, Friend…"
              />
            </Field>
            <Field label="Email (optional)" error={emailError}>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder="name@example.com"
              />
            </Field>
            <Field label="What can they do?">
              <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                <option value="viewer">View only</option>
                <option value="collaborator">Help me add & edit</option>
              </select>
            </Field>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            In this preview, no email is sent — you’re adding them to your binder so you can assign
            items and print a summary for them. Online sharing and invitations come with the full app.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button onClick={invite}>Add to my binder</Button>
          </div>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {state.people.map((p) => (
          <Card key={p.id} className="p-5 flex flex-wrap items-center gap-4">
            <Avatar name={p.name} color={p.color} />
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold">
                {p.name}{' '}
                {p.relationship !== 'Me' && <span className="text-ink-soft font-normal">· {p.relationship}</span>}
              </div>
              {p.email && <div className="text-ink-soft text-sm">{p.email}</div>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {p.role === 'owner' ? (
                <Pill tone={roleTone[p.role]}>{roleLabel(p.role)}</Pill>
              ) : (
                <>
                  <label className="sr-only" htmlFor={`role-${p.id}`}>
                    What {p.name} can do
                  </label>
                  <select
                    id={`role-${p.id}`}
                    value={p.role}
                    onChange={(e) => updatePerson(p.id, { role: e.target.value as Person['role'] })}
                    className="rounded-xl border-2 border-line bg-white px-3 py-2 text-sm font-semibold focus:border-clay outline-none"
                  >
                    <option value="viewer">Can view</option>
                    <option value="collaborator">Can help add & edit</option>
                  </select>
                  <button
                    onClick={() => remove(p)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-ink-soft hover:text-clay-dark"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    Remove
                  </button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Trusted contact — designated now, dormant until verified. Never a
          silent death-triggered switch; the owner stays in control. */}
      <Card className="mt-8 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay">
            <LifeBuoy className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <h2 className="text-2xl">If something ever happens</h2>
        </div>
        {trusted ? (
          <p className="mt-3 text-ink-soft">
            <span className="font-semibold text-ink">{trusted.name}</span> is your trusted contact.
            They see nothing today. If they ever needed access, they would have to send in official
            papers (a death certificate, or court documents if you couldn’t speak for yourself);
            after the papers are verified there is a{' '}
            <span className="font-semibold text-ink">{state.executorAccess?.waitDays}-day waiting period</span>{' '}
            — you and everyone in this binder would be told, and you could stop it with one word.
            Even then, access is read-only: no one else can ever change your wishes.
          </p>
        ) : (
          <p className="mt-3 text-ink-soft">
            You can name one person who could <em>ask</em> for access to this binder if something
            happened to you. They would see nothing until official papers were verified and a waiting
            period passed — and you could always say no. Naming someone is optional and takes effect
            only through that careful process.
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="trusted-select">
            Trusted contact
          </label>
          <select
            id="trusted-select"
            className="rounded-xl border-2 border-line bg-white px-3 py-2.5 font-semibold focus:border-clay outline-none"
            value={state.executorAccess?.personId ?? ''}
            onChange={(e) =>
              e.target.value
                ? setExecutorAccess({
                    personId: e.target.value,
                    protocol: 'verified-documents',
                    waitDays: state.executorAccess?.waitDays ?? 14,
                  })
                : setExecutorAccess(undefined)
            }
          >
            <option value="">No trusted contact named</option>
            {state.people
              .filter((p) => p.role !== 'owner')
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relationship})
                </option>
              ))}
          </select>
          {trusted && (
            <select
              aria-label="Waiting period"
              className="rounded-xl border-2 border-line bg-white px-3 py-2.5 font-semibold focus:border-clay outline-none"
              value={state.executorAccess?.waitDays ?? 14}
              onChange={(e) =>
                setExecutorAccess({
                  personId: state.executorAccess!.personId,
                  protocol: 'verified-documents',
                  waitDays: Number(e.target.value),
                })
              }
            >
              {[7, 14, 30].map((d) => (
                <option key={d} value={d}>
                  {d}-day waiting period
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          This names a contact inside Keepsake only — it doesn’t make anyone your legal executor.
          That comes from your will; your attorney is the right person to ask.
        </p>
      </Card>

      <Card className="mt-8 p-6 bg-sage/5 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
          <Lock className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-ink-soft">
          <span className="font-semibold text-ink">Your privacy comes first.</span> Right now your
          binder lives only on this device — no one can see it unless you show them or print it. You
          can change what anyone here can do, or remove them, at any time. Every important change is
          written down below, so nothing happens quietly. When online sharing arrives, each person
          will see only what you allow.
        </p>
      </Card>

      {/* Activity — the binder's plain-language record of important changes */}
      {state.audit.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl">What has changed</h2>
          <p className="text-ink-soft">
            A record of the important changes in this binder — wishes, people, and access.
          </p>
          <Card className="mt-3 divide-y divide-line p-0">
            {state.audit.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-baseline justify-between gap-4 px-5 py-3">
                <span>{a.action}</span>
                <span className="shrink-0 text-sm text-ink-soft">
                  {new Date(a.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
