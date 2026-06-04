// CI MODULE ADDITION — Error boundary for Cocktail Intelligence module
import { Component } from 'react'

export class CIErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || 'An unexpected error occurred.' }
  }

  componentDidCatch() {}

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="rounded-2xl border border-red-500/20 bg-[#1a1a1a] p-10 text-center">
        <div className="text-3xl mb-3 text-red-400">✕</div>
        <p className="text-sm font-semibold text-red-300 mb-1">Something went wrong</p>
        <p className="text-xs text-[#6b705c] mb-6 max-w-sm mx-auto">{this.state.message}</p>
        <button
          onClick={() => this.setState({ hasError: false, message: '' })}
          className="rounded-xl bg-[#c9a96e] px-6 py-2.5 text-sm font-bold text-[#0d0c09] hover:bg-[#dfc497]"
        >
          Try Again
        </button>
      </div>
    )
  }
}
