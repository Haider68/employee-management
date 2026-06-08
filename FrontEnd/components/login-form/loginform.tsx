"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "../context/auth"
import { Loader2, UserPlus, LogIn, Mail, Lock, Phone, User, CheckCircle, AlertCircle } from "lucide-react"
import { AdminRegister } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter()
  const { loginUser, loginLoading, authenticateUser } = useAuth()
  const [activeTab, setActiveTab] = useState("login")
  
  // Login Form State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Signup Form State
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    phoneno: "",
    password: "",
    confirmpassword: "",
    role: "admin"
  })
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null)
  const [isSignupLoading, setIsSignupLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Password strength checker
  useEffect(() => {
    if (signupForm.password) {
      let strength = 0
      if (signupForm.password.length >= 8) strength += 25
      if (/[A-Z]/.test(signupForm.password)) strength += 25
      if (/[0-9]/.test(signupForm.password)) strength += 25
      if (/[^A-Za-z0-9]/.test(signupForm.password)) strength += 25
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [signupForm.password])

  if (!mounted) {
    return (
      <div className="relative">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-6 w-20 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
      </div>
    )
  }

  // Login Handler
  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!email || !password) {
      setError("Please fill in all fields.")
      setIsLoading(false)
      return
    }

    try {
      const result = await loginUser({ email, password })
      if (result.success) {
        localStorage.setItem("accessToken", result.data.accessToken)
        await authenticateUser()
        const userRole = result?.data?.data?.user?.role
        
        if (userRole === "admin") {
          router.replace("/dashboard")
        } else {
          router.replace("/dashboard/attendance")
        }
      } else {
        setError(result.message || "Invalid credentials. Please try again.")
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  // Signup Handler
  async function onSignupSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSignupError(null)
    setSignupSuccess(null)
    setIsSignupLoading(true)

    // Validation
    if (!signupForm.fullName || !signupForm.email || !signupForm.phoneno || !signupForm.password || !signupForm.confirmpassword) {
      setSignupError("Please fill in all fields.")
      setIsSignupLoading(false)
      return
    }

    if (signupForm.fullName.length < 3) {
      setSignupError("Full name must be at least 3 characters.")
      setIsSignupLoading(false)
      return
    }

    if (signupForm.password.length < 8) {
      setSignupError("Password must be at least 8 characters long.")
      setIsSignupLoading(false)
      return
    }

    if (signupForm.password !== signupForm.confirmpassword) {
      setSignupError("Passwords do not match.")
      setIsSignupLoading(false)
      return
    }

    // Phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(signupForm.phoneno)) {
      setSignupError("Please provide a valid phone number.")
      setIsSignupLoading(false)
      return
    }

    try {
      const result = await AdminRegister(signupForm)
      
      if (result.success) {
        setSignupSuccess("Admin account created successfully! You can now login.")
        // Reset form
        setSignupForm({
          fullName: "",
          email: "",
          phoneno: "",
          password: "",
          confirmpassword: "",
          role: "admin"
        })
        // Switch to login tab after 2 seconds
        setTimeout(() => {
          setActiveTab("login")
          setSignupSuccess(null)
        }, 2000)
      } else {
        setSignupError(result.message || "Failed to create admin account. Please try again.")
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setSignupError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSignupLoading(false)
    }
  }

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-orange-500"
    if (passwordStrength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Get password strength text
  const getStrengthText = () => {
    if (passwordStrength <= 25) return "Weak"
    if (passwordStrength <= 50) return "Fair"
    if (passwordStrength <= 75) return "Good"
    return "Strong"
  }

  return (
    <>
      {/* Full Page Loader - Shows during login and redirect */}
      {isLoading && (
        <div className="fixed inset-0 bg-white dark:bg-gray-950 z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-sky-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">
                <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome Back!
                </span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to your dashboard...
              </p>
            </div>
            <div className="w-48 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" 
                style={{ width: '60%' }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Login/Signup Card */}
      <Card className="w-full max-w-md mx-auto border-0 shadow-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
              <TabsTrigger 
                value="login" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg py-2.5"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg py-2.5"
              >
                <UserPlus className="h-4 w-4" />
                Admin Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={onLoginSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        autoComplete="username"
                        placeholder="admin@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-sky-500 focus:ring-sky-500"
                        aria-invalid={!!error}
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 pr-24 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-sky-500 focus:ring-sky-500"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        onClick={() => setShowPassword((s) => !s)}
                        disabled={isLoading}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Signup Tab - Admin Registration */}
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={onSignupSubmit} className="space-y-4">
                <div className="space-y-4">
                 

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Name"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        disabled={isSignupLoading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-sky-500 focus:ring-sky-500"
                        required
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="admin@company.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        disabled={isSignupLoading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-sky-500 focus:ring-sky-500"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneno" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="phoneno"
                        type="tel"
                        placeholder="+919876543210"
                        value={signupForm.phoneno}
                        onChange={(e) => setSignupForm({ ...signupForm, phoneno: e.target.value })}
                        disabled={isSignupLoading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-sky-500 focus:ring-sky-500"
                        required
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        disabled={isSignupLoading}
                        className="pl-10 pr-24 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-sky-500 focus:ring-sky-500"
                        required
                        minLength={8}
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-medium"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        disabled={isSignupLoading}
                      >
                        {showSignupPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    {signupForm.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Password strength</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength <= 25 ? 'text-red-500' :
                            passwordStrength <= 50 ? 'text-orange-500' :
                            passwordStrength <= 75 ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {getStrengthText()}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getStrengthColor()} transition-all duration-300`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Use 8+ characters with mix of letters, numbers & symbols
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmpassword" className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-500" />
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmpassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupForm.confirmpassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmpassword: e.target.value })}
                        disabled={isSignupLoading}
                        className={`pl-10 pr-24 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-sky-500 focus:ring-sky-500 ${
                          signupForm.confirmpassword && signupForm.password !== signupForm.confirmpassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''
                        }`}
                        required
                      />
                      <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-medium"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSignupLoading}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                    {signupForm.confirmpassword && signupForm.password !== signupForm.confirmpassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Success Message */}
                  {signupSuccess && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{signupSuccess}</span>
                    </div>
                  )}

                  {/* Error Message */}
                  {signupError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSignupLoading}
                  >
                    {isSignupLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Register as Admin
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500 mt-2">
                    By registering, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Global Styles for animation */}
      <style jsx global>{`
        @keyframes loading {
          0% { width: 30%; }
          50% { width: 70%; }
          100% { width: 30%; }
        }
      `}</style>
    </>
  )
}