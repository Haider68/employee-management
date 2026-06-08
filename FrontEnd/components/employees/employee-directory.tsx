"use client"

import { useState, useEffect, useCallback, ChangeEvent, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Download,
  Users,
  Activity,
  Briefcase,
  Building2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  CalendarIcon,
  Upload,
  X,
  User,
  ChevronDown,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Import API functions with types
import {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  changeEmployeeStatus
} from "@/lib/api"

// Import types
import { Employee, EmployeeFormData } from "../types/employe"

interface Filters {
  department: string;
  status: string;
}

interface StatusOption {
  value: 'active' | 'onleave' | 'remote' | 'inactive';
  label: string;
  color: string;
}

// Helper component to suppress hydration attributes
const SuppressHydrationWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  return <>{children}</>
}

// Add Employee Form Component
function AddEmployeeForm({ 
  onSubmit, 
  onCancel, 
  loading = false 
}: { 
  onSubmit: (formData: FormData) => void
  onCancel: () => void
  loading?: boolean 
}) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "Engineering",
    status: "active" as const,
    joinDate: new Date(),
    birthDate: undefined as Date | undefined,
    address: "",
    salary: "",
    password: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle date change
  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }))
  }

  // Handle avatar upload
  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: "Please upload an image file" }))
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: "Image size should be less than 5MB" }))
        return
      }

      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, avatar: "" }))
    }
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.position.trim()) newErrors.position = "Position is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.joinDate) newErrors.joinDate = "Join date is required"
    if (!formData.password.trim()) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Create FormData for file upload
    const formDataToSend = new FormData()
    formDataToSend.append("fullName", formData.fullName)
    formDataToSend.append("email", formData.email)
    formDataToSend.append("phone", formData.phone)
    formDataToSend.append("position", formData.position)
    formDataToSend.append("department", formData.department)
    formDataToSend.append("status", formData.status)
    formDataToSend.append("joinDate", formData.joinDate.toISOString())
    formDataToSend.append("password", formData.password)
    
    if (formData.birthDate) {
      formDataToSend.append("birthDate", formData.birthDate.toISOString())
    }
    if (formData.address) {
      formDataToSend.append("address", formData.address)
    }
    if (formData.salary) {
      formDataToSend.append("salary", formData.salary)
    }
    if (avatarFile) {
      formDataToSend.append("avatar", avatarFile)
    }

    onSubmit(formDataToSend)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload Section */}
      <div className="space-y-4">
        <Label>Profile Photo</Label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-gray-300">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Avatar preview" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              )}
            </Avatar>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                aria-label="Remove avatar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-2 flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              ref={fileInputRef}
              className="hidden"
              id="avatar-upload"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
                suppressHydrationWarning
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-2"
                  suppressHydrationWarning
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              JPG, PNG or GIF (Max 5MB)
            </p>
            {errors.avatar && (
              <p className="text-sm text-red-500">{errors.avatar}</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Name"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="xyz@example.com"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter Your Password"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+91 9876543210"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">
            Position <span className="text-red-500">*</span>
          </Label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Software Engineer"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.position && (
            <p className="text-sm text-red-500">{errors.position}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleSelectChange("department", value)}
            disabled={loading}
          >
            <SelectTrigger suppressHydrationWarning>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {["Engineering", "HR", "Marketing", "Sales", "Finance", "Operations"].map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value as typeof formData.status)}
            disabled={loading}
          >
            <SelectTrigger suppressHydrationWarning>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "active", label: "Active" },
                { value: "onleave", label: "On Leave" },
                { value: "remote", label: "Remote" },
                { value: "inactive", label: "Inactive" }
              ].map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <Label>
            Join Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.joinDate && "text-muted-foreground"
                )}
                disabled={loading}
                suppressHydrationWarning
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.joinDate ? format(formData.joinDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.joinDate}
                onSelect={(date) => handleDateChange("joinDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.joinDate && (
            <p className="text-sm text-red-500">{errors.joinDate}</p>
          )}
        </div>
      </div>

      {/* Birth Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Birth Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.birthDate && "text-muted-foreground"
                )}
                disabled={loading}
                suppressHydrationWarning
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthDate ? format(formData.birthDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.birthDate}
                onSelect={(date) => handleDateChange("birthDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Salary */}
        <div className="space-y-2">
          <Label htmlFor="salary">Salary (Optional)</Label>
          <Input
            id="salary"
            name="salary"
            type="number"
            value={formData.salary}
            onChange={handleInputChange}
            placeholder="50000"
            disabled={loading}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter full address"
          rows={3}
          disabled={loading}
          suppressHydrationWarning
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          suppressHydrationWarning
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
          suppressHydrationWarning
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Employee"
          )}
        </Button>
      </div>
    </form>
  )
}

