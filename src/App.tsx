import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/hooks/use-auth'
import { VisaProvider } from '@/features/visas/hooks/use-visa-context'
import { AuthRouter } from '@/components/ui/auth-router'
import { LoginForm } from '@/features/auth/components/login-form'
import { RegisterForm } from '@/features/auth/components/register-form'
import { Dashboard } from '@/features/dashboard/components/dashboard'
import { LandingPage } from '@/features/home/components/landing-page'
import { Toaster } from 'sonner'

function App() {
  return (
    <Router>
      <AuthProvider>
        <VisaProvider>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              <AuthRouter>
                <LandingPage />
              </AuthRouter>
            } 
          />
          <Route 
            path="/home" 
            element={
              <AuthRouter>
                <LandingPage />
              </AuthRouter>
            } 
          />
          
          {/* Auth routes - redirect to dashboard if already logged in */}
          <Route 
            path="/login" 
            element={
              <AuthRouter redirectTo="/dashboard">
                <LoginForm />
              </AuthRouter>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthRouter redirectTo="/dashboard">
                <RegisterForm />
              </AuthRouter>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <AuthRouter requireAuth>
                <Dashboard />
              </AuthRouter>
            } 
          />
        </Routes>
        <Toaster position="top-center" richColors />
        </VisaProvider>
      </AuthProvider>
    </Router>
  )
}

export default App