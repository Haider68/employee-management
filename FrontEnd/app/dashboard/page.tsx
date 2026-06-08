"use client"

import { Suspense, useEffect, useState } from "react"
import { 
  Loader2, Users, Calendar, Briefcase, TrendingUp, 
  UserPlus, Clock, CheckCircle, AlertCircle, Target,
  DollarSign, Activity, ChevronRight, Star, 
  CircleDot, Timer, FolderKanban,IndianRupee
} from "lucide-react"
import EmployeeDirectory from "@/components/employees/employee-directory"
import { getAllEmployees, getAllProjects, getAllAttendance } from "@/lib/api"
import { StatCard } from "@/components/leave/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Types
interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  onLeave: number
  newHires: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  presentToday: number
  absentToday: number
  lateToday: number
  totalBudget: number
  highPriorityProjects: number
}

// Loading Component
function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-gray-100 dark:bg-gray-900 rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Main Dashboard Component
function DashboardContent() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    newHires: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    totalBudget: 0,
    highPriorityProjects: 0
  })
  const [recentEmployees, setRecentEmployees] = useState<any[]>([])
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [projectStats, setProjectStats] = useState({
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
    byStatus: { active: 0, completed: 0, onHold: 0, cancelled: 0 },
    totalBudget: 0,
    avgBudget: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Tolerant extractor: returns the first array we find in the response
  // under any of the candidate keys (or the response itself if it's an array).
  // Handles both Node-style and .NET-style API shapes.
  const extractArray = (res: any, ...keys: string[]): any[] => {
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.data)) return res.data
    for (const k of keys) {
      if (Array.isArray(res?.data?.[k])) return res.data[k]
      if (Array.isArray(res?.[k])) return res[k]
    }
    return []
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [employeesRes, projectsRes, attendanceRes] = await Promise.all([
        getAllEmployees({}),
        getAllProjects({}),
        getAllAttendance({})
      ])

      // Process Employees Data
      {
        const employees = extractArray(employeesRes, 'employees')
        setRecentEmployees(employees.slice(0, 5))

        const total = employees.length
        const active = employees.filter((emp: any) => emp.status === 'active').length
        const onLeave = employees.filter((emp: any) => emp.status === 'onleave').length
        const newHires = employees.filter((emp: any) => {
          const joinDate = new Date(emp.joinDate)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return joinDate >= thirtyDaysAgo
        }).length

        setStats(prev => ({
          ...prev,
          totalEmployees: total,
          activeEmployees: active,
          onLeave: onLeave,
          newHires: newHires
        }))
      }

      // Process Projects Data
      {
        const projects = extractArray(projectsRes, 'projects')
        console.log("Projects data:", projects)

        setRecentProjects(projects.slice(0, 4))
        
        const total = projects.length
        const active = projects.filter((proj: any) => proj.status === 'active').length
        const completed = projects.filter((proj: any) => proj.status === 'completed').length
        const onHold = projects.filter((proj: any) => proj.status === 'onHold').length
        const cancelled = projects.filter((proj: any) => proj.status === 'cancelled').length
        
        const highPriority = projects.filter((proj: any) => proj.priority === 'high' || proj.priority === 'critical').length
        const mediumPriority = projects.filter((proj: any) => proj.priority === 'medium').length
        const lowPriority = projects.filter((proj: any) => proj.priority === 'low').length
        
        const totalBudget = projects.reduce((sum: number, proj: any) => sum + (proj.budget || 0), 0)
        const avgBudget = total > 0 ? totalBudget / total : 0

        setProjectStats({
          byPriority: { 
            low: lowPriority, 
            medium: mediumPriority, 
            high: highPriority, 
            critical: projects.filter((proj: any) => proj.priority === 'critical').length 
          },
          byStatus: { active, completed, onHold, cancelled },
          totalBudget,
          avgBudget
        })

        setStats(prev => ({
          ...prev,
          totalProjects: total,
          activeProjects: active,
          completedProjects: completed,
          totalBudget: totalBudget,
          highPriorityProjects: highPriority
        }))
      }

      // Process Attendance Data
      {
        const attendance = extractArray(attendanceRes, 'attendanceRecords', 'attendance')
        const today = new Date().toISOString().split('T')[0]

        const todayAttendance = attendance.filter((att: any) => {
          const dateStr = typeof att?.date === 'string' ? att.date : ''
          return dateStr.split('T')[0] === today
        })

        const present = todayAttendance.filter((att: any) => att.status === 'present').length
        const absent = todayAttendance.filter((att: any) => att.status === 'absent').length
        const late = todayAttendance.filter((att: any) => att.status === 'late').length

        setStats(prev => ({
          ...prev,
          presentToday: present,
          absentToday: absent,
          lateToday: late
        }))
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get initials
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { color: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      critical: { color: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400", icon: <Star className="h-3 w-3 mr-1" /> },
      medium: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400", icon: <CircleDot className="h-3 w-3 mr-1" /> },
      low: { color: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400", icon: <CheckCircle className="h-3 w-3 mr-1" /> }
    }
    const cfg = config[priority as keyof typeof config] || config.medium
    return (
      <Badge variant="outline" className={`${cfg.color} border-0`}>
        {cfg.icon} {priority}
      </Badge>
    )
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400", icon: <Activity className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      onHold: { color: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400", icon: <Timer className="h-3 w-3 mr-1" /> },
      cancelled: { color: "bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400", icon: <AlertCircle className="h-3 w-3 mr-1" /> }
    }
    const cfg = config[status as keyof typeof config] || config.active
    return (
      <Badge className={cfg.color}>
        {cfg.icon} {status}
      </Badge>
    )
  }

  if (loading) {
    return <DashboardLoading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your organization today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Live Updates
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchDashboardData}
            className="gap-2"
          >
            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          gradientFrom="from-sky-600"
          gradientTo="to-blue-600"
          icon={<Users className="h-5 w-5" />}
          subtext={`${stats.activeEmployees} active · ${stats.onLeave} on leave`}
        />
        <StatCard
          title="Today's Attendance"
          value={stats.presentToday}
          gradientFrom="from-green-600"
          gradientTo="to-emerald-600"
          icon={<Calendar className="h-5 w-5" />}
          subtext={`${stats.absentToday} absent · ${stats.lateToday} late`}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          gradientFrom="from-purple-600"
          gradientTo="to-pink-600"
          icon={<Briefcase className="h-5 w-5" />}
          subtext={`${stats.completedProjects} completed · ${stats.totalProjects} total`}
        />
        <StatCard
          title="Total Budget"
          value={`RS.${(stats.totalBudget / 100000).toFixed(1)}`}
          gradientFrom="from-amber-600"
          gradientTo="to-orange-600"
          // icon={<IndianRupee className="h-5 w-5" />}
          subtext={`${stats.highPriorityProjects} high priority projects`}
        />
      </div>

      {/* Project Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-blue-600" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.activeProjects}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.completedProjects}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{projectStats.byStatus.onHold}</p>
                <p className="text-xs text-muted-foreground">On Hold</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span className="font-medium">
                  {stats.totalProjects > 0
                    ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
                    : 0}%
                </span>
              </div>
              <Progress
                value={stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{projectStats.byPriority.high + projectStats.byPriority.critical}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{projectStats.byPriority.medium}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{projectStats.byPriority.low}</p>
                <p className="text-xs text-muted-foreground">Low</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Budget</span>
              <span className="text-sm font-semibold">RS.{(stats.totalBudget / 100000).toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees Section */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-sky-50 to-white dark:from-gray-900 dark:to-gray-950">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50">
              <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            Recent Employees
          </CardTitle>
          <Link href="/dashboard/employees">
            <Button variant="ghost" size="sm" className="gap-1 text-sky-600 hover:text-sky-700">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {recentEmployees.length > 0 ? (
              recentEmployees.map((emp: any, idx: number) => (
                <div key={emp.id ?? emp._id ?? idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-sky-200 dark:border-sky-800">
                      <AvatarImage src={emp.avatar?.url} alt={emp.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                        {getInitials(emp.fullName || emp.firstName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</p>
                      <p className="text-xs text-muted-foreground">{emp.position}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {emp.department}
                        </Badge>
                        <Badge className={
                          emp.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                          emp.status === 'onleave' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400'
                        }>
                          {emp.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No employees found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects Section - Beautiful Redesign */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Recent Projects
          </CardTitle>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm" className="gap-1 text-purple-600 hover:text-purple-700">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project: any, idx: number) => (
                <div key={project.id ?? project._id ?? idx} className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-200">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {project.projectName}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Client: {project.client}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(project.priority)}
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium">RS.{(project.budget / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Timer className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-medium">
                        Due: {new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium">{project.teamMembers?.length || 0} members</span>
                    </div>
                  </div>

                  {/* Team Members Avatars */}
                  {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Team Members</span>
                        <span className="text-[10px] text-muted-foreground">{project.teamMembers.length} members</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex -space-x-2">
                          {project.teamMembers.slice(0, 4).map((member: any, idx: number) => (
                            <Avatar key={member.id ?? member._id ?? idx} className="h-8 w-8 border-2 border-white dark:border-gray-900">
                              <AvatarImage src={member.avatar?.url} alt={member.fullName} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                                {getInitials(member.fullName || member.name || 'M')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.teamMembers.length > 4 && (
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                              <span className="text-xs font-medium">+{project.teamMembers.length - 4}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium truncate max-w-[150px]">
                            {project.teamMembers.map((m: any) => m.fullName).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Project Description */}
                  {project.projectDescription && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {project.projectDescription}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No projects found</p>
                <p className="text-sm mt-1">Create your first project to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Page Export
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}