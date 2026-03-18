import React from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

type Props = {
  children: React.ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Keep a console log for debugging during development.
    // eslint-disable-next-line no-console
    console.error('Route render error:', error)
  }

  render() {
    if (!this.state.error) return this.props.children

    const showDetails = import.meta.env.DEV

    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-6">
          <div className="text-lg font-semibold">Something went wrong</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            An error occurred while rendering this page.
          </div>

          {showDetails ? (
            <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
              {String(this.state.error?.stack ?? this.state.error?.message ?? this.state.error)}
            </pre>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                this.setState({ error: null })
              }}
            >
              Try again
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.reload()
              }}
            >
              Reload
            </Button>
          </div>
        </Card>
      </div>
    )
  }
}
