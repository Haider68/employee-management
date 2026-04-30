import React, { useState, useEffect } from 'react'
import { getAllAttendance } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Calendar, Check, X, Clock, User, Search, Filter, Download, TrendingUp, Users, CalendarDays, BarChart3, AlertTriangle } from 'lucide-react'

interface Avatar {
  public_id: string
  url: string
}

interface Employee {
  _id: string
  fullName: string
  position: string
  department: string
  email: string
  phone: string
  avatar: Avatar
  status: string
}

interface Attendance {
  _id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'present' | 'absent' | 'late' | 'half-day'
  employee: Employee
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

interface ApiResponse {
  success: boolean
  data: {
    attendance: Attendance[]
    pagination: Pagination
  }
}

interface ConfirmationModal {
  isOpen: boolean
  title: string
  description: string
  employeeName: string
  employeeId: string
  date: string
  newStatus: 'present' | 'absent' | null
  type: 'status-change' | 'check-out' | null
}

const EmployeesWithAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([])
  const [filteredData, setFilteredData] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')

  console.log("filteredData",filteredData);
  
  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    title: '',
    description: '',
    employeeName: '',
    employeeId: '',
    date: '',
    newStatus: null,
    type: null
  })

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  useEffect(() => {
    filterData()
  }, [searchTerm, statusFilter, dateFilter, attendanceData])

  const fetchAttendanceData = async () => {
    try {
      const response = await getAllAttendance({})  
      console.log("res11",response);
      const data = response as ApiResponse
      if (data.success) {
        setAttendanceData(data.data.attendance)
        setFilteredData(data.data.attendance)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let result = attendanceData

    // Search filter
    if (searchTerm) {
      result = result.filter(record =>
        record?.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record?.employee?.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record?.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(record => record.status === statusFilter)
    }

    // Date filter
    if (dateFilter === 'today') {
      const today = new Date().toDateString()
      result = result.filter(record => 
        new Date(record.date).toDateString() === today
      )
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      result = result.filter(record => 
        new Date(record.date) >= oneWeekAgo
      )
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      result = result.filter(record => 
        new Date(record.date) >= oneMonthAgo
      )
    }

    setFilteredData(result)
  }

  // Open confirmation modal for status change
  const openStatusChangeConfirmation = (
    employeeId: string, 
    employeeName: string, 
    date: string, 
    newStatus: 'present' | 'absent',
    currentStatus: string
  ) => {
    const formattedDate = formatDate(date)
    const action = newStatus === 'present' ? 'mark as Present' : 'mark as Absent'
    
    setConfirmationModal({
      isOpen: true,
      title: `Confirm Status Change`,
      description: `Are you sure you want to ${action} ${employeeName} for ${formattedDate}?`,
      employeeName,
      employeeId,
      date,
      newStatus,
      type: 'status-change'
    })
  }

  // Open confirmation modal for check-out
  const openCheckOutConfirmation = (
    employeeId: string,
    employeeName: string,
    date: string
  ) => {
    const formattedDate = formatDate(date)
    
    setConfirmationModal({
      isOpen: true,
      title: `Confirm Check-Out`,
      description: `Are you sure you want to check out ${employeeName} for ${formattedDate}?`,
      employeeName,
      employeeId,
      date,
      newStatus: null,
      type: 'check-out'
    })
  }

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      description: '',
      employeeName: '',
      employeeId: '',
      date: '',
      newStatus: null,
      type: null
    })
  }

  // Handle confirmed status change
  const handleConfirmedStatusChange = async () => {
    try {
      const { employeeId, date, newStatus } = confirmationModal
      
      if (!employeeId || !date || !newStatus) return
      
      // Call your API to update attendance
      // Example: await markAttendanceForEmployee(employeeId, date, newStatus)
      console.log(`Updating ${employeeId} to ${newStatus} on ${date}`)
      
      // For demo, update local state
      setAttendanceData(prev => prev.map(item => {
        if (item.employee._id === employeeId && 
            new Date(item.date).toDateString() === new Date(date).toDateString()) {
          return {
            ...item,
            status: newStatus,
            checkIn: newStatus === 'present' ? new Date().toISOString() : null,
            checkOut: newStatus === 'absent' ? null : item.checkOut
          }
        }
        return item
      }))
      
     
      
    } catch (error) {
      console.error('Error updating attendance:', error)
      // toast({
      //   title: "Error",
      //   description: "Failed to update attendance",
      //   variant: "destructive"
      // })
    } finally {
      closeConfirmationModal()
    }
  }

  // Handle confirmed check-out
  const handleConfirmedCheckOut = async () => {
    try {
      const { employeeId, date } = confirmationModal
      
      if (!employeeId || !date) return
      
      // Call your check-out API
      console.log(`Checking out ${employeeId} on ${date}`)
      
      // For demo, update local state
      setAttendanceData(prev => prev.map(item => {
        if (item.employee._id === employeeId && 
            new Date(item.date).toDateString() === new Date(date).toDateString()) {
          return {
            ...item,
            checkOut: new Date().toISOString()
          }
        }
        return item
      }))
      
      // Show success message
      // toast({
      //   title: "Success",
      //   description: "Employee checked out successfully",
      // })
      
    } catch (error) {
      console.error('Error checking out:', error)
      // toast({
      //   title: "Error",
      //   description: "Failed to check out",
      //   variant: "destructive"
      // })
    } finally {
      closeConfirmationModal()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A'
    const time = new Date(timeString)
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return 'N/A'
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffMs = end.getTime() - start.getTime()
    if (Number.isNaN(diffMs) || diffMs < 0) return 'N/A'

    const totalMinutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <Check className="w-3 h-3 mr-1" />
            Present
          </Badge>
        )
      case 'absent':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
            <X className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        )
      case 'late':
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            Late
          </Badge>
        )
      default:
        return <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0">{status}</Badge>
    }
  }

  const getTodayStats = () => {
    const today = new Date().toDateString()
    const todayRecords = attendanceData.filter(record => 
      new Date(record.date).toDateString() === today
    )
    
    return {
      present: todayRecords.filter(r => r.status === 'present').length,
      absent: todayRecords.filter(r => r.status === 'absent').length,
      late: todayRecords.filter(r => r.status === 'late').length,
      total: todayRecords.length
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const stats = getTodayStats()

  return (
    <div className="p-6">
      {/* Confirmation Modal */}
      <AlertDialog open={confirmationModal.isOpen} onOpenChange={closeConfirmationModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-yellow-100">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <AlertDialogTitle className="text-lg">{confirmationModal.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              {confirmationModal.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Employee:</span>
                <span className="text-sm font-semibold text-gray-800">{confirmationModal.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Date:</span>
                <span className="text-sm font-semibold text-gray-800">{formatDate(confirmationModal.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Time:</span>
                <span className="text-sm font-semibold text-gray-800">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {confirmationModal.newStatus && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">New Status:</span>
                  <span className={`text-sm font-semibold ${
                    confirmationModal.newStatus === 'present' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {confirmationModal.newStatus.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmationModal.type === 'status-change') {
                  handleConfirmedStatusChange()
                } else if (confirmationModal.type === 'check-out') {
                  handleConfirmedCheckOut()
                }
              }}
              className={`${
                confirmationModal.newStatus === 'present' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800'
                  : confirmationModal.newStatus === 'absent'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
              } text-white`}
            >
              {confirmationModal.type === 'status-change' 
                ? `Mark as ${confirmationModal.newStatus?.toUpperCase()}`
                : 'Confirm Check-Out'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600 mt-2">
              Track and manage employee attendance efficiently
            </p>
          </div>
        </div>

        {/* Statistics Cards - Gradient Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-lg">
            <CardContent className="p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">Total Present</p>
                  <p className="text-3xl font-bold mt-2">{stats.present}</p>
                  <p className="text-sm opacity-80 mt-2">Today</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-lg">
            <CardContent className="p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">On Time %</p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-sm opacity-80 mt-2">Punctuality Rate</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg">
            <CardContent className="p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">Late Arrivals</p>
                  <p className="text-3xl font-bold mt-2">{stats.late}</p>
                  <p className="text-sm opacity-80 mt-2">Today</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-lg">
            <CardContent className="p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">Total Records</p>
                  <p className="text-3xl font-bold mt-2">{attendanceData.length}</p>
                  <p className="text-sm opacity-80 mt-2">All Time</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, position, or department..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-40">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <CalendarDays className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setDateFilter('today')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Attendance Records
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} records
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Employee</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Check In</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Check Out</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Total Time</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Status</th>
                   
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => (
                  <tr 
                    key={record._id} 
                    className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-b transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                          {record?.employee?.avatar?.url ? (
                            <img
                              src={record.employee.avatar.url}
                              alt={record.employee.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{record?.employee?.fullName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">{record?.employee?.position}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {record?.employee?.department}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-gray-700 font-medium">{formatDate(record?.date)}</div>
                        <div className="text-xs text-gray-500">
                          Added: {new Date(record?.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`font-mono font-medium ${record?.checkIn ? 'text-green-600' : 'text-gray-400'}`}>
                        {formatTime(record?.checkIn)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`font-mono font-medium ${record?.checkOut ? 'text-blue-600' : 'text-gray-400'}`}>
                        {formatTime(record?.checkOut)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-medium text-gray-700">
                        {formatDuration(record?.checkIn, record?.checkOut)}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(record?.status)}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No attendance records found</h3>
              <p className="text-gray-600 mt-2">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'today' 
                  ? 'Try adjusting your filters' 
                  : 'No records available for the selected period'}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {filteredData.length} of {attendanceData.length} records
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeesWithAttendance