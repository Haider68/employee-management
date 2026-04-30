"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Calendar,
  ClipboardList,
  Briefcase,
  Settings,
  X,
  Home,
  FileText,
} from "lucide-react"
import { useLayout } from "@/components/layout/layout-provider"
import { useAuth } from "./context/auth"

/* ============================
   Sidebar Items
============================ */

const allSidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Attendance", href: "/dashboard/attendance", icon: Calendar },
  { name: "Leave Management", href: "/dashboard/leave-management", icon: ClipboardList },
  { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
  { name: "About Us", href: "/dashboard/about", icon: FileText },
  { name: "Contact Us", href: "/dashboard/contact", icon: FileText },
  // { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const employeeSidebarItems = [
  { name: "Mark Attendance", href: "/dashboard/attendance", icon: Calendar },
  { name: "Leave Management", href: "/dashboard/leave-management", icon: ClipboardList },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

/* ============================
   Sidebar Component
============================ */

export function AppSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useLayout()
  const { user } = useAuth()

  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  /* ============================
     Role Handling
  ============================ */

  const userRole = user?.data?.user?.role || "employee"
  const isAdmin = userRole === "admin"

  const sidebarItems = isAdmin ? allSidebarItems : employeeSidebarItems

  /* ============================
     Client-only Logic
  ============================ */

  useEffect(() => {
    setMounted(true)

    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [setSidebarOpen])

  // 🚫 Prevent hydration mismatch
  if (!mounted) return null

  /* ============================
     Render
  ============================ */

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-sky-600 dark:text-sky-400">
            {isAdmin ? "EMS Pro Admin" : "EMS Pro"}
          </h1>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                  isActive
                    ? "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-medium">
              {user?.data?.user?.fullName?.charAt(0) || "U"}
            </div>

            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {user?.data?.user?.fullName || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.data?.user?.position || "Employee"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.data?.user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
