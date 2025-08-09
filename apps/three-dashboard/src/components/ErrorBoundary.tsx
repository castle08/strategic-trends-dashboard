import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-black flex items-center justify-center">
          <div className="text-center max-w-md glass-panel rounded-xl p-8">
            <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-white mb-4">
              3D Rendering Error
            </h1>
            
            <p className="text-white/70 text-lg mb-6">
              Your device may not support WebGL or Three.js rendering.
            </p>
            
            <div className="text-white/50 text-sm mb-8 p-4 bg-white/5 rounded-lg">
              {this.state.error?.message || 'Unknown rendering error'}
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              
              <p className="text-white/50 text-sm">
                Try refreshing or use a modern browser with WebGL support
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;