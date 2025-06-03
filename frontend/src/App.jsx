import React from 'react';
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import CandidateDashboardPage from './pages/CandidateDashboardPage';
import PostJobPage from './pages/PostJobPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import ApplicationsPage from './pages/ApplicationsPage';
import CandidateApplicationDetailPage from './pages/CandidateApplicationDetailPage';
import ViewApplicationsPage from './pages/ViewApplicationsPage';
import PublicCandidateProfilePage from './pages/PublicCandidateProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailsPage />} />

            {/* Employer Routes */}
            <Route path="/employer/dashboard" element={<ProtectedRoute roles={['employer']}><EmployerDashboardPage /></ProtectedRoute>} />
            <Route path="/employer/post-job" element={<ProtectedRoute roles={['employer']}><PostJobPage /></ProtectedRoute>} />
            <Route path="/employer/job/:jobId/applications" element={<ProtectedRoute roles={['employer']}><ViewApplicationsPage /></ProtectedRoute>} />

            {/* Candidate Routes */}
            <Route path="/candidate/dashboard" element={<ProtectedRoute roles={['candidate']}><CandidateDashboardPage /></ProtectedRoute>} />
            <Route path="/candidate/profile" element={<ProtectedRoute roles={['candidate']}><CandidateProfilePage /></ProtectedRoute>} />
            <Route path="/candidate/applications" element={<ProtectedRoute roles={['candidate']}><ApplicationsPage /></ProtectedRoute>} />
            <Route path="/candidate/applications/:applicationId" element={<ProtectedRoute roles={['candidate']}><CandidateApplicationDetailPage /></ProtectedRoute>} /> {/* Added route */}
            <Route path="/candidate/:candidateId/profile" element={<PublicCandidateProfilePage />} /> {/* Public view of candidate profile */}

            {/* Catch-all for 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
}

export default App;
