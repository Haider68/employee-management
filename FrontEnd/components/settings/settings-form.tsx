"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Lock, Upload, Camera, Loader2, CheckCircle, AlertCircle, Calendar, Phone, MapPin, Briefcase, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../context/auth"
import { 
  updateAdminProfile, 
  changePaasword as changeAdminPassword,
  updateEmployeeProfile,
  updateEmployeePassword 
} from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function SettingsForm() {
  const { toast } = useToast()
  const { user,authenticateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  console.log("user", user);
  
  const userData = user?.data?.user || user
  const isAdmin = userData?.role === "admin"
  const isEmployee = userData?.role === "employee"

  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phoneno: "",
    address: "",
    avatar: null as File | null,
    avatarPreview: "",
    ...(isEmployee && {
      birthDate: "",
      position: "",
      department: ""
    })
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Set initial form data from user
  useEffect(() => {
    if (userData) {
      setProfileForm({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phoneno: userData.phoneno || userData.phone || "",
        address: userData.address || "",
        avatar: null,
        avatarPreview: userData.avatar?.url || userData.avatar || "",
        ...(isEmployee && {
          birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : "",
          position: userData.position || "",
          department: userData.department || ""
        })
      })
    }
  }, [userData, isEmployee])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }



  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }

      setProfileForm({
        ...profileForm,
        avatar: file,
        avatarPreview: URL.createObjectURL(file)
      })
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileLoading(true)
    
    try {
      let response
      
      if (isAdmin) {
        // Admin profile update
        const formData = { ...profileForm }
        delete formData.email
        delete formData.avatar
        delete formData.avatarPreview
        
        response = await updateAdminProfile(formData)
      } else {
        // Employee profile update with avatar
        const formData = new FormData()
        
        // Add text fields
        if (profileForm.fullName) formData.append('fullName', profileForm.fullName)
        if (profileForm.phoneno) formData.append('phoneno', profileForm.phoneno)
        if (profileForm.address) formData.append('address', profileForm.address)
        if (profileForm.birthDate) formData.append('birthDate', profileForm.birthDate)
        
        // Add avatar if changed
        if (profileForm.avatar) {
          formData.append('avatar', profileForm.avatar)
        }
        
        response = await updateEmployeeProfile(formData)
      }

      if (response?.success) {
        toast({
          title: "✨ Profile updated",
          description: "Your profile has been updated successfully.",
          variant: "default"
        })
        
        // Clear avatar file after successful upload
        setProfileForm(prev => ({ ...prev, avatar: null }))
       await authenticateUser()
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "❌ Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "❌ Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: "❌ Error",
        description: "New password must be different from current password",
        variant: "destructive"
      })
      return
    }

    setIsPasswordLoading(true)

    try {
      const apiCall = isAdmin ? changeAdminPassword : updateEmployeePassword
      const response = await apiCall({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      if (response?.success) {
        toast({
          title: "🔒 Password updated",
          description: "Your password has been updated successfully.",
        })
        // Clear password fields
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="border-none shadow-lg">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-t-xl">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg py-3"
          >
            <User className="h-4 w-4" /> Profile Settings
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 rounded-lg py-3"
          >
            <Lock className="h-4 w-4" /> Password & Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <CardContent className="pt-8">
            <form onSubmit={handleProfileSubmit}>
              {/* Avatar Section - Only for Employees */}
              {isEmployee && (
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                      <AvatarImage src={profileForm.avatarPreview} alt={profileForm.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-2xl font-semibold">
                        {getInitials(profileForm.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 bg-sky-600 hover:bg-sky-700 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Click the camera icon to change your profile picture
                  </p>
                  {profileForm.avatar && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" /> New image ready to upload
                    </Badge>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-sky-600" />
                      Personal Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="mt-1.5"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            className="bg-gray-100 dark:bg-gray-800 pr-10"
                            placeholder="Email address"
                            disabled
                            readOnly
                          />
                          <Badge variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                            Read only
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <Label htmlFor="phoneno" className="text-sm font-medium">
                          Phone Number
                        </Label>
                        <div className="relative mt-1.5">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phoneno"
                            value={profileForm.phoneno}
                            onChange={(e) => setProfileForm({ ...profileForm, phoneno: e.target.value })}
                            className="pl-10"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {isEmployee && (
                        <div>
                          <Label htmlFor="birthDate" className="text-sm font-medium">
                            Birth Date
                          </Label>
                          <div className="relative mt-1.5">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="birthDate"
                              type="date"
                              value={profileForm.birthDate}
                              onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-sky-600" />
                      Address & Location
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address" className="text-sm font-medium">
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          className="mt-1.5"
                          placeholder="Enter your complete address"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Employee-only work information */}
                  {isEmployee && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-sky-600" />
                        Work Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="position" className="text-sm font-medium">
                            Position
                          </Label>
                          <div className="relative mt-1.5">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="position"
                              value={profileForm.position}
                              className="pl-10 bg-gray-100 dark:bg-gray-800"
                              placeholder="Position"
                              disabled
                              readOnly
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Only admin can update your position</p>
                        </div>

                        <div>
                          <Label htmlFor="department" className="text-sm font-medium">
                            Department
                          </Label>
                          <div className="relative mt-1.5">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="department"
                              value={profileForm.department}
                              className="pl-10 bg-gray-100 dark:bg-gray-800"
                              placeholder="Department"
                              disabled
                              readOnly
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Only admin can update your department</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    // Reset form to original values
                    if (userData) {
                      setProfileForm({
                        fullName: userData.fullName || "",
                        email: userData.email || "",
                        phoneno: userData.phoneno || userData.phone || "",
                        address: userData.address || "",
                        avatar: null,
                        avatarPreview: userData.avatar?.url || userData.avatar || "",
                        ...(isEmployee && {
                          birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : "",
                          position: userData.position || "",
                          department: userData.department || ""
                        })
                      })
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white min-w-[140px]"
                  disabled={isProfileLoading}
                >
                  {isProfileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="security">
          <CardContent className="pt-8">
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-sky-600" />
                    Change Password
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm font-medium">
                        Current Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="pr-24"
                          placeholder="Enter current password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        New Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="pr-24"
                          placeholder="Enter new password"
                          required
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="pr-24"
                          placeholder="Confirm new password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-xl">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Password Requirements
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Minimum 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Cannot be same as current password
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Use at least one uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Use at least one number
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Use at least one special character
                    </li>
                  </ul>
                  
                  <Separator className="my-4 bg-blue-200 dark:bg-blue-800" />
                  
                  <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                    <Lock className="h-4 w-4 mt-0.5" />
                    <p className="text-xs">
                      For your security, you'll be logged out from all devices after password change.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white min-w-[180px]"
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}