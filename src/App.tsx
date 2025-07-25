import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useTaskStore } from './stores/taskStore';
import { useToastStore } from './stores/toastStore';
import { initializeSocket, disconnectSocket } from './utils/socket';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { ToastContainer } from './components/ui/ToastContainer';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { VacationsPage } from './pages/VacationsPage';
import { VacationDetailsPage } from './pages/VacationDetailsPage';
import { TasksPage } from './pages/TasksPage';
import { BudgetPage } from './pages/BudgetPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { CollaboratorsPage } from './pages/CollaboratorsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { gsap } from 'gsap';

function App() {
  const { isAuthenticated, isLoading, initializeAuth, token } = useAuthStore();
  const { handleRealTimeUpdate } = useTaskStore();
  const { toasts, removeToast } = useToastStore();
  const appRef = useRef<HTMLDivElement>(null);

  console.log('🔄 [App] Component rendered with state:', {
    isAuthenticated,
    isLoading,
    timestamp: new Date().toISOString()
  });

  // Initialize auth when component mounts
  useEffect(() => {
    console.log('🔄 [App] useEffect triggered - checking if auth needs initialization');
    console.log('🔍 [App] Current auth state:', { isAuthenticated, isLoading });
    
    // Only initialize if we haven't determined auth state yet
    if (isAuthenticated === null && !isLoading) {
      console.log('🚀 [App] Starting auth initialization...');
      initializeAuth()
        .then(() => {
          console.log('✅ [App] Auth initialization completed successfully');
        })
        .catch((error) => {
          console.error('❌ [App] Auth initialization failed:', error);
        });
    } else {
      console.log('ℹ️ [App] Skipping auth initialization:', {
        reason: isAuthenticated !== null ? 'already determined' : 'already loading'
      });
    }
  }, []); // Empty dependency array - only run once on mount

  // Animate app when authenticated
  useEffect(() => {
    if (appRef.current && isAuthenticated === true) {
      console.log('🎨 [App] Starting app entrance animation...');
      gsap.fromTo(appRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.8, 
          ease: "power2.out",
          onComplete: () => {
            console.log('✅ [App] Entrance animation completed');
          }
        }
      );
    }
  }, [isAuthenticated]);

  // Initialize Socket.IO when authenticated
  useEffect(() => {
    if (isAuthenticated === true && token) {
      console.log('🔄 [App] Initializing Socket.IO connection...');
      const socket = initializeSocket(token);
      
      // Listen for real-time task updates
      socket.on('task-updated', (data: { task: any }) => {
        console.log('📡 [App] Received real-time task update:', data.task.id);
        handleRealTimeUpdate(data.task);
      });
      
      // Join vacation rooms when needed
      socket.on('connect', () => {
        console.log('✅ [App] Socket connected, ready for real-time updates');
      });
      
      return () => {
        console.log('🔌 [App] Cleaning up Socket.IO connection...');
        disconnectSocket();
      };
    } else if (isAuthenticated === false) {
      // Disconnect socket when not authenticated
      disconnectSocket();
    }
  }, [isAuthenticated, token, handleRealTimeUpdate]);

  // Show loading state while initializing
  if (isAuthenticated === null || isLoading) {
    console.log('⏳ [App] Showing loading screen:', {
      isAuthenticated,
      isLoading,
      reason: isAuthenticated === null ? 'determining auth state' : 'auth operation in progress'
    });
    
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-card p-8 rounded-3xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80 text-lg font-medium">Loading VoyageHub...</p>
            <p className="text-white/60 text-sm mt-2">Preparing your travel planning experience</p>
            <div className="mt-4 text-xs text-white/40 font-mono">
              Auth: {isAuthenticated === null ? 'checking' : isAuthenticated ? 'authenticated' : 'not authenticated'} | 
              Loading: {isLoading ? 'true' : 'false'}
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show auth page if not authenticated
  if (isAuthenticated === false) {
    console.log('🔐 [App] User not authenticated, showing auth page');
    return (
      <ThemeProvider>
        <AuthPage />
      </ThemeProvider>
    );
  }

  // Show main app if authenticated
  console.log('🏠 [App] User authenticated, showing main application');
  return (
    <ThemeProvider>
      <Router>
        <div ref={appRef} className="min-h-screen">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen">
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/vacations" element={<VacationsPage />} />
                <Route path="/vacations/:id" element={<VacationDetailsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/collaborators" element={<CollaboratorsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
          
          {/* Toast Container */}
          <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;