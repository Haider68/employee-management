"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X, Upload } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Employee {
  _id: string
  name: string
  email: string
  position?: string
  role?: string
  department?: string
  avatar?: string
}

interface AddProjectFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  employees: Employee[]
}

export function AddProjectForm({ onSubmit, onCancel, employees }: AddProjectFormProps) {
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [deadlineDateOpen, setDeadlineDateOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [attachments, setAttachments] = useState<Array<{ fileName: string; fileUrl: string }>>([])

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
    attachments: [] as Array<{ fileName: string; fileUrl: string }>
  })



  // Set createdBy from localStorage or context (in real app, get from auth context)
  useEffect(() => {
    const userId = localStorage.getItem("userId") || "current-user-id"
    setFormData(prev => ({ ...prev, createdBy: userId, lastUpdatedBy: userId }))
  }, [])

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        // In a real app, upload file to server and get URL
        // For demo, create a mock file object
        const newAttachment = {
          fileName: file.name,
          fileUrl: URL.createObjectURL(file)
        }
        setAttachments(prev => [...prev, newAttachment])
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment]
        }))
      })
    }
  }

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments]
    newAttachments.splice(index, 1)
    setAttachments(newAttachments)
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare data for API
    const submissionData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      startDate: formData.startDate.toISOString(),
      deadline: formData.deadline.toISOString(),
      // Remove empty strings from tags
      tags: formData.tags.filter(tag => tag.trim() !== ''),
      // For demo, if no team members selected, add current user
      teamMembers: formData.teamMembers.length > 0 ? formData.teamMembers : [formData.createdBy]
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">RS.</span>
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
          <p className="text-xs text-muted-foreground">Enter project budget in INDIAN RUPEES</p>
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
                      checked={formData.teamMembers.includes(employee._id)}
                      onCheckedChange={(checked) => handleTeamMemberToggle(employee._id, checked === true)}
                    />
                    <Label htmlFor={`team-${employee._id}`} className="flex-1 flex items-center gap-2">
                      {employee.avatar && (
                        <div className="h-6 w-6 rounded-full overflow-hidden">
                          <img 
                            src={employee?.avatar?.url} 
                            alt={employee.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{employee.name}</div>
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
        <p className="text-sm text-muted-foreground">
          {formData.teamMembers.length} team member{formData.teamMembers.length !== 1 ? 's' : ''} selected
        </p>
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

      <div className="space-y-2">
        <Label htmlFor="attachments">Attachments</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Input
            id="attachments"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Label htmlFor="attachments" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">Max file size: 10MB</p>
              </div>
            </div>
          </Label>
        </div>
        
        {attachments.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium">Uploaded files:</p>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-xs font-medium">.{file.fileName.split('.').pop()?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
          Create Project
        </Button>
      </div>
    </form>
  )
}