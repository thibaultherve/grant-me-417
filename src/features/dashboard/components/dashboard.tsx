import React from 'react'
import { useAuthActions } from '@/features/auth/hooks/use-auth-actions'

export function Dashboard() {
  const { user, signOutAndRedirect } = useAuthActions()

  const handleSignOut = async () => {
    try {
      await signOutAndRedirect('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Get Granted 417
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Working Holiday Visa 417 Tracker
              </h2>
              <p className="text-gray-600 mb-8">
                Track your specified work hours for visa extension eligibility
              </p>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">0</div>
                      <div className="text-sm text-gray-500">Days Worked</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-500">Hours Logged</div>
                    </div>
                  </div>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium">
                  Add Work Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}