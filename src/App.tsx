import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useVacationStore } from './stores/vacationStore';
import { useTaskStore } from './stores/taskStore';
import { useBudgetStore } from './stores/budgetStore';
import { useDocumentStore } from './stores/documentStore';
import { useNotificationStore } from './stores/notificationStore';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { VacationsPage } from './pages/VacationsPage';
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
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const appRef = useRef<HTMLDivElement>(null);
  const [initError, setInitError] = React.useState<string | null>(null);
  
  // Initialize all stores
  const { fetchVacations } = useVacationStore();
  const { fetchTasks } = useTaskStore();
  const { fetchBudget } = useBudgetStore();
  const { fetchDocuments } = useDocumentStore();
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('Initializing app...');
        await initializeAuth();
        console.log('Auth initialized, isAuthenticated:', useAuthStore.getState().isAuthenticated);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setInitError('Failed to initialize application. Please refresh the page.');
      }
    };
    
    initApp();
  }, [initializeAuth]);

  useEffect(() => {
    if (appRef.current && isAuthenticated) {
      gsap.fromTo(appRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [isAuthenticated]);

  // Show loading state while initializing
  if (isAuthenticated === null && !initError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading VoyageHub...</p>
          <p className="text-white/40 text-sm mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Initialization Error</h2>
          <p className="text-white/70 mb-4">{initError}</p>
          <button 
            onClick={() => {
              setInitError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Router>
      <div ref={appRef} className="min-h-screen">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/vacations" element={<VacationsPage />} />
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
      </div>
    </Router>
  );
}

export default App;