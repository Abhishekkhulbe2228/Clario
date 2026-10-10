import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full p-6 text-center space-y-4 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/40 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                Something went wrong
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                An unexpected error interrupted the session. Please reload to restore Clario.
              </p>
            </div>
            {this.state.error?.message && (
              <pre className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-[#e5e5e0] dark:border-[#27272a] rounded-lg text-[11px] text-rose-700 dark:text-rose-400 font-mono text-left overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 mx-auto transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={13} />
                <span>Reload workspace</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
