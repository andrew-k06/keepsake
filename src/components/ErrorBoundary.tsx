import { Component } from 'react'
import type { ReactNode } from 'react'

/**
 * Last-resort crash screen. Calm, plain-language, and truthful: the binder is
 * persisted on-device, so a render crash never means lost data — say so.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div
        style={{
          minHeight: '100%',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#faf5ec',
          color: '#2c2620',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem' }}>
            Something went wrong on our side.
          </h1>
          <p style={{ marginTop: '0.75rem', fontSize: '1.125rem', color: '#6b6157' }}>
            Your binder is saved on this device and nothing has been lost. Reloading the page usually
            fixes this.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#fff',
              background: '#a44c2d',
              border: 'none',
              borderRadius: '1rem',
              cursor: 'pointer',
            }}
          >
            Reload the page
          </button>
        </div>
      </div>
    )
  }
}
