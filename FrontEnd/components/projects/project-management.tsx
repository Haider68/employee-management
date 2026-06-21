"use client"
import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Clock, CheckCircle, AlertCircle, Briefcase, Edit, Trash2, Download, Eye, RefreshCw, Users, Calendar, IndianRupee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BarChart3, CheckCircle2, Clock3, AlertTriangle } from "lucide-react"
import { AddProjectForm } from "@/components/projects/add-project-form"
import { EditProjectForm } from "@/components/projects/edit-project-form"
import { ViewProjectDetails } from "@/components/projects/view-project-details"
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  addTeamMember,
  removeTeamMember,
  getAllEmployees,
  getApiErrorMessage,
} from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  _id: string
  projectName: string
  client: string
  startDate: string
  deadline: string
  teamMembers: Array<{
    _id: string
    name: string
    role?: string
    avatar?: string
  }>
  projectDescription?: string
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  budget?: number
  tags?: string[]
  attachments?: Array<{
    fileName: string
    fileUrl: string
    uploadedAt: string
  }>
  createdBy: {
    _id: string
    name: string
  }
  progressStatus?: string
  daysRemaining?: number
  completionDate?: string
  createdAt: string
  updatedAt: string
}

interface Employee {
  _id: string
  fullName: string
  email: string
  role: string
  department: string
  avatar?: string
}

interface ProjectStats {
  total: number
  planning: number
  inProgress: number
  completed: number
  onHold: number
  cancelled: number
  totalBudget: number
  overdue: number
}

