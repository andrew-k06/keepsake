// Backup & restore — the literal form of "your binder is yours."
//
// A device-local app's only honest durability story is an export the user
// holds. The file is the plain binder state (photos included as data URLs),
// readable by any future tool; import runs it through the same migrate()
// gate as storage, so a stale or hand-edited file can't crash the app.

import type { BinderState } from '../types'
import { migrate, inlinePhotos } from '../data/repository'
import { readErrorLog } from './telemetry'

export async function exportBinder(state: BinderState): Promise<void> {
  const stamp = new Date().toISOString().slice(0, 10)
  const name = `keepsake-binder-${stamp}.json`
  // The file must be complete on its own: pull stored photos back inline.
  const complete = await inlinePhotos(state)
  // _diagnostics: local crash log (messages/stacks only, never binder content)
  // so support can help without the app ever phoning home. migrate() ignores it.
  const payload = { ...complete, _diagnostics: readErrorLog() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Parse + validate a backup file. Throws with a plain-language message. */
export async function readBackupFile(file: File): Promise<BinderState> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('That file doesn’t look like a Keepsake backup (it isn’t valid JSON).')
  }
  const state = migrate(parsed)
  if (!state) {
    throw new Error('That file doesn’t look like a Keepsake backup — no binder was found inside it.')
  }
  return state
}
