"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Employee {
  _id: string
  name: string
  email?: string
  position?: string
  role?: string
  department?: string
  avatar?: string
}

interface EditProjectFormProps {
  project: any
  onSubmit: (data: any) => void
  onCancel: () => void
  employees: Employee[]
}

export function EditProjectForm({ project, onSubmit, onCancel, employees }: EditProjectFormProps) {
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [deadlineDateOpen, setDeadlineDateOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const [formData, setFormData] = useState({
    projectName: "",
    client: "",
    startDate: new Date(),
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    teamMembers: [] as string[], // Array of employee IDs
    projectDescription: "",
    status: "planning" as "planning" | "in-progress" | "on-hold" | "completed" | "cancelled",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    budget: "",
    tags: [] as string[],
  })

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      const startDate = project.startDate ? new Date(project.startDate) : new Date()
      const deadline = project.deadline ? new Date(project.deadline) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      setFormData({
        projectName: project.projectName || "",
        client: project.client || "",
        startDate,
        deadline,
        teamMembers: project.teamMembers?.map((member: any) => member._id || member) || [],
        projectDescription: project.projectDescription || "",
        status: project.status || "planning",
        priority: project.priority || "medium",
        budget: project.budget?.toString() || "",
        tags: project.tags || [],
      })
      
      if (project.tags) {
        setFormData(prev => ({ ...prev, tags: project.tags }))
      }
    }
  }, [project])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }))
  }

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ 
        ...prev, 
        startDate: date,
        deadline: date > prev.deadline ? new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000) : prev.deadline
      }))
      setStartDateOpen(false)
    }
  }

  const handleDeadlineDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, deadline: date }))
      setDeadlineDateOpen(false)
    }
  }

  const handleTeamMemberToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, employeeId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((id) => id !== employeeId),
      }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submissionData = {
      projectName: formData.projectName?.trim() ?? "",
      client: formData.client?.trim() ?? "",
      startDate: formData.startDate ? formData.startDate.toISOString() : new Date().toISOString(),
      deadline: formData.deadline ? formData.deadline.toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      projectDescription: formData.projectDescription?.trim() ?? "",
      status: formData.status,
      priority: formData.priority,
      budget: Number(formData.budget || 0),
      tags: formData.tags.filter((tag) => tag && tag.trim() !== ""),
      teamMembers: formData.teamMembers.filter(Boolean),
      id: project?._id,
    }

    onSubmit(submissionData)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'on-hold': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'planning': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Check if an employee is selected
  const isEmployeeSelected = (employeeId: string) => {
    return formData.teamMembers.includes(employeeId)
  }

  // Get employee name by ID
  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp._id === id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="projectName">
            Project Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="Enter project name"
            required
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">Max 100 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">
            Client <span className="text-red-500">*</span>
          </Label>
          <Input
            id="client"
            name="client"
            value={formData.client}
            onChange={handleChange}
            placeholder="Enter client name"
            required
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">Max 100 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={formData.startDate} 
                onSelect={handleStartDateSelect} 
                initialFocus 
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">
            Deadline <span className="text-red-500">*</span>
          </Label>
          <Popover open={deadlineDateOpen} onOpenChange={setDeadlineDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="deadline"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !formData.deadline && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.deadline ? format(formData.deadline, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={formData.deadline} 
                onSelect={handleDeadlineDateSelect} 
                initialFocus 
                disabled={(date) => date < formData.startDate}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Deadline must be after start date
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">
                <Badge className={getStatusColor("planning")}>Planning</Badge>
              </SelectItem>
              <SelectItem value="in-progress">
                <Badge className={getStatusColor("in-progress")}>In Progress</Badge>
              </SelectItem>
              <SelectItem value="on-hold">
                <Badge className={getStatusColor("on-hold")}>On Hold</Badge>
              </SelectItem>
              <SelectItem value="completed">
                <Badge className={getStatusColor("completed")}>Completed</Badge>
              </SelectItem>
              <SelectItem value="cancelled">
                <Badge className={getStatusColor("cancelled")}>Cancelled</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">
            Priority <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <Badge className={getPriorityColor("low")}>Low</Badge>
              </SelectItem>
              <SelectItem value="medium">
                <Badge className={getPriorityColor("medium")}>Medium</Badge>
              </SelectItem>
              <SelectItem value="high">
                <Badge className={getPriorityColor("high")}>High</Badge>
              </SelectItem>
              <SelectItem value="critical">
                <Badge className={getPriorityColor("critical")}>Critical</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="pl-8"
            />
          </div>
          <p className="text-xs text-muted-foreground">Enter project budget in USD</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teamMembers">
          Team Members <span className="text-red-500">*</span>
        </Label>
        <div className="border rounded-md">
          <ScrollArea className="h-[200px] p-4">
            {employees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No employees found</p>
            ) : (
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div key={employee._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`team-${employee._id}`}
                      checked={isEmployeeSelected(employee._id)}
                      onCheckedChange={(checked) => handleTeamMemberToggle(employee._id, checked === true)}
                    />
                    <Label htmlFor={`team-${employee._id}`} className="flex-1 flex items-center gap-2">
                      {employee.avatar && (
                        <div className="h-6 w-6 rounded-full overflow-hidden">
                          <img 
                            src={employee?.avatar?.url} 
                            alt={employee.fullName} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{employee?.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {employee.position || employee.role} {employee.department && `• ${employee.department}`}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {formData.teamMembers.length} team member{formData.teamMembers.length !== 1 ? 's' : ''} selected
          </p>
          {formData.teamMembers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.teamMembers.slice(0, 3).map((employeeId) => {
                const employee = getEmployeeById(employeeId)
                return employee ? (
                  <Badge key={employeeId} variant="secondary" className="text-xs">
                    {employee?.fullName.split(' ')[0]}
                  </Badge>
                ) : null
              })}
              {formData.teamMembers.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{formData.teamMembers.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectDescription">Project Description</Label>
        <Textarea
          id="projectDescription"
          name="projectDescription"
          value={formData.projectDescription}
          onChange={handleChange}
          placeholder="Enter project description, objectives, and requirements..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {formData.projectDescription.length}/1000 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Add tags to categorize your project (e.g., "web", "mobile", "urgent")
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
          Save Changes
        </Button>
      </div>
    </form>
  )
}