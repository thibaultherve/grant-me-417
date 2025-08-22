import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Globe, 
  Calendar, 
  Users, 
  Clock, 
  Shield, 
  FileText, 
  TrendingUp,
  ArrowRight,
  Star
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function LandingPage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Get Granted</h1>
                  <Badge variant="secondary" className="text-xs">417</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse h-8 w-8 bg-muted rounded-full"></div>
                  <div className="animate-pulse h-9 w-24 bg-muted rounded-md"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Authenticated</p>
                    </div>
                  </div>
                  <Link to="/dashboard">
                    <Button className="gap-2">
                      Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Trusted by 1000+ Backpackers
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              Track Your{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Working Holiday
              </span>
              <br />
              <span className="text-muted-foreground">Visa 417 Hours</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              The most comprehensive platform for tracking specified work hours. 
              Built for backpackers, trusted by immigration experts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="h-12 px-8 text-base gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Continue to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="h-12 px-8 text-base gap-2">
                      <Clock className="w-5 h-5" />
                      Start Tracking Free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2">
                      <Users className="w-5 h-5" />
                      I Have an Account
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-0 shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">88+</div>
                  <div className="text-sm text-muted-foreground">
                    Days Required for 2nd Visa
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">179+</div>
                  <div className="text-sm text-muted-foreground">
                    Days Required for 3rd Visa
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">19</div>
                  <div className="text-sm text-muted-foreground">
                    Eligible Countries Supported
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Everything You Need to{' '}
              <span className="text-primary">Get Your Visa</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Purpose-built for Working Holiday Visa 417 holders. Every feature designed 
              to meet Australian immigration requirements with precision.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Primary Features */}
            <Card className="relative group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Hour Tracking</CardTitle>
                <CardDescription className="text-base">
                  Intelligent daily work logging with automatic visa eligibility calculations. 
                  Never miss a qualifying hour again.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Daily hour logging
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Progress calculations
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Visa deadline tracking
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Compliance Monitoring</CardTitle>
                <CardDescription className="text-base">
                  Real-time tracking for 88-day (2nd visa) or 179-day (3rd visa) requirements. 
                  Stay compliant, stay confident.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    ANZSIC classification
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Regional area validation
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Eligibility verification
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Export & Documentation</CardTitle>
                <CardDescription className="text-base">
                  Generate immigration-ready reports with all required documentation. 
                  Professional, accurate, accepted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    PDF reports
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Employer letters
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Work summaries
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-md flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-base">Employer Management</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Comprehensive employer and location tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-md flex items-center justify-center">
                    <Globe className="w-4 h-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base">Multi-Country Support</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  All 19 eligible countries with specific requirements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base">Progress Analytics</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Visual progress tracking and milestone alerts
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Eligible Countries Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Global Support
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built for International{' '}
              <span className="text-primary">Backpackers</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Supporting Working Holiday Visa 417 holders from all eligible countries 
              with country-specific requirements and regulations.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="text-2xl mb-2">🇪🇺</div>
                <CardTitle className="text-lg">Europe</CardTitle>
                <CardDescription>14 countries</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm space-y-1">
                  <div>🇧🇪 Belgium • 🇩🇰 Denmark</div>
                  <div>🇫🇷 France • 🇩🇪 Germany</div>
                  <div>🇮🇪 Ireland • 🇮🇹 Italy</div>
                  <div>🇳🇱 Netherlands • 🇳🇴 Norway</div>
                  <div>🇸🇪 Sweden • 🇬🇧 UK</div>
                  <div className="text-xs text-muted-foreground mt-2">+4 more</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="text-2xl mb-2">🌏</div>
                <CardTitle className="text-lg">Asia-Pacific</CardTitle>
                <CardDescription>4 territories</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm space-y-1">
                  <div>🇭🇰 Hong Kong SAR</div>
                  <div>🇯🇵 Japan</div>
                  <div>🇰🇷 South Korea</div>
                  <div>🇹🇼 Taiwan</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="text-2xl mb-2">🍁</div>
                <CardTitle className="text-lg">North America</CardTitle>
                <CardDescription>1 country</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm space-y-1">
                  <div>🇨🇦 Canada</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Extended age limit (18-35)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-primary/5">
              <CardHeader className="text-center pb-4">
                <div className="text-2xl mb-2">📊</div>
                <CardTitle className="text-lg">Age Requirements</CardTitle>
                <CardDescription>Country-specific</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Most countries:</span>
                    <Badge variant="secondary">18-30</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Extended:</span>
                    <Badge variant="outline">18-35</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    CA, DK, FR, IE, UK
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-12" />
          
          <div className="text-center">
            <Badge variant="destructive" className="mb-4">
              Not Eligible for WHV 417
            </Badge>
            <p className="text-sm text-muted-foreground max-w-4xl mx-auto">
              Citizens from USA, Argentina, Austria, Chile, China, Czech Republic, Hungary, Indonesia, 
              Israel, Luxembourg, Malaysia, Peru, Poland, Portugal, San Marino, Singapore, Slovakia, 
              Slovenia, Spain, Thailand, Turkey, Uruguay, and Vietnam must apply for Work and Holiday Visa (subclass 462) instead.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-primary to-blue-600 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            <Star className="w-3 h-3 mr-1" />
            Trusted Platform
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Your{' '}
            <span className="text-yellow-300">Visa Journey?</span>
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of backpackers who successfully extended their Working Holiday Visa. 
            Professional, reliable, immigration-ready.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base gap-2">
                <TrendingUp className="w-5 h-5" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure & private
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Setup in 2 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Get Granted</h3>
                  <Badge variant="secondary" className="text-xs">417</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your trusted companion for Working Holiday Visa extensions in Australia. 
                Built by developers who understand the immigration process.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Immigration compliant
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-green-500" />
                  Bank-grade security
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-green-500" />
                  Real-time tracking
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-green-500" />
                  Export ready reports
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>All 19 eligible countries</div>
                <div>Country-specific requirements</div>
                <div>ANZSIC classification</div>
                <div>Regional area validation</div>
              </div>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 Get Granted 417. Platform for tracking purposes only.
            </div>
            <Badge variant="outline" className="text-xs">
              Always consult official immigration sources
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  )
}