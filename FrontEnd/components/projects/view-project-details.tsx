"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Users,
  AlertTriangle,
  Target,
  BarChart3,
  User,
  Briefcase,
  Layers
} from "lucide-react"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface Employee {
  _id: string
  name: string
  email?: string
  position?: string
  role?: string
  department?: string
  avatar?: string
}

interface Attachment {
  fileName: string
  fileUrl: string
  uploadedAt: string
}

interface ViewProjectDetailsProps {
  project: any
  employees?: Employee[]
  onAddTeamMember?: (projectId: string, employeeId: string) => void
  onRemoveTeamMember?: (projectId: string, employeeId: string) => void
}

export function ViewProjectDetails({ 
  project, 
  employees = [], 
  onAddTeamMember, 
  onRemoveTeamMember 
}: ViewProjectDetailsProps) {
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch {
      return dateString
    }
  }

  const calculateProgress = () => {
    if (project.status === 'completed') return 100
    if (project.status === 'cancelled') return 0
    
    try {
      const start = new Date(project.startDate).getTime()
      const end = new Date(project.deadline).getTime()
      const now = new Date().getTime()
      
      if (now < start) return 0
      if (now > end) return 100
      
      const totalDuration = end - start
      const elapsed = now - start
      return Math.min(100, Math.round((elapsed / totalDuration) * 100))
    } catch {
      return 0
    }
  }

  const getDaysRemaining = () => {
    try {
      const deadline = new Date(project.deadline)
      const today = new Date()
      const timeDiff = deadline.getTime() - today.getTime()
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
      return daysRemaining
    } catch {
      return 0
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "on-hold":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> On Hold
          </Badge>
        )
      case "planning":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
            <Target className="h-3 w-3" /> Planning
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Cancelled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

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

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500"
    if (progress < 70) return "bg-amber-500"
    return "bg-green-500"
  }

  const progress = calculateProgress()
  const daysRemaining = getDaysRemaining()
  const isOverdue = daysRemaining < 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{project.projectName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Client: {project.client}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {getStatusBadge(project.status)}
          {getPriorityBadge(project.priority)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold mt-1">{progress}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-sky-500" />
                </div>
                <Progress value={progress} className="mt-3 h-2" indicatorClassName={getProgressColor(progress)} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Days Remaining</p>
                    <p className={`text-2xl font-bold mt-1 ${isOverdue ? 'text-red-500' : ''}`}>
                      {isOverdue ? `Overdue ${Math.abs(daysRemaining)} days` : `${daysRemaining} days`}
                    </p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget</p>
                    <p className="text-2xl font-bold mt-1">
                      ${project.budget ? project.budget.toLocaleString() : '0'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {project.projectDescription || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Start Date:</span>
                  </div>
                  <span className="font-medium">{formatDate(project.startDate)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Deadline:</span>
                  </div>
                  <span className="font-medium">{formatDate(project.deadline)}</span>
                </div>

                {project.completionDate && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Completion Date:</span>
                      </div>
                      <span className="font-medium">{formatDate(project.completionDate)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Team & Details */}
        <div className="space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <Badge variant="outline">
                  {project.teamMembers?.length || 0} members
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  project.teamMembers.map((member: any, index: number) => (
                    <div key={member._id || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={member?.avatar?.url} alt={member?.fullName} />
                          <AvatarFallback>
                            {member?.fullName ? member?.fullName.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member?.fullName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {member?.position || member.role || "Team Member"}
                            {member.department && ` • ${member?.department}`}
                          </p>
                        </div>
                      </div>
                      {onRemoveTeamMember && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => onRemoveTeamMember(project._id, member._id)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No team members assigned</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Created By */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {project.createdBy?.name || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Last Updated */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm mt-1">{formatDate(project.updatedAt)}</p>
              </div>

              {/* Created At */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-sm mt-1">{formatDate(project.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {project.attachments && project.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Attachments ({project.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.attachments.map((attachment: Attachment, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            .{attachment.fileName.split('.').pop()?.toUpperCase()}
                          </span>
                        </div>
                        <div className="max-w-[150px]">
                          <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}