import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from '@/components/ProtectedRoute'
import ApprovalDetailPage from '@/pages/ApprovalDetailPage'
import ApprovalQueuePage from '@/pages/ApprovalQueuePage'
import DashboardPage from '@/pages/DashboardPage'
import MainLayout from '@/layouts/MainLayout'
import LoginPage from '@/pages/LoginPage'
import OnboardingPage from '@/pages/OnboardingPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="approval" element={<ApprovalQueuePage />} />
        <Route path="approval/:id" element={<ApprovalDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
