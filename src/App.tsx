import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TestLab from './pages/TestLab';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useSimulatedData } from './hooks/useSimulatedData';

function App() {
  // Initialize simulation
  useSimulatedData();

  useEffect(() => {
    document.title = 'Joule | BESS Performance Dashboard';
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-control-room">
        <div className="noise-overlay" />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/test" element={<TestLab />} /> 
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
