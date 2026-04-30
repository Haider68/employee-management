"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Moon, User, LogOut, Menu, Settings, ChevronDown, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useLayout } from "@/components/layout/layout-provider"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useAuth } from "./context/auth"

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const { sidebarOpen, setSidebarOpen, setDarkMode } = useLayout()
  const { toast } = useToast()
  const { logoutUser, user } = useAuth()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const logoutTimestampRef = useRef<number | null>(null)

  // Get user data from the nested structure or directly
  const userData = user?.data?.user || user
  const userRole = userData?.role || "user"
  const userFullName = userData?.fullName || userData?.name || "User"
  const userEmail = userData?.email || ""
  const userAvatar = userData?.avatar?.url || userData?.avatar || null

  // Get initials for avatar fallback
  const getUserInitials = () => {
    if (!userFullName) return "U"
    return userFullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format role for display
  const getRoleDisplay = () => {
    if (!userRole) return "User"
    return userRole.charAt(0).toUpperCase() + userRole.slice(1)
  }

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'admin': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
      case 'employee': return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
    }
  }

  /* ============================
     IMPORTANT: MOUNT GUARD
  ============================ */
  useEffect(() => {
    setMounted(true)
  }, [])

  /* ============================
     THEME TOGGLE (SAFE)
  ============================ */
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    setTheme(newTheme)
    setDarkMode(checked)
    toast({
      title: `${newTheme.charAt(0).toUpperCase()}${newTheme.slice(1)} mode activated`,
    })
  }

  /* ============================
     IMMEDIATE LOGOUT WITH LOADER
  ============================ */
  const handleLogout = async () => {
    // Set logout timestamp to prevent any UI from showing
    logoutTimestampRef.current = Date.now()
    setIsLoggingOut(true)
    
    // Close any open dropdowns
    document.body.click()
    
    try {
      // Call logout API in the background
      logoutUser().catch(console.error)
      
      // Show minimum loader time for better UX (500ms)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force redirect to login
      window.location.href = "/login"
    } catch {
      // If error occurs, still redirect but show error toast
      toast({
        title: "Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      })
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    }
  }

  /* ============================
     NAVIGATION
  ============================ */
  const navigateToProfile = () => {
    router.push("/dashboard/settings")
  }

  // If logging out, only show loader - no header content
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-6 p-8 rounded-lg">
          <div className="relative">
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full animate-ping bg-sky-400/20"></div>
            <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400/30 delay-100"></div>
            <Loader2 className="h-16 w-16 animate-spin text-sky-600 relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Logging out...
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we securely log you out
            </p>
          </div>
          <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
                 style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      {/* Left Side - Menu Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="hidden md:inline-block text-lg font-semibold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          {userRole.toUpperCase()}
        </span>
      </div>

      {/* Right Side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Desktop theme switch */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full">
          <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <Switch
            checked={theme === "dark"}
            onCheckedChange={handleThemeToggle}
            className="data-[state=checked]:bg-sky-600"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="outline" className="text-xs">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">New leave request</p>
                    <p className="text-xs text-gray-500">John Doe requested sick leave</p>
                    <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">Project update</p>
                    <p className="text-xs text-gray-500">Design review completed</p>
                    <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sky-600">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 pl-2 pr-4 gap-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar className="h-8 w-8 border-2 border-sky-200 dark:border-sky-800">
                {userAvatar && (
                  <AvatarImage src={userAvatar} alt={userFullName} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-medium line-clamp-1">{userFullName}</span>
                <span className="text-xs text-gray-500">{userEmail}</span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {/* User Info Card */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
              <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                {userAvatar && (
                  <AvatarImage src={userAvatar} alt={userFullName} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-lg font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {userFullName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {userEmail}
                </p>
                <Badge className={`mt-2 ${getRoleBadgeColor()}`}>
                  {getRoleDisplay()}
                </Badge>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuItem 
              onClick={navigateToProfile}
              className="cursor-pointer py-3"
            >
              <User className="mr-3 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>

            {/* Mobile theme switch */}
            <DropdownMenuItem className="md:hidden py-3">
              <Moon className="mr-3 h-4 w-4" />
              <span>Dark Mode</span>
              <div className="ml-auto">
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                  className="data-[state=checked]:bg-sky-600"
                />
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout button */}
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer py-3 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Add this to your global CSS file */}
      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </header>
  )
}