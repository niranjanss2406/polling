import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePoll from './pages/CreatePoll';
import MyPolls from './pages/MyPolls';
import PublicPoll from './pages/PublicPoll';
import PollResults from './pages/PollResults';
import NotFound from './pages/NotFound';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
          <Navbar />
          <div className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/poll/:pollId" element={<PublicPoll />} />
              <Route path="/results/:id" element={<PollResults />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls"
                element={
                  <ProtectedRoute>
                    <MyPolls />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls/create"
                element={
                  <ProtectedRoute>
                    <CreatePoll />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

