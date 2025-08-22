import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react'
import { useAuthActions } from '../hooks/use-auth-actions'
import { loginSchema, type LoginFormData } from '../schemas'

export function LoginForm() {
  const { signInAndRedirect, loading } = useAuthActions()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await signInAndRedirect(data.email, data.password, '/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="px-4 py-4 border-b lg:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-base">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <Badge variant="secondary" className="text-xs">417</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Login Form with Desktop Enhancement */}
      <main className="px-4 py-8 lg:py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 lg:mb-4">Welcome Back</h1>
            <p className="text-base lg:text-lg text-muted-foreground">
              Sign in to continue tracking your visa hours
            </p>
          </div>

          <Card className="border shadow-sm lg:shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-base font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="w-full h-12 pl-10 pr-4 text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-base text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-base font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    className="w-full h-12 pl-10 pr-12 text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-base text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-base text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-12 text-base font-medium"
              >
                {isSubmitting || loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

          {/* Register Link */}
          <div className="text-center mt-8">
            <p className="text-base text-muted-foreground mb-4">
              Don't have an account yet?
            </p>
            <Link to="/register" className="block">
              <Button variant="outline" className="w-full h-12 text-base font-medium">
                Create New Account
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 space-y-3 text-center lg:mt-12">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Your data is encrypted and secure</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Platform for tracking purposes only
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}