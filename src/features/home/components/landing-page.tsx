import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Globe, 
  Clock, 
  Shield, 
  FileText, 
  TrendingUp,
  ArrowRight,
  Star,
  Users2
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function LandingPage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Navigation Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Get Granted</h1>
                <Badge variant="secondary" className="text-xs">417</Badge>
              </div>
            </div>
            
            {/* Auth Status - Mobile Optimized */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="animate-pulse h-10 w-20 bg-muted rounded-lg"></div>
              ) : user ? (
                <Link to="/dashboard">
                  <Button size="sm" className="h-10 px-4 gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="sm" className="h-10 px-4 gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Start Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Hero Section */}
      <main className="px-4 py-8 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Trust Badge */}
          <div className="text-center mb-6 lg:mb-10">
            <Badge variant="outline" className="px-4 py-2 text-base font-medium">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Trusted by 1000+ Backpackers
            </Badge>
          </div>
          
          {/* Hero Title - Mobile First with Desktop Enhancement */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4 lg:mb-6 leading-tight lg:leading-tight">
              Track Your{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Working Holiday
              </span>
              {' '}Visa 417 Hours
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 lg:mb-12 leading-relaxed max-w-3xl mx-auto">
              The most comprehensive platform for tracking specified work hours. 
              Built for backpackers, trusted by immigration experts.
            </p>
          </div>
          
          {/* Primary CTA - Mobile First with Desktop Constraint */}
          <div className="mb-8 lg:mb-16 max-w-md mx-auto">
            {user ? (
              <Link to="/dashboard" className="block">
                <Button size="lg" className="w-full h-14 text-lg gap-3">
                  <TrendingUp className="w-5 h-5" />
                  Continue to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link to="/register" className="block">
                  <Button size="lg" className="w-full h-14 text-lg gap-3">
                    <Clock className="w-5 h-5" />
                    Start Tracking Free
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="outline" size="lg" className="w-full h-14 text-lg gap-3">
                    <Users2 className="w-5 h-5" />
                    I Have an Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 mb-8 lg:mb-16">
            <Card className="border shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">88+</div>
                <div className="text-base text-muted-foreground">
                  Days Required for 2nd Visa
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">179+</div>
                <div className="text-base text-muted-foreground">
                  Days Required for 3rd Visa
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">19</div>
                <div className="text-base text-muted-foreground">
                  Eligible Countries Supported
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section - Mobile First with Desktop Enhancement */}
        <div className="mb-8 lg:mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 lg:mb-12">
              <Badge variant="outline" className="mb-4 text-base px-4 py-2">
                Features
              </Badge>
              <h2 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">
                Everything You Need to{' '}
                <span className="text-primary">Get Your Visa</span>
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Purpose-built for Working Holiday Visa 417 holders. Every feature designed 
                to meet Australian immigration requirements.
              </p>
            </div>

            {/* Primary Features - Responsive Grid */}
            <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0 mb-8 lg:mb-16">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Hour Tracking</CardTitle>
                <p className="text-base text-muted-foreground mt-2">
                  Intelligent daily work logging with automatic visa eligibility calculations. 
                  Never miss a qualifying hour again.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Daily hour logging
                  </div>
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Progress calculations
                  </div>
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Visa deadline tracking
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Compliance Monitoring</CardTitle>
                <p className="text-base text-muted-foreground mt-2">
                  Real-time tracking for 88-day (2nd visa) or 179-day (3rd visa) requirements. 
                  Stay compliant, stay confident.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    ANZSIC classification
                  </div>
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Regional area validation
                  </div>
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Eligibility verification
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Export & Documentation</CardTitle>
                <p className="text-base text-muted-foreground mt-2">
                  Generate immigration-ready reports with all required documentation. 
                  Professional, accurate, accepted.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    PDF reports
                  </div>
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Employer letters
                  </div>
                  <div className="flex items-center text-base text-muted-foreground">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Work summaries
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>

        {/* Countries Section - Mobile First with Desktop Enhancement */}
        <div className="bg-muted/30 -mx-4 px-4 py-8 mb-8 lg:py-16 lg:mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 lg:mb-12">
              <Badge variant="outline" className="mb-4 text-base px-4 py-2">
                Global Support
              </Badge>
              <h2 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">
                Built for International{' '}
                <span className="text-primary">Backpackers</span>
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Supporting Working Holiday Visa 417 holders from all eligible countries 
                with country-specific requirements.
              </p>
            </div>

            {/* Country Cards - Responsive Grid */}
            <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-6 lg:space-y-0 mb-6 lg:mb-12">
            <Card className="border shadow-sm">
              <CardHeader className="text-center pb-4">
                <div className="text-3xl mb-2">🇪🇺</div>
                <CardTitle className="text-xl">Europe</CardTitle>
                <p className="text-muted-foreground">14 countries</p>
              </CardHeader>
              <CardContent>
                <div className="text-base space-y-2">
                  <div>🇧🇪 Belgium • 🇩🇰 Denmark</div>
                  <div>🇫🇷 France • 🇩🇪 Germany</div>
                  <div>🇮🇪 Ireland • 🇮🇹 Italy</div>
                  <div>🇳🇱 Netherlands • 🇳🇴 Norway</div>
                  <div>🇸🇪 Sweden • 🇬🇧 UK</div>
                  <div className="text-sm text-muted-foreground mt-3">+4 more countries</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="text-center pb-4">
                <div className="text-3xl mb-2">🌏</div>
                <CardTitle className="text-xl">Asia-Pacific</CardTitle>
                <p className="text-muted-foreground">4 territories</p>
              </CardHeader>
              <CardContent>
                <div className="text-base space-y-2">
                  <div>🇭🇰 Hong Kong SAR</div>
                  <div>🇯🇵 Japan</div>
                  <div>🇰🇷 South Korea</div>
                  <div>🇹🇼 Taiwan</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="text-center pb-4">
                <div className="text-3xl mb-2">🍁</div>
                <CardTitle className="text-xl">North America</CardTitle>
                <p className="text-muted-foreground">1 country</p>
              </CardHeader>
              <CardContent>
                <div className="text-base space-y-2">
                  <div>🇨🇦 Canada</div>
                  <div className="text-sm text-muted-foreground mt-3">
                    Extended age limit (18-35)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-primary/5">
              <CardHeader className="text-center pb-4">
                <div className="text-3xl mb-2">📊</div>
                <CardTitle className="text-xl">Age Requirements</CardTitle>
                <p className="text-muted-foreground">Country-specific</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base">Most countries:</span>
                    <Badge variant="secondary" className="text-sm">18-30</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base">Extended:</span>
                    <Badge variant="outline" className="text-sm">18-35</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    CA, DK, FR, IE, UK
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
            
            <div className="text-center">
              <Badge variant="destructive" className="mb-4 text-base px-4 py-2">
                Not Eligible for WHV 417
              </Badge>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                Citizens from USA, Argentina, Austria, Chile, China, Czech Republic, Hungary, Indonesia, 
                Israel, Luxembourg, Malaysia, Peru, Poland, Portugal, San Marino, Singapore, Slovakia, 
                Slovenia, Spain, Thailand, Turkey, Uruguay, and Vietnam must apply for Work and Holiday Visa (subclass 462) instead.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA Section - Mobile First with Desktop Enhancement */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground -mx-4 px-4 py-8 mb-8 lg:py-16 lg:mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 text-base px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Trusted Platform
            </Badge>
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Your{' '}
              <span className="text-yellow-300">Visa Journey?</span>
            </h2>
            <p className="text-base opacity-90 mb-8 leading-relaxed">
              Join thousands of backpackers who successfully extended their Working Holiday Visa. 
              Professional, reliable, immigration-ready.
            </p>
            
            <div className="max-w-md mx-auto">
              {user ? (
                <Link to="/dashboard" className="block">
                  <Button size="lg" variant="secondary" className="w-full h-14 text-lg gap-3">
                    <TrendingUp className="w-5 h-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link to="/register" className="block">
                    <Button size="lg" variant="secondary" className="w-full h-14 text-lg gap-3">
                      <ArrowRight className="w-5 h-5" />
                      Create Free Account
                    </Button>
                  </Link>
                  <Link to="/login" className="block">
                    <Button size="lg" variant="outline" className="w-full h-14 text-lg border-white/30 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-3 text-sm opacity-80">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                No credit card required
              </div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Secure & private
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Setup in 2 minutes
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Footer - Mobile First with Desktop Enhancement */}
        <footer className="bg-muted/30 -mx-4 px-4 py-8 border-t lg:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
              {/* Logo */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Get Granted</h3>
                  <Badge variant="secondary" className="text-xs">417</Badge>
                </div>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                Your trusted companion for Working Holiday Visa extensions in Australia. 
                Built by developers who understand the immigration process.
              </p>
            </div>
            
            {/* Platform Features */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Platform</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-base">Immigration compliant</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-base">Bank-grade security</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span className="text-base">Real-time tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="text-base">Export ready reports</span>
                </div>
              </div>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <div className="space-y-2 text-base text-muted-foreground">
                <div>All 19 eligible countries</div>
                <div>Country-specific requirements</div>
                <div>ANZSIC classification</div>
                <div>Regional area validation</div>
              </div>
            </div>
            
            {/* Legal */}
            <div className="border-t pt-6 space-y-3 text-center lg:col-span-3">
              <div className="text-sm text-muted-foreground">
                © 2024 Get Granted 417. Platform for tracking purposes only.
              </div>
              <Badge variant="outline" className="text-sm px-4 py-2">
                Always consult official immigration sources
              </Badge>
            </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}