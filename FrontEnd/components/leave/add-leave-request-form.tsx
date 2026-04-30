"use client"

import { useState, useEffect } from "react"
import { Calendar, Calculator, Info, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, differenceInDays, isBefore, isAfter } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AddLeaveRequestFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

const LEAVE_TYPES = [
  { value: "vacation", label: "🏖️ Vacation" },
  { value: "sick", label: "🤒 Sick Leave" },
  { value: "personal", label: "👤 Personal" },
  { value: "maternity", label: "👶 Maternity Leave" },
  { value: "paternity", label: "👨‍👧 Paternity Leave" },
  { value: "bereavement", label: "🕊️ Bereavement" },
  { value: "casual", label: "😎 Casual Leave" },
  { value: "compensatory", label: "⏰ Compensatory Off" },
]

export function AddLeaveRequestForm({ onSubmit, onCancel }: AddLeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    reason: "",
    number_of_days: 0,
  })

  const [errors, setErrors] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    date_range: "",
  })

  // Calculate number of days when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      // Validate that end date is not before start date
      if (isBefore(formData.end_date, formData.start_date)) {
        setErrors(prev => ({
          ...prev,
          date_range: "End date cannot be before start date"
        }))
        setFormData(prev => ({ ...prev, number_of_days: 0 }))
        return
      }

      // Validate that start date is not in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (isBefore(formData.start_date, today)) {
        setErrors(prev => ({
          ...prev,
          date_range: "Start date cannot be in the past"
        }))
        setFormData(prev => ({ ...prev, number_of_days: 0 }))
        return
      }

      // Calculate days (inclusive of both start and end date)
      const days = differenceInDays(formData.end_date, formData.start_date) + 1
      setFormData(prev => ({ ...prev, number_of_days: days }))
      setErrors(prev => ({ ...prev, date_range: "" }))
    } else {
      setFormData(prev => ({ ...prev, number_of_days: 0 }))
    }
  }, [formData.start_date, formData.end_date])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors = {
      leave_type: !formData.leave_type ? "Leave type is required" : "",
      start_date: !formData.start_date ? "Start date is required" : "",
      end_date: !formData.end_date ? "End date is required" : "",
      reason: !formData.reason ? "Reason is required" : "",
      date_range: ""
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (isBefore(formData.end_date, formData.start_date)) {
        newErrors.date_range = "End date cannot be before start date"
      }
      if (isBefore(formData.start_date, today)) {
        newErrors.date_range = "Start date cannot be in the past"
      }
    }

    setErrors(newErrors)

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "")
    if (!hasErrors && formData.start_date && formData.end_date) {
      const submitData = {
        leave_type: formData.leave_type,
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: format(formData.end_date, 'yyyy-MM-dd'),
        reason: formData.reason,
        number_of_days: formData.number_of_days,
      }
      onSubmit(submitData)
    }
  }

  // Disable past dates in calendar
  const disabledDays = {
    before: new Date()
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Type */}
        <div className="space-y-2">
          <Label htmlFor="leave_type" className="flex items-center gap-2 text-sm font-medium">
            Leave Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.leave_type}
            onValueChange={(value) => {
              setFormData({ ...formData, leave_type: value })
              setErrors({ ...errors, leave_type: "" })
            }}
          >
            <SelectTrigger 
              id="leave_type" 
              className={cn(
                "w-full",
                errors.leave_type ? "border-red-500 ring-red-100" : ""
              )}
            >
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.leave_type && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" /> {errors.leave_type}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Leave Period <span className="text-red-500">*</span>
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-xs text-gray-500">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal relative",
                      !formData.start_date && "text-muted-foreground",
                      (errors.start_date || errors.date_range) ? "border-red-500 ring-red-100" : ""
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.start_date ? (
                      format(formData.start_date, "PPP")
                    ) : (
                      <span>Pick a start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => {
                      setFormData({ ...formData, start_date: date })
                      setErrors({ ...errors, start_date: "", date_range: "" })
                    }}
                    disabled={disabledDays}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.start_date && (
                <p className="text-xs text-red-500">{errors.start_date}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-xs text-gray-500">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal relative",
                      !formData.end_date && "text-muted-foreground",
                      (errors.end_date || errors.date_range) ? "border-red-500 ring-red-100" : ""
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.end_date ? (
                      format(formData.end_date, "PPP")
                    ) : (
                      <span>Pick an end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => {
                      setFormData({ ...formData, end_date: date })
                      setErrors({ ...errors, end_date: "", date_range: "" })
                    }}
                    disabled={formData.start_date ? { before: formData.start_date } : disabledDays}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.end_date && (
                <p className="text-xs text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Date Range Error Message */}
          {errors.date_range && (
            <div className="text-xs text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-950/30 p-2 rounded-md">
              <AlertCircle className="h-3 w-3" /> {errors.date_range}
            </div>
          )}
        </div>

        {/* Number of Days - Auto Calculated Display */}
        {formData.start_date && formData.end_date && !errors.date_range && formData.number_of_days > 0 && (
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-5 rounded-lg border border-sky-200 dark:border-sky-800 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leave Days</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-sky-700 dark:text-sky-400">
                      {formData.number_of_days}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      day{formData.number_of_days > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-gray-900 px-3 py-1.5">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
                  {format(formData.start_date, 'dd MMM')} - {format(formData.end_date, 'dd MMM yyyy')}
                </Badge>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Leave period includes both start and end date</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Progress bar for days */}
            <div className="mt-3 w-full bg-sky-100 dark:bg-sky-950/50 rounded-full h-1.5">
              <div 
                className="bg-sky-600 dark:bg-sky-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(formData.number_of_days * 5, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="reason" className="flex items-center gap-2 text-sm font-medium">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => {
              setFormData({ ...formData, reason: e.target.value })
              setErrors({ ...errors, reason: "" })
            }}
            placeholder="Please provide a detailed reason for your leave request..."
            className={cn(
              "min-h-[120px] resize-y",
              errors.reason ? "border-red-500 ring-red-100" : ""
            )}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            {errors.reason ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.reason}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Please be specific about your leave reason
              </p>
            )}
            <p className={cn(
              "text-xs",
              formData.reason.length > 400 ? "text-orange-500" : "text-gray-500"
            )}>
              {formData.reason.length}/500 characters
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-6 shadow-md hover:shadow-lg transition-all"
            disabled={
              !formData.leave_type || 
              !formData.start_date || 
              !formData.end_date || 
              !formData.reason || 
              formData.number_of_days === 0 ||
              errors.date_range !== ""
            }
          >
            Submit Leave Request
          </Button>
        </div>

        {/* Hidden input to store number_of_days in form data */}
        <input type="hidden" name="number_of_days" value={formData.number_of_days} />
      </form>
    </TooltipProvider>
  )
}