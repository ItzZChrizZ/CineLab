import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Cinelab] Render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
          <h2 className="font-warbler text-3xl text-bone">Something broke</h2>
          <p className="text-ash/60 text-sm max-w-md">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-6 py-3 rounded-default text-sm font-bold uppercase tracking-wider bg-ash text-obsidian hover:opacity-90 transition-all duration-150"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
