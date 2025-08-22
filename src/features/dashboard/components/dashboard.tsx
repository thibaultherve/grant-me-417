import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Plus, 
  User, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Calendar,
  MapPin,
  Building2,
  LogOut,
  FileText
} from 'lucide-react'
import { useAuthActions } from '@/features/auth/hooks/use-auth-actions'
import { EmployersList } from '@/features/employers/components/employers-list'

type TabType = 'overview' | 'add-hours' | 'employers' | 'visas' | 'profile'

export function Dashboard() {
  const { user, signOutAndRedirect } = useAuthActions()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const handleSignOut = async () => {
    try {
      await signOutAndRedirect('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'add-hours':
        return <AddHoursTab />
      case 'employers':
        return <EmployersList />
      case 'visas':
        return <VisasTab />
      case 'profile':
        return <ProfileTab user={user} onSignOut={handleSignOut} />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header with Desktop Enhancement */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="px-4 py-4 lg:py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Get Granted 417</h1>
                <p className="text-sm lg:text-base text-muted-foreground">Working Holiday Visa Tracker</p>
              </div>
              <Badge variant="secondary" className="text-xs lg:text-sm">
                Dashboard
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Content with Desktop Enhancement */}
      <main className="px-4 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'overview' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('add-hours')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'add-hours' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Add Hours</span>
          </button>
          
          <button
            onClick={() => setActiveTab('employers')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'employers' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Employers</span>
          </button>
          
          <button
            onClick={() => setActiveTab('visas')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'visas' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">Visas</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'profile' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Card */}
      <Card className="border shadow-sm bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardContent className="p-6 lg:p-8">
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-4">Welcome Back!</h2>
            <p className="text-base lg:text-lg text-muted-foreground mb-4 lg:mb-6">
              Let's track your Working Holiday Visa 417 progress
            </p>
            <div className="max-w-md mx-auto">
              <Button className="w-full h-12 text-base gap-2">
                <Plus className="w-5 h-5" />
                Add Work Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Responsive Grid */}
      <div className="space-y-4 lg:space-y-6">
        <h3 className="text-lg lg:text-xl font-semibold">Your Progress</h3>
        
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Total Days Worked</h4>
                    <p className="text-sm text-muted-foreground">Specified work days</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">/ 88 required</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-0"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Total Hours</h4>
                    <p className="text-sm text-muted-foreground">All logged hours</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-muted-foreground">hours logged</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4 lg:space-y-6">
        <h3 className="text-lg lg:text-xl font-semibold">Recent Activity</h3>
        <Card className="border shadow-sm">
          <CardContent className="p-6 lg:p-8 text-center">
            <div className="text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h4 className="font-medium mb-2">No entries yet</h4>
              <p className="text-sm lg:text-base">Start by adding your first work entry</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Add Hours Tab Component  
function AddHoursTab() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl lg:text-3xl font-bold">Work Entries</h2>
        <Button size="sm" className="gap-2 lg:h-10 lg:px-4">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      {/* Add Entry Form Card */}
      <Card className="border shadow-sm">
        <CardHeader className="lg:pb-6">
          <CardTitle className="text-xl lg:text-2xl">Add New Work Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="space-y-2">
              <label className="text-base font-medium">Date</label>
              <input
                type="date"
                className="w-full h-12 px-3 text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium">Hours Worked</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="8.0"
                className="w-full h-12 px-3 text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium">Employer</label>
              <input
                type="text"
                placeholder="Farm name or employer"
                className="w-full h-12 px-3 text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
            <Button className="w-full h-12 text-base lg:w-auto lg:px-8">
              Save Work Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-4 lg:space-y-6">
        <h3 className="text-lg lg:text-xl font-semibold">Your Entries</h3>
        <Card className="border shadow-sm">
          <CardContent className="p-6 lg:p-8 text-center">
            <div className="text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h4 className="font-medium mb-2">No work entries</h4>
              <p className="text-sm lg:text-base">Add your first work entry using the form above</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Visas Tab Component
function VisasTab() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl lg:text-3xl font-bold">Visas</h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Visa
        </Button>
      </div>

      {/* Placeholder content */}
      <Card className="border shadow-sm">
        <CardContent className="p-6 lg:p-8 text-center">
          <div className="text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h4 className="font-medium mb-2">No visas added yet</h4>
            <p className="text-sm lg:text-base">Add your Working Holiday Visa to start tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Progress Tab Component (removed - no longer needed)
function ProgressTab() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <h2 className="text-2xl lg:text-3xl font-bold">Visa Progress</h2>

      {/* Progress Cards - Responsive Grid */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        {/* 2nd Visa Progress */}
        <Card className="border shadow-sm">
          <CardHeader className="lg:pb-6">
            <CardTitle className="text-xl lg:text-2xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
              2nd Visa Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">0 / 88</div>
              <p className="text-base lg:text-lg text-muted-foreground">Days completed</p>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-primary h-3 rounded-full w-0"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg lg:text-xl font-semibold">0%</div>
                <div className="text-sm lg:text-base text-muted-foreground">Complete</div>
              </div>
              <div>
                <div className="text-lg lg:text-xl font-semibold">88</div>
                <div className="text-sm lg:text-base text-muted-foreground">Days remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3rd Visa Progress */}
        <Card className="border shadow-sm opacity-50">
          <CardHeader className="lg:pb-6">
            <CardTitle className="text-xl lg:text-2xl flex items-center gap-2">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6" />
              3rd Visa Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-muted-foreground mb-2">0 / 179</div>
              <p className="text-base lg:text-lg text-muted-foreground">Days completed</p>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-muted-foreground h-3 rounded-full w-0"></div>
            </div>
            
            <p className="text-sm lg:text-base text-muted-foreground text-center">
              Complete your 2nd visa requirements first
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Industry Breakdown */}
      <Card className="border shadow-sm">
        <CardHeader className="lg:pb-6">
          <CardTitle className="text-xl lg:text-2xl">Work by Industry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm lg:text-base">No work entries to analyze yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Profile Tab Component
function ProfileTab({ user, onSignOut }: { user: any, onSignOut: () => void }) {
  return (
    <div className="space-y-6 lg:space-y-8">
      <h2 className="text-2xl lg:text-3xl font-bold">Profile</h2>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
        {/* User Info */}
        <Card className="border shadow-sm lg:col-span-1">
          <CardContent className="p-6 lg:p-8">
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-1">{user?.email}</h3>
              <Badge variant="secondary" className="text-xs lg:text-sm">Verified Account</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <div className="space-y-4 lg:space-y-6 lg:col-span-2">
          <h3 className="text-lg lg:text-xl font-semibold">Account</h3>
          
          <div className="grid gap-4 lg:gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-base lg:text-lg">Visa Information</span>
                    <span className="text-sm lg:text-base text-muted-foreground">Set up →</span>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-base lg:text-lg">Export Data</span>
                    <span className="text-sm lg:text-base text-muted-foreground">PDF →</span>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-base lg:text-lg">Settings</span>
                    <span className="text-sm lg:text-base text-muted-foreground">Manage →</span>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Sign Out */}
          <div className="pt-6">
            <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
              <Button 
                variant="outline" 
                onClick={onSignOut}
                className="w-full h-12 text-base lg:text-lg gap-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground lg:w-auto lg:px-8"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center pt-6 border-t lg:pt-8">
        <p className="text-sm lg:text-base text-muted-foreground">
          Get Granted 417 • v1.0.0
        </p>
        <p className="text-xs lg:text-sm text-muted-foreground mt-1">
          Working Holiday Visa tracker for backpackers
        </p>
      </div>
    </div>
  )
}