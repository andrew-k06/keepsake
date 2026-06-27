import { useState } from 'react'
import { useStore } from '../store'
import { Avatar, Button, Card, Pill } from '../components/ui'
import { UserPlus, Lock } from '../components/icons'

const roleTone: Record<string, 'neutral' | 'sage' | 'clay'> = {
  owner: 'clay',
  collaborator: 'sage',
  viewer: 'neutral',
  executor: 'clay',
}

export function Family() {
  const { state, addPerson } = useStore()
  const [showInvite, setShowInvite] = useState(false)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'collaborator' | 'viewer' | 'executor'>('viewer')

  const colors = ['#4a7c6a', '#d99a3f', '#c2603d', '#6b6157', '#356152']

  const invite = () => {
    if (!name) return
    addPerson({
      name,
      relationship: relationship || 'Family',
      email,
      role,
      color: colors[state.people.length % colors.length],
      invited: true,
    })
    setName('')
    setRelationship('')
    setEmail('')
    setShowInvite(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">Family & loved ones</h1>
          <p className="text-ink-soft mt-1 text-lg">
            Invite the people you trust. You choose exactly what each person can see.
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowInvite((s) => !s)}>
          Invite someone
        </Button>
      </div>

      {showInvite && (
        <Card className="mt-6 p-6">
          <h2 className="text-2xl mb-4">Invite a family member</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Labeled label="Their name">
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
            </Labeled>
            <Labeled label="Relationship">
              <input
                className={input}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Daughter, Son, Friend…"
              />
            </Labeled>
            <Labeled label="Email">
              <input
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </Labeled>
            <Labeled label="What can they do?">
              <select className={input} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                <option value="viewer">View only</option>
                <option value="collaborator">Help me add & edit</option>
                <option value="executor">Executor (access in an emergency)</option>
              </select>
            </Labeled>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button onClick={invite}>Send invitation</Button>
          </div>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {state.people.map((p) => (
          <Card key={p.id} className="p-5 flex items-center gap-4">
            <Avatar name={p.name} color={p.color} />
            <div className="flex-1">
              <div className="text-lg font-semibold">
                {p.name}{' '}
                {p.relationship !== 'Me' && <span className="text-ink-soft font-normal">· {p.relationship}</span>}
              </div>
              {p.email && <div className="text-ink-soft text-sm">{p.email}</div>}
            </div>
            <div className="flex items-center gap-2">
              {p.invited && <Pill>Invitation sent</Pill>}
              <Pill tone={roleTone[p.role]}>
                {p.role === 'owner'
                  ? 'You'
                  : p.role === 'collaborator'
                    ? 'Can edit'
                    : p.role === 'executor'
                      ? 'Executor'
                      : 'Can view'}
              </Pill>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6 bg-sage/5 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
          <Lock className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-ink-soft">
          <span className="font-semibold text-ink">Your privacy comes first.</span> Family members only
          see what you allow. You can change or remove anyone’s access at any time, and you’ll always be
          able to see who has looked at your binder.
        </p>
      </Card>
    </div>
  )
}

const input = 'w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-clay outline-none'

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-semibold">{label}</span>
      {children}
    </label>
  )
}