export function ProjectManagement() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    planning: 0,
    inProgress: 0,
    completed: 0,
    onHold: 0,
    cancelled: 0,
    totalBudget: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [projectsRes, employeesRes, statsRes] = await Promise.allSettled([
        getAllProjects({}),
        getAllEmployees({}),
        getProjectStats()
      ])

      if (projectsRes.status === 'fulfilled' && projectsRes.value.success) {
        setProjects(projectsRes.value.data || [])
      }

      if (employeesRes.status === 'fulfilled' && employeesRes.value.success) {
        setEmployees(employeesRes.value.data || [])
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    
    const query = searchQuery.toLowerCase()
    return projects.filter(project => 
      project.projectName.toLowerCase().includes(query) ||
      project.client.toLowerCase().includes(query) ||
      project.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      project.teamMembers.some(member => 
        member.fullName.toLowerCase().includes(query)
      )
    )
  }, [projects, searchQuery])


 

  // Handle adding a new project
  const handleAddProject = async (projectData: any) => {
    try {
      const response = await createProject(projectData)
      if (response.success) {
        setProjects(prev => [response.data, ...prev])
        setAddDialogOpen(false)
        loadData() // Refresh stats
        toast({
          title: "Success",
          description: "Project created successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to create project"),
        variant: "destructive"
      })
    }
  }

  // Handle updating a project
  const handleEditProject = async (projectData: any) => {
    try {
      const response = await updateProject(selectedProject?._id, projectData)
      if (response.success) {
        setProjects(prev => 
          prev.map(proj => 
            proj._id === selectedProject?._id ? response.data : proj
          )
        )
        loadData()
        setEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Project updated successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to update project"),
        variant: "destructive"
      })
    }
  }

  // Handle deleting a project
  const handleDeleteProject = async () => {
    if (!selectedProject) return
    
    try {
      const response = await deleteProject(selectedProject._id)
      if (response.success) {
        setProjects(prev => prev.filter(proj => proj._id !== selectedProject._id))
        setDeleteDialogOpen(false)
        loadData() // Refresh stats
        toast({
          title: "Success",
          description: "Project deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to delete project"),
        variant: "destructive"
      })
    }
  }

  // Handle adding team member
  const handleAddTeamMember = async (projectId: string, employeeId: string) => {
    try {
      const response = await addTeamMember(projectId, employeeId)
      if (response.success) {
        setProjects(prev => 
          prev.map(proj => 
            proj._id === projectId ? response.data : proj
          )
        )
        toast({
          title: "Success",
          description: "Team member added successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      })
    }
  }

  // Handle removing team member
  const handleRemoveTeamMember = async (projectId: string, employeeId: string) => {
    try {
      const response = await removeTeamMember(projectId, employeeId)
      if (response.success) {
        setProjects(prev => 
          prev.map(proj => 
            proj._id === projectId ? response.data : proj
          )
        )
        toast({
          title: "Success",
          description: "Team member removed successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive"
      })
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Project Name", "Client", "Start Date", "Deadline", "Status", "Priority", "Budget", "Team Size"]
    const csvContent = [
      headers.join(","),
      ...projects.map(project => {
        return [
          `"${project.projectName.replace(/"/g, '""')}"`,
          `"${project.client.replace(/"/g, '""')}"`,
          new Date(project.startDate).toLocaleDateString(),
          new Date(project.deadline).toLocaleDateString(),
          project.status,
          project.priority,
          project.budget || 0,
          project.teamMembers.length
        ].join(",")
      })
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `projects_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `${projects.length} projects exported to CSV`
    })
  }

  // Get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        )
      case "on-hold":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertCircle className="h-3 w-3 mr-1" /> On Hold
          </Badge>
        )
      case "planning":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            <Calendar className="h-3 w-3 mr-1" /> Planning
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>
      case "low":
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  // Calculate progress based on dates
  const calculateProgress = (startDate: string, deadline: string, status: string) => {
    if (status === 'completed') return 100
    if (status === 'cancelled') return 0
    
    const start = new Date(startDate).getTime()
    const end = new Date(deadline).getTime()
    const now = new Date().getTime()
    
    if (now < start) return 0
    if (now > end) return 100
    
    const totalDuration = end - start
    const elapsed = now - start
    return Math.min(100, Math.round((elapsed / totalDuration) * 100))
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Dialog open handlers
  const openViewDialog = (project: Project) => {
    setSelectedProject(project)
    setViewDialogOpen(true)
  }

  const openEditDialog = (project: Project) => {
    setSelectedProject(project)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  // Loading skeleton
  if (loading && projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <div className="p-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Projects</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{stats.total}</span>
            <Briefcase className="h-5 w-5" />
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{stats.inProgress}</span>
            <Clock3 className="h-5 w-5" />
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{stats.completed}</span>
            <CheckCircle2 className="h-5 w-5" />
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-gradient-to-r from-amber-400 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">On Hold</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{stats.onHold}</span>
            <AlertTriangle className="h-5 w-5" />
          </CardContent>
        </Card>

        <Card className="shadow-sm col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <span className="mr-2 font-medium">Rs</span> Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">
              {stats.totalBudget?.toLocaleString() || 0}
            </span>
          </CardContent>
        </Card>

        <Card className="shadow-sm col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Users className="h-4 w-4 mr-2" /> Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">
              {employees.length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Header with Actions */}
      <Card className="shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-sky-600" />
            <h3 className="text-lg font-medium">Project Management</h3>
          </div>
          <div className="flex flex-1 md:flex-none gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-8"
                aria-label="Search projects"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={loadData}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2" onClick={exportToCSV}>
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export projects to CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </div>
        </div>
      </Card>

      {/* Projects Table */}
      <Card className="shadow-sm">
        <Tabs defaultValue="all">
          <TabsList className="w-full border-b rounded-none justify-start">
            <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="planning">Planning ({stats.planning})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
            <TabsTrigger value="on-hold">On Hold ({stats.onHold})</TabsTrigger>
          </TabsList>



          <TabsContent value="all" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
                    const progress = calculateProgress(project.startDate, project.deadline, project.status)
                    return (
                      <TableRow key={project._id}>
                        <TableCell className="font-medium text-sky-600">
                          {project.projectName}
                        </TableCell>
                        <TableCell>{project.client}</TableCell>
                        <TableCell>{formatDate(project.startDate)}</TableCell>
                        <TableCell>{formatDate(project.deadline)}</TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {project?.teamMembers.slice(0, 3).map((member,index) => (
                              <TooltipProvider key={index}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                      <AvatarImage src={member?.avatar} alt={member?.fullName} />
                                        
                                      <AvatarFallback>{member?.fullName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{member?.fullName}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                            {project.teamMembers.length > 3 && (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                                +{project.teamMembers.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 w-[100px]" />
                            <span className="text-xs">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell>{getPriorityBadge(project.priority)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600"
                                    onClick={() => openViewDialog(project)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View project details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600"
                                    onClick={() => openEditDialog(project)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit project</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => openDeleteDialog(project)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete project</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredProjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No projects found matching your search" : "No projects found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Status-specific tabs */}
          {['in-progress', 'planning', 'completed', 'on-hold', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects
                      .filter(project => project.status === status)
                      .map((project) => {
                        const progress = calculateProgress(project.startDate, project.deadline, project.status)
                        return (
                          <TableRow key={project._id}>
                            <TableCell className="font-medium text-sky-600">
                              {project.projectName}
                            </TableCell>
                            <TableCell>{project.client}</TableCell>
                            <TableCell>{formatDate(project.startDate)}</TableCell>
                            <TableCell>{formatDate(project.deadline)}</TableCell>
                            <TableCell>
                              <div className="flex -space-x-2">
                                {project.teamMembers.slice(0, 3).map((member) => (
                                  <Avatar key={member._id} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={member?.avatar} alt={member?.firstName} />
                                    <AvatarFallback>{member?.fullName?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {project.teamMembers.length > 3 && (
                                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                                    +{project.teamMembers.length - 3}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="h-2 w-[100px]" />
                                <span className="text-xs">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(project.priority)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600"
                                  onClick={() => openViewDialog(project)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600"
                                  onClick={() => openEditDialog(project)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => openDeleteDialog(project)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    {filteredProjects.filter(project => project.status === status).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No {status.replace('-', ' ')} projects found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Add Project Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <AddProjectForm
            employees={employees}
            onSubmit={handleAddProject}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ViewProjectDetails
              project={selectedProject}
              employees={employees}
              onAddTeamMember={handleAddTeamMember}
              onRemoveTeamMember={handleRemoveTeamMember}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <EditProjectForm
              project={selectedProject}
              employees={employees}
              onSubmit={handleEditProject}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{selectedProject?.projectName}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}