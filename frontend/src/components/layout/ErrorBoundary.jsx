import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-studio-theme flex items-center justify-center p-6 text-slate-900">
          <div className="max-w-lg w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-8 text-center animate-fade-up">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 text-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              ⚠️
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              An unexpected error occurred while rendering this view. Our team has been notified.
            </p>

            {/* Error Message Box */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
              <p className="text-xs font-mono text-rose-600 font-semibold truncate">
                {this.state.error?.message || "Unknown Application Error"}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/80 shadow-sm transition-all text-center inline-block"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
