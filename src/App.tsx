import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
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
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const appRef = useRef<HTMLDivElement>(null);

  // Initialize auth only when isAuthenticated is null (initial state)
  useEffect(() => {
    if (isAuthenticated === null) {
      console.log('🔄 Initializing authentication...');
      initializeAuth().then(() => {
        console.log('✅ Authentication initialized');
      }).catch((error) => {
        console.error('❌ Failed to initialize auth:', error);
      });
    }
  }, [isAuthenticated, initializeAuth]);

  // Animate app when authenticated
  useEffect(() => {
    if (appRef.current && isAuthenticated === true) {
      gsap.fromTo(appRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [isAuthenticated]);

  // Show loading state while initializing or during auth operations
  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80 text-lg font-medium">Loading VoyageHub...</p>
          <p className="text-white/60 text-sm mt-2">Preparing your travel planning experience</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (isAuthenticated === false) {
    return <AuthPage />;
  }

  // Show main app if authenticated
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