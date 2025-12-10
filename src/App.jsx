import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading - Code Splitting
const DesktopLayout = lazy(() => import('./components/DesktopLayout'));
const WaiterApp = lazy(() => import('./mobile/WaiterApp'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Asosiy Desktop ilova */}
            <Route path="/" element={<DesktopLayout />} />

            {/* Mobil Ofitsiant ilovasi */}
            <Route path="/waiter" element={<WaiterApp />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;