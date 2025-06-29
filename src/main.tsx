import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './index.css';

console.log('🚀 [Main] VoyageHub main.tsx loaded');

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 [ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [ErrorBoundary] Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('🚨 [ErrorBoundary] Rendering error UI');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="glass-card p-8 rounded-3xl text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">💥</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-white/70 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Remove loading fallback once React takes over
const removeLoadingFallback = () => {
  console.log('🧹 [Main] Removing loading fallback...');
  const fallback = document.querySelector('.loading-fallback');
  if (fallback) {
    fallback.style.opacity = '0';
    setTimeout(() => {
      fallback.remove();
      console.log('✅ [Main] Loading fallback removed');
    }, 300);
  } else {
    console.log('ℹ️ [Main] No loading fallback found to remove');
  }
};

// Initialize app
const initializeApp = () => {
  try {
    console.log('🚀 [Main] Initializing VoyageHub...');
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    console.log('✅ [Main] Root element found, creating React root...');
    const root = createRoot(rootElement);
    
    console.log('🎯 [Main] Rendering React app...');
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );

    console.log('✅ [Main] React app rendered successfully');
    
    // Remove loading fallback after React has taken over
    setTimeout(removeLoadingFallback, 100);
    
  } catch (error) {
    console.error('❌ [Main] Failed to initialize app:', error);
    
    // Show error in the loading fallback
    const fallback = document.querySelector('.loading-fallback');
    if (fallback) {
      fallback.innerHTML = `
        <div class="glass-card" style="padding: 2rem; border-radius: 1.5rem; text-align: center; max-width: 24rem;">
          <div style="width: 4rem; height: 4rem; background: rgba(239, 68, 68, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <span style="color: #F87171; font-size: 1.5rem;">⚠️</span>
          </div>
          <h1 style="color: white; margin-bottom: 1rem; font-size: 1.25rem; font-weight: bold;">Failed to Load</h1>
          <p style="color: rgba(255,255,255,0.7); margin-bottom: 1rem;">
            ${error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onclick="window.location.reload()" 
            style="padding: 0.5rem 1rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;"
          >
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log('⏳ [Main] DOM still loading, waiting...');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('✅ [Main] DOM ready, initializing immediately');
  initializeApp();
}