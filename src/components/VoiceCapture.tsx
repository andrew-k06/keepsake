import { useEffect, useRef, useState } from 'react'
import { Mic, Square } from './icons'

// Minimal typings for the Web Speech API (not yet in lib.dom for all targets).
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

function getRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as Record<string, unknown>
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined
  if (!Ctor) return null
  try {
    return new Ctor()
  } catch {
    return null
  }
}

/**
 * VoiceCapture — "you talk, it writes."
 *
 * This generation tells stories; it doesn't type them. One large labeled
 * button (icon + words, never icon alone), live transcription in large type
 * so they can SEE it working, and the result is APPENDED to what's already
 * written — re-recording adds, it never erases. Real Web Speech API; when the
 * browser doesn't support it, we say so plainly instead of hiding the button.
 */
export function VoiceCapture({ onText }: { onText: (text: string) => void }) {
  const [supported] = useState(() => getRecognition() !== null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef('')
  const wantListeningRef = useRef(false)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  useEffect(
    () => () => {
      wantListeningRef.current = false
      recRef.current?.stop()
    },
    [],
  )

  if (!supported) {
    return (
      <p className="mt-2 rounded-2xl bg-cream-deep px-4 py-3 text-sm text-ink-soft">
        Speaking your story isn’t available in this browser — typing below works just the same.
      </p>
    )
  }

  const start = () => {
    const rec = getRecognition()
    if (!rec) return
    recRef.current = rec
    finalRef.current = ''
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (event) => {
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) finalRef.current += r[0].transcript
        else interimText += r[0].transcript
      }
      setInterim(finalRef.current + interimText)
    }
    rec.onerror = (ev) => {
      // Permission problems end the session for real; transient errors let
      // the auto-restart in onend try again.
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        wantListeningRef.current = false
      }
    }
    rec.onend = () => {
      // iOS/Safari ends continuous recognition on short pauses — an elder's
      // storytelling cadence must not cut the recording off mid-thought.
      // While the user hasn't pressed "I'm finished", quietly start again.
      if (wantListeningRef.current) {
        try {
          rec.start()
          return
        } catch {
          /* fall through to a clean stop */
        }
      }
      setListening(false)
      const text = finalRef.current.trim()
      setInterim('')
      if (text) onTextRef.current(text)
    }
    wantListeningRef.current = true
    rec.start()
    setListening(true)
    setInterim('')
  }

  const stop = () => {
    wantListeningRef.current = false
    recRef.current?.stop()
  }

  return (
    <div className="mt-2">
      {!listening ? (
        <button
          type="button"
          onClick={start}
          className="inline-flex min-h-12 items-center gap-2.5 rounded-2xl border-2 border-clay-dark bg-white px-5 py-3 text-lg font-semibold text-clay-dark transition hover:bg-clay-dark hover:text-white"
        >
          <Mic className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          Press and tell me about it
        </button>
      ) : (
        <div className="rounded-2xl border-2 border-sage bg-sage/5 p-4">
          <p className="flex items-center gap-2 font-semibold text-sage-deep">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-sage-deep" />
            </span>
            Listening — take your time.
          </p>
          <p aria-live="polite" className="mt-2 min-h-12 text-lg leading-relaxed">
            {interim || <span className="text-ink-soft">Your words will appear here as you speak…</span>}
          </p>
          <button
            type="button"
            onClick={stop}
            className="mt-3 inline-flex min-h-12 items-center gap-2.5 rounded-2xl bg-sage-deep px-5 py-3 text-lg font-semibold text-white"
          >
            <Square className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            I’m finished
          </button>
        </div>
      )}
      <p className="mt-1.5 text-sm text-ink-soft">
        Your words are added to the story below — read them over before saving. Your browser’s own
        speech service turns the sound into text; Keepsake keeps only the words, on this device.
      </p>
    </div>
  )
}
