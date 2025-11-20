import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white rounded-xl py-3 px-6 font-medium hover:shadow-lg transition-shadow mb-3"
            >
              Reset App
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 px-6 font-medium hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-red-50 rounded-lg">
                <summary className="text-sm font-medium text-red-900 cursor-pointer mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-red-800 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