// Edit Employee Form Component
function EditEmployeeForm({ 
  employee, 
  onSubmit, 
  onCancel, 
  loading = false 
}: { 
  employee: Employee
  onSubmit: (formData: FormData) => void
  onCancel: () => void
  loading?: boolean 
}) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "Engineering",
    status: "active" as const,
    joinDate: new Date(),
    birthDate: undefined as Date | undefined,
    address: "",
    salary: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form with employee data
  useEffect(() => {
    if (employee) {
      setFormData({
        fullName: employee.fullName || employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        department: employee.department || "Engineering",
        status: employee.status || "active",
        joinDate: employee.joinDate ? new Date(employee.joinDate) : new Date(),
        birthDate: employee.birthDate ? new Date(employee.birthDate) : undefined,
        address: employee.address || "",
        salary: employee.salary?.toString() || ""
      })

      if (employee.avatar) {
        if (typeof employee.avatar === 'object' && employee.avatar.url) {
          setAvatarPreview(employee.avatar.url)
        } else if (typeof employee.avatar === 'string') {
          setAvatarPreview(employee.avatar)
        }
      }
    }
  }, [employee])

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle date change
  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }))
  }

  // Handle avatar upload
  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: "Please upload an image file" }))
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: "Image size should be less than 5MB" }))
        return
      }

      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, avatar: "" }))
    }
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.position.trim()) newErrors.position = "Position is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.joinDate) newErrors.joinDate = "Join date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Create FormData for file upload
    const formDataToSend = new FormData()
    formDataToSend.append("fullName", formData.fullName)
    formDataToSend.append("email", formData.email)
    formDataToSend.append("phone", formData.phone)
    formDataToSend.append("position", formData.position)
    formDataToSend.append("department", formData.department)
    formDataToSend.append("status", formData.status)
    formDataToSend.append("joinDate", formData.joinDate.toISOString())
    
    if (formData.birthDate) {
      formDataToSend.append("birthDate", formData.birthDate.toISOString())
    }
    if (formData.address) {
      formDataToSend.append("address", formData.address)
    }
    if (formData.salary) {
      formDataToSend.append("salary", formData.salary)
    }
    if (avatarFile) {
      formDataToSend.append("avatar", avatarFile)
    }

    onSubmit(formDataToSend)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload Section */}
      <div className="space-y-4">
        <Label>Profile Photo</Label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-gray-300">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Avatar preview" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              )}
            </Avatar>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                aria-label="Remove avatar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-2 flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              ref={fileInputRef}
              className="hidden"
              id="avatar-upload-edit"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
                suppressHydrationWarning
              >
                <Upload className="h-4 w-4" />
                {avatarPreview ? "Change Photo" : "Upload Photo"}
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-2"
                  suppressHydrationWarning
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              JPG, PNG or GIF (Max 5MB)
            </p>
            {errors.avatar && (
              <p className="text-sm text-red-500">{errors.avatar}</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Name"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+91 9876543210"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">
            Position <span className="text-red-500">*</span>
          </Label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Software Engineer"
            disabled={loading}
            suppressHydrationWarning
          />
          {errors.position && (
            <p className="text-sm text-red-500">{errors.position}</p>
          )}
        </div>
      </div>

      {/* Department & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleSelectChange("department", value)}
            disabled={loading}
          >
            <SelectTrigger suppressHydrationWarning>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {["Engineering", "HR", "Marketing", "Sales", "Finance", "Operations"].map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value as typeof formData.status)}
            disabled={loading}
          >
            <SelectTrigger suppressHydrationWarning>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "active", label: "Active" },
                { value: "onleave", label: "On Leave" },
                { value: "remote", label: "Remote" },
                { value: "inactive", label: "Inactive" }
              ].map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Join Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.joinDate && "text-muted-foreground"
                )}
                disabled={loading}
                suppressHydrationWarning
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.joinDate ? format(formData.joinDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.joinDate}
                onSelect={(date) => handleDateChange("joinDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.joinDate && (
            <p className="text-sm text-red-500">{errors.joinDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Birth Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.birthDate && "text-muted-foreground"
                )}
                disabled={loading}
                suppressHydrationWarning
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthDate ? format(formData.birthDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.birthDate}
                onSelect={(date) => handleDateChange("birthDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Salary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary">Salary (Optional)</Label>
          <Input
            id="salary"
            name="salary"
            type="number"
            value={formData.salary}
            onChange={handleInputChange}
            placeholder="50000"
            disabled={loading}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter full address"
          rows={3}
          disabled={loading}
          suppressHydrationWarning
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          suppressHydrationWarning
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
          suppressHydrationWarning
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Employee"
          )}
        </Button>
      </div>
    </form>
  )
}

// View Employee Details Component
function ViewEmployeeDetails({ 
  employee, 
  loading = false 
}: { 
  employee: Employee
  loading?: boolean 
}) {
  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-gray-300">
              {(employee.avatar && typeof employee.avatar === 'object' && employee.avatar.url) ? (
                <AvatarImage src={employee.avatar.url} alt={employee.name || employee.fullName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {employee.name?.charAt(0) || employee.fullName?.charAt(0) || "E"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold">{employee.name || employee.fullName}</h3>
              <p className="text-gray-600">{employee.position}</p>
              <p className="text-sm text-gray-500">{employee.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Personal Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="font-medium">{employee.employeeId || employee._id?.slice(-8) || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{employee.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Department:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {employee.department}
                  </Badge>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className={
                    employee.status === "active" ? "bg-green-100 text-green-800" :
                    employee.status === "onleave" ? "bg-amber-100 text-amber-800" :
                    employee.status === "remote" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }>
                    {employee.status === "active" ? "Active" :
                     employee.status === "onleave" ? "On Leave" :
                     employee.status === "remote" ? "Remote" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Employment Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Join Date:</span>
                  <span className="font-medium">
                    {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Birth Date:</span>
                  <span className="font-medium">
                    {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-medium">
                    {employee.salary ? `₹${Number(employee.salary).toLocaleString()}` : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {employee.address && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Address</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{employee.address}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Responsive Table Row for Mobile
const MobileEmployeeCard = ({ employee, onView, onEdit, onDelete, onStatusChange, loadingAction }: {
  employee: Employee
  onView: (emp: Employee) => void
  onEdit: (emp: Employee) => void
  onDelete: (emp: Employee) => void
  onStatusChange: (id: string, status: 'active' | 'onleave' | 'remote' | 'inactive') => void
  loadingAction: boolean
}) => {
  const statusOptions: StatusOption[] = [
    { value: "active", label: "Active", color: "text-green-600" },
    { value: "onleave", label: "On Leave", color: "text-amber-600" },
    { value: "remote", label: "Remote", color: "text-blue-600" },
    { value: "inactive", label: "Inactive", color: "text-gray-600" },
  ]

  const getAvatarUrl = (employee: Employee): string => {
    if (employee.avatar && typeof employee.avatar === 'object' && 'url' in employee.avatar) {
      return employee.avatar.url
    }
    if (typeof employee.avatar === 'string' && employee.avatar) {
      return employee.avatar
    }
    const name = employee.name || employee.fullName || "Employee"
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "onleave": return "bg-amber-100 text-amber-800"
      case "remote": return "bg-blue-100 text-blue-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active": return "Active"
      case "onleave": return "On Leave"
      case "remote": return "Remote"
      case "inactive": return "Inactive"
      default: return status
    }
  }

  const getDepartmentColor = (department: string): string => {
    switch (department) {
      case "Engineering": return "bg-blue-100 text-blue-800"
      case "Marketing": return "bg-orange-100 text-orange-800"
      case "HR": return "bg-purple-100 text-purple-800"
      case "Finance": return "bg-green-100 text-green-800"
      case "Sales": return "bg-red-100 text-red-800"
      case "Operations": return "bg-cyan-100 text-cyan-800"
      case "IT": return "bg-indigo-100 text-indigo-800"
      case "Customer Support": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="border rounded-lg p-4 mb-3 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 border-2 border-gray-200">
          <AvatarImage src={getAvatarUrl(employee)} alt={employee.name || employee.fullName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {(employee.name || employee.fullName || "E").charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {employee.name || employee.fullName}
          </div>
          <div className="text-sm text-gray-500 truncate">{employee.email}</div>
          <div className="text-xs font-mono text-gray-400 mt-1">
            {employee.employeeId || `EMP${(employee._id || "").slice(-6).toUpperCase()}`}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onView(employee)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => onEdit(employee)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => onDelete(employee)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div>
          <span className="text-xs text-gray-500">Position</span>
          <p className="text-sm font-medium truncate">{employee.position}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Department</span>
          <div>
            <Badge variant="outline" className={`${getDepartmentColor(employee.department)} text-xs`}>
              {employee.department}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <span className="text-xs text-gray-500">Status</span>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`${getStatusColor(employee.status)} text-xs`}>
              {getStatusLabel(employee.status)}
            </Badge>
            <Select
              value={employee.status}
              onValueChange={(value: any) => onStatusChange(employee._id || employee.id || "", value)}
              disabled={loadingAction}
            >
              <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent">
                <ChevronDown className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent align="end">
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className={option.color}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-500">Join Date</span>
          <p className="text-sm">
            {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) : "N/A"}
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Employee Directory Component - WITH CLIENT-SIDE FILTERING ONLY
export default function EmployeeDirectory() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const [loading, setLoading] = useState<boolean>(true)
  const [loadingAction, setLoadingAction] = useState<boolean>(false)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]) // Store ALL employees
  const [searchText, setSearchText] = useState<string>("")
  const [filters, setFilters] = useState<Filters>({
    department: "all",
    status: "all",
  })
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 10

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false)
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

  // Selected employee for operations
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Departments for filter
  const departments = [
    "Engineering", "HR", "Marketing", "Finance", 
    "Sales", "Operations", "IT", "Customer Support"
  ]

  // Status options for dropdown
  const statusOptions: StatusOption[] = [
    { value: "active", label: "Active", color: "text-green-600" },
    { value: "onleave", label: "On Leave", color: "text-amber-600" },
    { value: "remote", label: "Remote", color: "text-blue-600" },
    { value: "inactive", label: "Inactive", color: "text-gray-600" },
  ]

  // Handle mounting for hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch ALL employees from API - NO FILTERS ON SERVER
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch all employees without any filters
      const response = await getAllEmployees({})
      
      if (response.success) {
        // Normalize employee data to handle both name/fullName fields
        const normalizedEmployees = (response.data || []).map((emp: any) => ({
          ...emp,
          name: emp.name || emp.fullName || "Unknown",
          fullName: emp.fullName || emp.name || "Unknown"
        }))
        
        setAllEmployees(normalizedEmployees)
        console.log("All employees loaded:", normalizedEmployees.length)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to fetch employees"
        })
        setAllEmployees([])
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load employees"
      })
      setAllEmployees([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load employees when component mounts
  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // CLIENT-SIDE FILTERING - Apply all filters in the browser
  const getFilteredEmployees = useCallback(() => {
    return allEmployees.filter((employee) => {
      // Apply department filter
      if (filters.department !== "all" && employee.department !== filters.department) {
        return false
      }
      
      // Apply status filter
      if (filters.status !== "all" && employee.status !== filters.status) {
        return false
      }
      
      // Apply search filter
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase()
        const matchesSearch = 
          employee.name?.toLowerCase().includes(searchLower) ||
          employee.fullName?.toLowerCase().includes(searchLower) ||
          employee.position?.toLowerCase().includes(searchLower) ||
          employee.employeeId?.toLowerCase().includes(searchLower) ||
          employee.email?.toLowerCase().includes(searchLower) ||
          employee.phone?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) {
          return false
        }
      }
      
      return true
    })
  }, [allEmployees, filters.department, filters.status, searchText])

  // Get filtered employees
  const filteredEmployees = getFilteredEmployees()

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1
  const paginatedData = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle filter change - CLIENT SIDE ONLY
  const handleFilterChange = (type: 'department' | 'status', value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [type]: value }
      console.log(`Filter changed - ${type}:`, value, "New filters:", newFilters)
      return newFilters
    })
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({ department: "all", status: "all" })
    setSearchText("")
    setCurrentPage(1)
  }

  const getDepartmentColor = (department: string): string => {
    switch (department) {
      case "Engineering":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "Marketing":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "HR":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "Finance":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Sales":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "Operations":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400"
      case "IT":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      case "Customer Support":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "onleave":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "remote":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active": return "Active"
      case "onleave": return "On Leave"
      case "remote": return "Remote"
      case "inactive": return "Inactive"
      default: return status
    }
  }

  // Get avatar URL
  const getAvatarUrl = (employee: Employee): string => {
    if (employee.avatar && typeof employee.avatar === 'object' && 'url' in employee.avatar) {
      return employee.avatar.url
    }
    
    if (typeof employee.avatar === 'string' && employee.avatar) {
      return employee.avatar
    }
    
    const name = employee.name || employee.fullName || "Employee"
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`
  }

  const hasAvatar = (employee: Employee): boolean => {
    return Boolean(
      (employee.avatar && typeof employee.avatar === 'object' && employee.avatar.url) ||
      (typeof employee.avatar === 'string' && employee.avatar)
    )
  }

  // Handle Add Employee
  const handleAddEmployee = async (formData: FormData) => {
    try {
      setLoadingAction(true)
      
      const response = await createEmployee(formData)
      
      if (response.success) {
        await fetchEmployees() // Refresh the list
        setAddDialogOpen(false)
        
        toast({
          title: "Employee Added",
          description: `${response.data?.name || response.data?.fullName || 'Employee'} has been added successfully.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to add employee"
        })
      }
    } catch (error) {
      
      toast({
        variant: "destructive",
        title: "Error",
        description:  error ||  "Failed to add employee"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Handle Edit Employee
  const handleEditEmployee = async (employeeId: string, formData: FormData) => {
    try {
      setLoadingAction(true)
      const response = await updateEmployee(employeeId, formData)
      if (response.success) {
        await fetchEmployees() // Refresh the list
        setEditDialogOpen(false)
        
        toast({
          title: "Employee Updated",
          description: `${response.data?.name || response.data?.fullName || 'Employee'} has been updated successfully.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to update employee"
        })
      }
    } catch (error) {
      console.error("Update error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update employee"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Handle Delete Employee
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return
    
    try {
      setLoadingAction(true)
      const employeeId = selectedEmployee._id || selectedEmployee.id
      if (!employeeId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Employee ID not found"
        })
        return
      }
      
      const response = await deleteEmployee(employeeId)
      
      if (response.success) {
        await fetchEmployees() // Refresh the list
        setDeleteDialogOpen(false)
        setSelectedEmployee(null)
        
        toast({
          title: "Employee Deleted",
          description: `${selectedEmployee.name || selectedEmployee.fullName} has been deleted successfully.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to delete employee"
        })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete employee"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Handle Status Change
  const handleStatusChange = async (employeeId: string, newStatus: 'active' | 'onleave' | 'remote' | 'inactive') => {
    try {
      const response = await changeEmployeeStatus(employeeId, newStatus)
      
      if (response.success) {
        // Optimistic update
        setAllEmployees(prev => prev.map(emp => 
          emp._id === employeeId ? { ...emp, status: newStatus } : emp
        ))
        
        toast({
          title: "Status Updated",
          description: `Employee status changed to ${getStatusLabel(newStatus)}`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to update status"
        })
        // Refresh to get correct state
        await fetchEmployees()
      }
    } catch (error) {
      console.error("Status change error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status"
      })
    }
  }

  // Open View Dialog
  const openViewDialog = async (employee: Employee) => {
    try {
      setLoadingAction(true)
      const employeeId = employee._id || employee.id
      if (!employeeId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Employee ID not found"
        })
        return
      }
      
      const response = await getEmployee(employeeId)
      
      if (response.success) {
        setSelectedEmployee(response.data)
        setViewDialogOpen(true)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load employee details"
        })
      }
    } catch (error) {
      console.error("View error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load employee details"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Employee ID", "Name", "Position", "Department", "Email", "Phone", "Join Date", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredEmployees.map((employee) => {
        return [
          employee.employeeId || employee._id?.slice(-8) || "",
          `"${employee.name || employee.fullName || ""}"`,
          `"${employee.position || ""}"`,
          `"${employee.department || ""}"`,
          `"${employee.email || ""}"`,
          `"${employee.phone || ""}"`,
          employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "",
          getStatusLabel(employee.status),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `employees_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `${filteredEmployees.length} employee records exported to CSV.`,
    })
  }

  // Calculate statistics
  const totalEmployees = allEmployees.length
  const totalShown = filteredEmployees.length
  const activeCount = allEmployees.filter(e => e.status === "active").length
  const onLeaveCount = allEmployees.filter(e => e.status === "onleave").length
  const remoteCount = allEmployees.filter(e => e.status === "remote").length
  const departmentCount = new Set(allEmployees.map(e => e.department)).size

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <Card key={i} className="border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="p-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Stats Cards - Responsive Grid */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border bg-gradient-to-r from-sky-100 to-sky-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-sky-800">Total Employees</CardTitle>
              <Users className="h-5 w-5 text-sky-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-semibold text-sky-900">{totalEmployees}</div>
                  <p className="text-sm text-sky-700">
                    {filters.department !== "all" || filters.status !== "all" || searchText
                      ? `Showing ${totalShown} of ${totalEmployees}`
                      : `${totalEmployees} total`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-r from-emerald-100 to-emerald-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-emerald-800">Active Employees</CardTitle>
              <Activity className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-semibold text-emerald-900">{activeCount}</div>
                  <p className="text-sm text-emerald-700">
                    {totalEmployees > 0 ? `${Math.round((activeCount / totalEmployees) * 100)}% of total` : "No data"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-r from-amber-100 to-amber-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-800">On Leave / Remote</CardTitle>
              <Briefcase className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-semibold text-amber-900">
                    {onLeaveCount} <span className="text-base text-amber-700">/ {remoteCount}</span>
                  </div>
                  <p className="text-sm text-amber-700">Currently on leave vs remote</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-r from-blue-100 to-blue-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800">Departments</CardTitle>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-semibold text-blue-900">{departmentCount}</div>
                  <p className="text-sm text-blue-700">Distinct departments</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toolbar / Filters - Responsive */}
      <div className="p-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center w-full lg:w-auto">
          {/* Search - Full width on mobile */}
          <div className="relative w-full md:w-40">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 w-full"
              suppressHydrationWarning
            />
          </div>

          {/* Filters - Stack on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            {/* <Filter className="h-4 w-4 text-gray-400 hidden sm:block" /> */}
            
            {/* Department Filter */}
            <Select
              value={filters.department}
              onValueChange={(value) => handleFilterChange('department', value)}
              disabled={loading}
            >
              <SelectTrigger className="w-[140px] sm:w-[180px]" suppressHydrationWarning>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
              disabled={loading}
            >
              <SelectTrigger className="w-[120px] sm:w-[140px]" suppressHydrationWarning>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(filters.department !== "all" || filters.status !== "all" || searchText) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                suppressHydrationWarning
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons - Full width on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
            onClick={exportToCSV}
            disabled={loading || filteredEmployees.length === 0}
            suppressHydrationWarning
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button 
            className="bg-sky-600 hover:bg-sky-700 w-full sm:w-auto"
            onClick={() => setAddDialogOpen(true)}
            disabled={loadingAction}
            suppressHydrationWarning
          >
            {loadingAction ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Employee
          </Button>
        </div>
      </div>

      {/* Active Filters Display - Responsive */}
      {(filters.department !== "all" || filters.status !== "all" || searchText) && (
        <div className="px-4 py-2 border-b bg-gray-50 dark:bg-gray-800/50 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active Filters:</span>
          {searchText && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              Search: &quot;{searchText}&quot;
              <button 
                className="ml-2 hover:text-purple-900"
                onClick={() => setSearchText("")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.department !== "all" && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Department: {filters.department}
              <button 
                className="ml-2 hover:text-blue-900"
                onClick={() => handleFilterChange('department', 'all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Status: {getStatusLabel(filters.status)}
              <button 
                className="ml-2 hover:text-green-900"
                onClick={() => handleFilterChange('status', 'all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Employee</TableHead>
              <TableHead className="w-[120px]">Employee ID</TableHead>
              <TableHead className="w-[150px]">Department</TableHead>
              <TableHead className="w-[180px]">Position</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[120px]">Join Date</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-12 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-12 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-12 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-12 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-12 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-12 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-12 w-32" /></TableCell>
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((employee) => (
                <TableRow key={employee._id || employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-700 shadow-sm">
                        <AvatarImage 
                          src={getAvatarUrl(employee)} 
                          alt={employee.name || employee.fullName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {(employee.name || employee.fullName || "E").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {employee.name || employee.fullName}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {employee.employeeId || `EMP${(employee._id || "").slice(-6).toUpperCase()}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getDepartmentColor(employee.department)}>
                      {employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{employee.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${getStatusColor(employee.status)} font-medium`}>
                        {getStatusLabel(employee.status)}
                      </Badge>
                      <Select
                        value={employee.status}
                        onValueChange={(value: 'active' | 'onleave' | 'remote' | 'inactive') => 
                          handleStatusChange(employee._id || employee.id || "", value)
                        }
                        disabled={loadingAction}
                      >
                        <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-transparent">
                          <ChevronDown className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {statusOptions.map(option => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value} 
                              className={`${option.color} cursor-pointer`}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => openViewDialog(employee)}
                        disabled={loadingAction}
                        title="View Details"
                        suppressHydrationWarning
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => openEditDialog(employee)}
                        disabled={loadingAction}
                        title="Edit"
                        suppressHydrationWarning
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => openDeleteDialog(employee)}
                        disabled={loadingAction}
                        title="Delete"
                        suppressHydrationWarning
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-3 text-gray-400" />
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No employees found</p>
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                      {searchText || filters.status !== "all" || filters.department !== "all" 
                        ? "Try adjusting your search or filters"
                        : "Add your first employee to get started"}
                    </p>
                    {(searchText || filters.status !== "all" || filters.department !== "all") && (
                      <Button 
                        variant="outline"
                        className="mt-4"
                        onClick={clearFilters}
                        suppressHydrationWarning
                      >
                        Clear all filters
                      </Button>
                    )}
                    {!searchText && filters.status === "all" && filters.department === "all" && (
                      <Button 
                        className="mt-4 bg-sky-600 hover:bg-sky-700"
                        onClick={() => setAddDialogOpen(true)}
                        suppressHydrationWarning
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards - Visible only on mobile */}
      <div className="md:hidden p-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 mb-3">
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : paginatedData.length > 0 ? (
          paginatedData.map((employee) => (
            <MobileEmployeeCard
              key={employee._id || employee.id}
              employee={employee}
              onView={openViewDialog}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onStatusChange={handleStatusChange}
              loadingAction={loadingAction}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No employees found</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
              {searchText || filters.status !== "all" || filters.department !== "all" 
                ? "Try adjusting your search or filters"
                : "Add your first employee to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination - Responsive */}
      {!loading && totalPages > 1 && (
        <div className="p-4 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * pageSize, filteredEmployees.length)}</span> of{" "}
              <span className="font-medium">{filteredEmployees.length}</span> results
            </div>
            <Pagination className="order-1 sm:order-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                  let pageNum = i + 1

                  if (totalPages > 3 && currentPage > 2) {
                    if (i === 0) {
                      pageNum = 1
                    } else if (i === 1) {
                      return (
                        <PaginationItem key="ellipsis-start">
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    } else {
                      pageNum = totalPages
                    }
                  }

                  return (
                    <PaginationItem key={pageNum} className="hidden sm:block">
                      <PaginationLink 
                        onClick={() => setCurrentPage(pageNum)} 
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem className="sm:hidden">
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <AddEmployeeForm 
            onSubmit={handleAddEmployee} 
            onCancel={() => setAddDialogOpen(false)}
            loading={loadingAction}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <ViewEmployeeDetails 
              employee={selectedEmployee}
              loading={loadingAction}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <EditEmployeeForm
              employee={selectedEmployee}
              onSubmit={(formData) => handleEditEmployee(selectedEmployee._id || selectedEmployee.id || "", formData)}
              onCancel={() => setEditDialogOpen(false)}
              loading={loadingAction}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold text-red-600">{selectedEmployee?.name || selectedEmployee?.fullName}</span>&apos;s record and remove all their data from the system.
              {selectedEmployee?.avatar && typeof selectedEmployee.avatar === 'object' && selectedEmployee.avatar.public_id && (
                <span className="block mt-2 text-amber-600">
                  <ImageIcon className="h-3 w-3 inline mr-1" />
                  The employee&apos;s avatar will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={loadingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEmployee} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loadingAction}
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Employee"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}