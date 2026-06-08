// "use client"

// import { useEffect, useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   Plus,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Download,
//   Hourglass,
//   CheckCircle2,
//   XCircleIcon,
//   RefreshCw,
//   Eye,
//   Loader2,
//   Filter,
// } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
// import { AddLeaveRequestForm } from "@/components/leave/add-leave-request-form"
// import { useToast } from "@/hooks/use-toast"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { StatCard } from "@/components/leave/stat-card"
// import { 
//   createLeaveRequest, 
//   getEmployeeLeaveRequests, 
//   getAllLeaveRequests, 
//   approveLeaveRequest, 
//   rejectLeaveRequest,
//   cancelLeaveRequest,
//   getLeaveRequest,
//   bulkProcessLeaves
// } from "@/lib/api"
//  import { LeaveRequestType } from "../types/leave"
// import { format } from "date-fns"
//  import { useAuth } from "../context/auth"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// export function LeaveManagement() {
//   const { toast } = useToast()
//   const { user } = useAuth()
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [viewOpen, setViewOpen] = useState(false)
//   const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
//   const [selectedRequest, setSelectedRequest] = useState<LeaveRequestType | null>(null)
//   const [rejectionReason, setRejectionReason] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [refreshing, setRefreshing] = useState(false)
//   const [activeTab, setActiveTab] = useState("all")
//   const [selectedRequests, setSelectedRequests] = useState<string[]>([])
//   const [bulkAction, setBulkAction] = useState<"approve" | "reject">("approve")
//   const [showFilters, setShowFilters] = useState(false)
//   const [filters, setFilters] = useState({
//     department: "",
//     status: "",
//     leave_type: "",
//     start_date: "",
//     end_date: ""
//   })
  
//   // State for leave requests
//   const [leaveRequests, setLeaveRequests] = useState<LeaveRequestType[]>([])
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     cancelled: 0
//   })

   
//   console.log("user",user);
//   const isAdmin = user?.data?.user?.role === 'admin' 



//    console.log("isAdmin",isAdmin);

//   // Fetch leave requests
//   const fetchLeaveRequests = async () => {
//     try {
//       setLoading(true)
      
//       let response
//       if (isAdmin) {
//         response = await getAllLeaveRequests(filters)
//       } else {
        
//         response = await getEmployeeLeaveRequests({
//           status: activeTab !== "all" ? activeTab : undefined
//         })
//       }
      
//       if (response.success && response.data) {
//         const requests = response.data.leaveRequests || response.data
//         setLeaveRequests(requests)
        
//         // Calculate stats
//         const total = requests.length
//         const pending = requests.filter((req: LeaveRequestType) => req.status === 'pending').length
//         const approved = requests.filter((req: LeaveRequestType) => req.status === 'approved').length
//         const rejected = requests.filter((req: LeaveRequestType) => req.status === 'rejected').length
//         const cancelled = requests.filter((req: LeaveRequestType) => req.status === 'cancelled').length
        
//         setStats({ total, pending, approved, rejected, cancelled })
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load leave requests",
//         variant: "destructive"
//       })
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }

//   // Initial fetch
//   useEffect(() => {
//     fetchLeaveRequests()
//   }, [user, filters])

//   // Apply filters
//   const applyFilters = () => {
//     setSelectedRequests([]) // Clear selections when filters change
//     fetchLeaveRequests()
//     setShowFilters(false)
//   }

//   // Clear filters
//   const clearFilters = () => {
//     setFilters({
//       department: "",
//       status: "",
//       leave_type: "",
//       start_date: "",
//       end_date: ""
//     })
//     setSelectedRequests([])
//   }

//   // Refresh data
//   const handleRefresh = () => {
//     setRefreshing(true)
//     fetchLeaveRequests()
//   }

//   // Create new leave request
//   const handleAddLeaveRequest = async (formData: any) => {
//     try {
//       const response = await createLeaveRequest(formData)
      
//       if (response.success) {
//         toast({
//           title: "Success",
//           description: "Leave request submitted successfully",
//         })
//         setDialogOpen(false)
//         fetchLeaveRequests()  
//       } else {
//         throw new Error(response.message || "Failed to submit leave request")
//       }
//     } catch (error: any) {

//        console.log("error",error);
//       toast({
//         title: "Error",
//         description: error || "Failed to submit leave request",
//         variant: "destructive"
//       })
//     }
//   }

//   // Approve leave request
//   const handleApproveRequest = async (id: string) => {
//     try {
//       const response = await approveLeaveRequest(id)
      
//       if (response.success) {
//         toast({
//           title: "Success",
//           description: "Leave request approved successfully",
//         })
//         fetchLeaveRequests()
//         setViewOpen(false)
//         setSelectedRequests(prev => prev.filter(reqId => reqId !== id))
//       } else {
//         throw new Error(response.message || "Failed to approve leave request")
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error || "Failed to approve leave request",
//         variant: "destructive"
//       })
//     }
//   }

//   // Reject leave request with reason
//   const handleRejectWithReason = async () => {
//     if (!selectedRequest || !rejectionReason.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter rejection reason",
//         variant: "destructive"
//       })
//       return
//     }

//     try {
//       const response = await rejectLeaveRequest(selectedRequest._id, rejectionReason)
      
//       if (response.success) {
//         toast({
//           title: "Success",
//           description: "Leave request rejected successfully",
//         })
//         fetchLeaveRequests()
//         setViewOpen(false)
//         setRejectDialogOpen(false)
//         setRejectionReason("")
//         setSelectedRequests(prev => prev.filter(reqId => reqId !== selectedRequest._id))
//       } else {
//         throw new Error(response.message || "Failed to reject leave request")
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error || "Failed to reject leave request",
//         variant: "destructive"
//       })
//     }
//   }

//   // Cancel leave request
//   const handleCancelRequest = async (id: string) => {
//     try {
//       const response = await cancelLeaveRequest(id)
      
//       if (response.success) {
//         toast({
//           title: "Success",
//           description: "Leave request cancelled successfully",
//         })
//         fetchLeaveRequests()
//       } else {
//         throw new Error(response.message || "Failed to cancel leave request")
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error || "Failed to cancel leave request",
//         variant: "destructive"
//       })
//     }
//   }

//   // View leave request details
//   const handleViewRequest = async (id: string) => {
//     try {
//       const response = await getLeaveRequest(id)
      
//       if (response.success && response.data) {
//         setSelectedRequest(response.data)
//         setViewOpen(true)
//       } else {
//         throw new Error("Failed to load leave request details")
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error || "Failed to load leave request details",
//         variant: "destructive"
//       })
//     }
//   }

//   // Handle bulk selection
//   const handleSelectRequest = (id: string) => {
//     setSelectedRequests(prev => 
//       prev.includes(id) 
//         ? prev.filter(reqId => reqId !== id)
//         : [...prev, id]
//     )
//   }

//   // Handle select all
//   const handleSelectAll = () => {
//     if (selectedRequests.length === filteredRequests.length) {
//       setSelectedRequests([])
//     } else {
//       setSelectedRequests(filteredRequests.map(req => req._id))
//     }
//   }

//   // Bulk approve/reject
//   const handleBulkAction = async () => {
//     if (selectedRequests.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please select at least one leave request",
//         variant: "destructive"
//       })
//       return
//     }

//     if (bulkAction === "reject" && !rejectionReason.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter rejection reason for bulk reject",
//         variant: "destructive"
//       })
//       return
//     }

//     try {
//       if (bulkAction === "approve") {
//         // Approve all selected
//         for (const id of selectedRequests) {
//           await approveLeaveRequest(id)
//         }
//         toast({
//           title: "Success",
//           description: `${selectedRequests.length} leave requests approved successfully`,
//         })
//       } else {
//         // Reject all selected
//         await bulkProcessLeaves(selectedRequests, "reject", rejectionReason)
//         toast({
//           title: "Success",
//           description: `${selectedRequests.length} leave requests rejected successfully`,
//         })
//         setRejectionReason("")
//       }
      
//       fetchLeaveRequests()
//       setSelectedRequests([])
//     } catch (error: any) {
//       console.log("error12",error);
//       toast({
//         title: "Error",
//         description: error || `Failed to ${bulkAction} leave requests`,
//         variant: "destructive"
//       })
//     }
//   }

//   // Export to CSV
//   const exportToCSV = () => {
//     const headers = ["Employee Name", "Employee ID", "Leave Type", "Start Date", "End Date", "Days", "Reason", "Status", "Applied Date"]
    
//     const csvContent = [
//       headers.join(","),
//       ...leaveRequests.map((request) => {
//         const employeeName = request.employee 
//           ? `${request.employee.firstName} ${request.employee.lastName}`
//           : "Unknown"
          
//         const employeeId = request.employee?.employeeId || "N/A"
        
//         return [
//           `"${employeeName}"`,
//           employeeId,
//           request.leave_type,
//           format(new Date(request.start_date), 'yyyy-MM-dd'),
//           format(new Date(request.end_date), 'yyyy-MM-dd'),
//           request.number_of_days,
//           `"${request.reason.replace(/"/g, '""')}"`,
//           request.status,
//           format(new Date(request.createdAt), 'yyyy-MM-dd')
//         ].join(",")
//       }),
//     ].join("\n")

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement("a")
//     link.setAttribute("href", url)
//     link.setAttribute("download", `leave_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`)
//     link.style.visibility = "hidden"
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     toast({
//       title: "Export Successful",
//       description: `${leaveRequests.length} leave requests exported to CSV.`,
//     })
//   }

//   // Status badge renderer
//   const renderStatusBadge = (status: string) => {
//     const statusConfig = {
//       pending: { 
//         label: "Pending", 
//         icon: <AlertCircle className="h-3 w-3 mr-1" />,
//         className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
//       },
//       approved: { 
//         label: "Approved", 
//         icon: <CheckCircle className="h-3 w-3 mr-1" />,
//         className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
//       },
//       rejected: { 
//         label: "Rejected", 
//         icon: <XCircle className="h-3 w-3 mr-1" />,
//         className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
//       },
//       cancelled: { 
//         label: "Cancelled", 
//         icon: <XCircle className="h-3 w-3 mr-1" />,
//         className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
//       }
//     }

//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

//     return (
//       <Badge variant="outline" className={`flex items-center text-xs ${config.className}`}>
//         {config.icon} {config.label}
//       </Badge>
//     )
//   }

//   // Leave type badge renderer
//   const renderLeaveTypeBadge = (leaveType: string) => {
//     const typeConfig: Record<string, { className: string; label: string }> = {
//       vacation: { 
//         className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
//         label: "Vacation"
//       },
//       sick: { 
//         className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
//         label: "Sick Leave"
//       },
//       personal: { 
//         className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
//         label: "Personal"
//       },
//       maternity: { 
//         className: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
//         label: "Maternity"
//       },
//       paternity: { 
//         className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
//         label: "Paternity"
//       },
//       bereavement: { 
//         className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
//         label: "Bereavement"
//       },
//       casual: { 
//         className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
//         label: "Casual"
//       },
//       compensatory: { 
//         className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
//         label: "Compensatory"
//       }
//     }

//     const config = typeConfig[leaveType] || { 
//       className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
//       label: leaveType
//     }

//     return (
//       <Badge variant="outline" className={`text-xs ${config.className}`}>
//         {config.label}
//       </Badge>
//     )
//   }

//   // Filter requests based on active tab
//   const filteredRequests = leaveRequests.filter(request => {
//     if (activeTab === "all") return true
//     if (activeTab === "pending") return request.status === "pending"
//     if (activeTab === "approved") return request.status === "approved"
//     if (activeTab === "rejected") return request.status === "rejected"
//     if (activeTab === "cancelled") return request.status === "cancelled"
//     return true
//   })

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <Card className="p-4 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <Calendar className="h-5 w-5 text-sky-600" />
//           <h3 className="text-lg font-medium">Leave Management</h3>
//           {isAdmin && (
//             <Badge variant="outline" className="ml-2">
//               Admin View
//             </Badge>
//           )}
//         </div>
//         <div className="flex gap-2">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={handleRefresh}
//                   disabled={refreshing}
//                 >
//                   {refreshing ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <RefreshCw className="h-4 w-4" />
//                   )}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Refresh data</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>

//           {isAdmin && (
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className="flex items-center gap-2"
//                     onClick={() => setShowFilters(!showFilters)}
//                   >
//                     <Filter className="h-4 w-4" />
//                     <span className="hidden sm:inline">Filters</span>
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Filter leave requests</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           )}

//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-2"
//                   onClick={exportToCSV}
//                   disabled={leaveRequests.length === 0}
//                 >
//                   <Download className="h-4 w-4" />
//                   <span className="hidden sm:inline">Export</span>
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Export leave requests to CSV</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>

//           {
//             isAdmin ? "" :  <Button 
//             className="bg-sky-600 hover:bg-sky-700" 
//             onClick={() => setDialogOpen(true)}
//           >
//             <Plus className="h-4 w-4 mr-2" /> Apply for Leave
//           </Button>
//           }
//         </div>
//       </Card>

//       {/* Admin Filters */}
//       {isAdmin && showFilters && (
//         <Card className="p-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <Label htmlFor="department">Department</Label>
//               <Input
//                 id="department"
//                 placeholder="e.g., Engineering"
//                 value={filters.department}
//                 onChange={(e) => setFilters({...filters, department: e.target.value})}
//               />
//             </div>
//             <div>
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={filters.status}
//                 onValueChange={(value) => setFilters({...filters, status: value})}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="approved">Approved</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                   <SelectItem value="cancelled">Cancelled</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="leave_type">Leave Type</Label>
//               <Select
//                 value={filters.leave_type}
//                 onValueChange={(value) => setFilters({...filters, leave_type: value})}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="vacation">Vacation</SelectItem>
//                   <SelectItem value="sick">Sick Leave</SelectItem>
//                   <SelectItem value="personal">Personal</SelectItem>
//                   <SelectItem value="casual">Casual</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="start_date">From Date</Label>
//               <Input
//                 id="start_date"
//                 type="date"
//                 value={filters.start_date}
//                 onChange={(e) => setFilters({...filters, start_date: e.target.value})}
//               />
//             </div>
//             <div>
//               <Label htmlFor="end_date">To Date</Label>
//               <Input
//                 id="end_date"
//                 type="date"
//                 value={filters.end_date}
//                 onChange={(e) => setFilters({...filters, end_date: e.target.value})}
//               />
//             </div>
//           </div>
//           <div className="flex justify-end gap-2 mt-4">
//             <Button variant="outline" onClick={clearFilters}>
//               Clear Filters
//             </Button>
//             <Button onClick={applyFilters}>
//               Apply Filters
//             </Button>
//           </div>
//         </Card>
//       )}

//       {/* Admin Bulk Actions */}
//       {isAdmin && selectedRequests.length > 0 && (
//         <Card className="p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Badge variant="secondary">
//                 {selectedRequests.length} selected
//               </Badge>
//               <span className="text-sm text-muted-foreground">
//                 Select action for selected requests
//               </span>
//             </div>
//             <div className="flex gap-2">
//               <Select
//                 value={bulkAction}
//                 onValueChange={(value: "approve" | "reject") => setBulkAction(value)}
//               >
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="approve">Approve</SelectItem>
//                   <SelectItem value="reject">Reject</SelectItem>
//                 </SelectContent>
//               </Select>
//               {bulkAction === "reject" && (
//                 <Input
//                   placeholder="Rejection reason"
//                   value={rejectionReason}
//                   onChange={(e) => setRejectionReason(e.target.value)}
//                   className="w-48"
//                 />
//               )}
//               <Button 
//                 onClick={handleBulkAction}
//                 variant={bulkAction === "approve" ? "default" : "destructive"}
//               >
//                 {bulkAction === "approve" ? "Approve Selected" : "Reject Selected"}
//               </Button>
//               <Button variant="outline" onClick={() => setSelectedRequests([])}>
//                 Clear
//               </Button>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard
//           title="Total Requests"
//           value={stats.total}
//           gradientFrom="from-sky-600"
//           gradientTo="to-cyan-500"
//           icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
//           subtext="All submitted requests"
//         />
//         <StatCard
//           title="Pending"
//           value={stats.pending}
//           gradientFrom="from-sky-700"
//           gradientTo="to-sky-500"
//           icon={<Hourglass className="h-5 w-5" aria-hidden="true" />}
//           subtext="Awaiting review"
//         />
//         <StatCard
//           title="Approved"
//           value={stats.approved}
//           gradientFrom="from-green-600"
//           gradientTo="to-emerald-500"
//           icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
//           subtext="Approved requests"
//         />
//         <StatCard
//           title="Rejected"
//           value={stats.rejected}
//           gradientFrom="from-red-600"
//           gradientTo="to-red-500"
//           icon={<XCircleIcon className="h-5 w-5" aria-hidden="true" />}
//           subtext="Rejected requests"
//         />
//       </div>

//       {/* Tabs with Leave Requests */}
//       <Card>
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="w-full border-b rounded-none justify-start">
//             <TabsTrigger value="all" className="flex items-center gap-2">
//               All Requests
//               <Badge variant="secondary" className="rounded-full">
//                 {stats.total}
//               </Badge>
//             </TabsTrigger>
//             <TabsTrigger value="pending" className="flex items-center gap-2">
//               Pending
//               <Badge variant="secondary" className="rounded-full">
//                 {stats.pending}
//               </Badge>
//             </TabsTrigger>
//             <TabsTrigger value="approved" className="flex items-center gap-2">
//               Approved
//               <Badge variant="secondary" className="rounded-full">
//                 {stats.approved}
//               </Badge>
//             </TabsTrigger>
//             <TabsTrigger value="rejected" className="flex items-center gap-2">
//               Rejected
//               <Badge variant="secondary" className="rounded-full">
//                 {stats.rejected}
//               </Badge>
//             </TabsTrigger>
//             {isAdmin && (
//               <TabsTrigger value="cancelled" className="flex items-center gap-2">
//                 Cancelled
//                 <Badge variant="secondary" className="rounded-full">
//                   {stats.cancelled}
//                 </Badge>
//               </TabsTrigger>
//             )}
//           </TabsList>

//           {loading ? (
//             <div className="p-8 text-center">
//               <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
//               <p className="mt-2 text-sm text-muted-foreground">Loading leave requests...</p>
//             </div>
//           ) : filteredRequests.length === 0 ? (
//             <div className="p-8 text-center">
//               <Calendar className="h-12 w-12 mx-auto text-gray-400" />
//               <p className="mt-2 text-sm text-muted-foreground">
//                 No {activeTab === 'all' ? '' : activeTab} leave requests found
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     {isAdmin && (
//                       <TableHead className="w-12">
//                         <input
//                           type="checkbox"
//                           checked={selectedRequests.length === filteredRequests.length}
//                           onChange={handleSelectAll}
//                           className="h-4 w-4"
//                         />
//                       </TableHead>
//                     )}
//                     {isAdmin && <TableHead>Employee</TableHead>}
//                     <TableHead>Leave Type</TableHead>
//                     <TableHead>Start Date</TableHead>
//                     <TableHead>End Date</TableHead>
//                     <TableHead>Days</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Applied Date</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredRequests.map((request) => (
//                     <TableRow key={request._id}>
//                       {isAdmin && (
//                         <TableCell>
//                           <input
//                             type="checkbox"
//                             checked={selectedRequests.includes(request._id)}
//                             onChange={() => handleSelectRequest(request._id)}
//                             className="h-4 w-4"
//                           />
//                         </TableCell>
//                       )}
//                       {isAdmin && (
//                         <TableCell>
//                           {request.employee ? (
//                             <div>
//                               <div className="font-medium">
//                                 {request.employee.firstName} {request.employee.lastName}
//                               </div>
//                               <div className="text-xs text-muted-foreground">
//                                 {request.employee.employeeId} • {request.employee.department}
//                               </div>
//                             </div>
//                           ) : (
//                             "Unknown"
//                           )}
//                         </TableCell>
//                       )}
//                       <TableCell>
//                         {renderLeaveTypeBadge(request.leave_type)}
//                       </TableCell>
//                       <TableCell>
//                         {format(new Date(request.start_date), 'dd MMM yyyy')}
//                       </TableCell>
//                       <TableCell>
//                         {format(new Date(request.end_date), 'dd MMM yyyy')}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="outline">
//                           {request.number_of_days} day{request.number_of_days > 1 ? 's' : ''}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         {renderStatusBadge(request.status)}
//                       </TableCell>
//                       <TableCell>
//                         {format(new Date(request.createdAt), 'dd MMM yyyy')}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex gap-2">
//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   className="h-8 w-8"
//                                   onClick={() => handleViewRequest(request._id)}
//                                 >
//                                   <Eye className="h-4 w-4" />
//                                 </Button>
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 <p>View details</p>
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>

//                           {isAdmin && request.status === 'pending' && (
//                             <>
//                               <TooltipProvider>
//                                 <Tooltip>
//                                   <TooltipTrigger asChild>
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       className="h-8 w-8 text-green-600 hover:text-green-700"
//                                       onClick={() => handleApproveRequest(request._id)}
//                                     >
//                                       <CheckCircle className="h-4 w-4" />
//                                     </Button>
//                                   </TooltipTrigger>
//                                   <TooltipContent>
//                                     <p>Approve</p>
//                                   </TooltipContent>
//                                 </Tooltip>
//                               </TooltipProvider>

//                               <TooltipProvider>
//                                 <Tooltip>
//                                   <TooltipTrigger asChild>
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       className="h-8 w-8 text-red-600 hover:text-red-700"
//                                       onClick={() => {
//                                         setSelectedRequest(request)
//                                         setRejectDialogOpen(true)
//                                       }}
//                                     >
//                                       <XCircle className="h-4 w-4" />
//                                     </Button>
//                                   </TooltipTrigger>
//                                   <TooltipContent>
//                                     <p>Reject</p>
//                                   </TooltipContent>
//                                 </Tooltip>
//                               </TooltipProvider>
//                             </>
//                           )}

//                           {!isAdmin && ['pending', 'approved'].includes(request.status) && (
//                             <TooltipProvider>
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8 text-red-600 hover:text-red-700"
//                                     onClick={() => handleCancelRequest(request._id)}
//                                     disabled={new Date(request.start_date) <= new Date()}
//                                   >
//                                     <XCircle className="h-4 w-4" />
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>
//                                   <p>
//                                     {new Date(request.start_date) <= new Date() 
//                                       ? "Cannot cancel started leave" 
//                                       : "Cancel leave"}
//                                   </p>
//                                 </TooltipContent>
//                               </Tooltip>
//                             </TooltipProvider>
//                           )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </Tabs>
//       </Card>

//       {/* Apply for Leave Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="sm:max-w-[600px]">
//           <DialogHeader>
//             <DialogTitle>Apply for Leave</DialogTitle>
//           </DialogHeader>
//           <AddLeaveRequestForm 
//             onSubmit={handleAddLeaveRequest} 
//             onCancel={() => setDialogOpen(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* View Leave Request Dialog */}
//       <Dialog open={viewOpen} onOpenChange={setViewOpen}>
//         <DialogContent className="sm:max-w-[520px]">
//           <DialogHeader>
//             <DialogTitle>Leave Request Details</DialogTitle>
//           </DialogHeader>
//           {selectedRequest ? (
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 {isAdmin && (
//                   <>
//                     <div>
//                       <p className="text-sm font-medium text-muted-foreground">Employee</p>
//                       <p className="text-base">
//                         {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {selectedRequest.employee?.employeeId} • {selectedRequest.employee?.department}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-muted-foreground">Employee Email</p>
//                       <p className="text-base">{selectedRequest.employee?.email || "N/A"}</p>
//                     </div>
//                   </>
//                 )}
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
//                   <div className="mt-1">{renderLeaveTypeBadge(selectedRequest.leave_type)}</div>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Status</p>
//                   <div className="mt-1">{renderStatusBadge(selectedRequest.status)}</div>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Start Date</p>
//                   <p className="text-base">
//                     {format(new Date(selectedRequest.start_date), 'dd MMM yyyy')}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">End Date</p>
//                   <p className="text-base">
//                     {format(new Date(selectedRequest.end_date), 'dd MMM yyyy')}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Number of Days</p>
//                   <p className="text-base">{selectedRequest.number_of_days}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
//                   <p className="text-base">
//                     {format(new Date(selectedRequest.createdAt), 'dd MMM yyyy')}
//                   </p>
//                 </div>
//                 {selectedRequest.approved_by && (
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">Approved By</p>
//                     <p className="text-base">
//                       {selectedRequest.approved_by.firstName} {selectedRequest.approved_by.lastName}
//                     </p>
//                   </div>
//                 )}
//                 {selectedRequest.approved_at && (
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">Approved At</p>
//                     <p className="text-base">
//                       {format(new Date(selectedRequest.approved_at), 'dd MMM yyyy, hh:mm a')}
//                     </p>
//                   </div>
//                 )}
//                 {selectedRequest.rejection_reason && (
//                   <div className="col-span-2">
//                     <p className="text-sm font-medium text-muted-foreground">Rejection Reason</p>
//                     <p className="text-base">{selectedRequest.rejection_reason}</p>
//                   </div>
//                 )}
//               </div>
              
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Reason</p>
//                 <p className="text-base mt-1 p-3 bg-gray-50 rounded-md">
//                   {selectedRequest.reason}
//                 </p>
//               </div>

//               <div className="flex justify-end gap-2 pt-4">
//                 {selectedRequest.status === 'pending' && isAdmin ? (
//                   <>
//                     <Button
//                       variant="outline"
//                       className="text-red-600"
//                       onClick={() => {
//                         setRejectDialogOpen(true)
//                       }}
//                     >
//                       Reject
//                     </Button>
//                     <Button
//                       className="bg-green-600 hover:bg-green-700"
//                       onClick={() => handleApproveRequest(selectedRequest._id)}
//                     >
//                       Approve
//                     </Button>
//                   </>
//                 ) : (
//                   <Button onClick={() => setViewOpen(false)}>Close</Button>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center p-4">
//               <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
//               <p className="mt-2 text-sm text-muted-foreground">Loading details...</p>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Reject Reason Dialog */}
//       <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
//         <DialogContent className="sm:max-w-[400px]">
//           <DialogHeader>
//             <DialogTitle>Reject Leave Request</DialogTitle>
//             <DialogDescription>
//               Please provide a reason for rejecting this leave request.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="rejectionReason">Rejection Reason</Label>
//               <Textarea
//                 id="rejectionReason"
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 placeholder="Enter reason for rejection..."
//                 rows={3}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => {
//                 setRejectDialogOpen(false)
//                 setRejectionReason("")
//               }}>
//                 Cancel
//               </Button>
//               <Button 
//                 variant="destructive" 
//                 onClick={handleRejectWithReason}
//                 disabled={!rejectionReason.trim()}
//               >
//                 Reject
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }










"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Hourglass,
  CheckCircle2,
  XCircleIcon,
  RefreshCw,
  Eye,
  Loader2,
  Filter,
  CalendarRange,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AddLeaveRequestForm } from "@/components/leave/add-leave-request-form"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatCard } from "@/components/leave/stat-card"
import { 
  createLeaveRequest, 
  getEmployeeLeaveRequests, 
  getAllLeaveRequests, 
  approveLeaveRequest, 
  rejectLeaveRequest,
  cancelLeaveRequest,
  getLeaveRequest,
  bulkProcessLeaves,
  getApiErrorMessage,
} from "@/lib/api"
import {
  formatLeaveDate,
  normalizeLeaveList,
  normalizeLeaveRequest,
} from "@/lib/leave-utils"
import { LeaveRequestType } from "../types/leave"
import { format } from "date-fns"
import { useAuth } from "../context/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LeaveManagement() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestType | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<"approve" | "reject">("approve")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    leave_type: "",
    start_date: "",
    end_date: ""
  })
  
  // State for leave requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestType[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  })

  console.log("user", user);
  const isAdmin = user?.data?.user?.role === 'admin'

  console.log("isAdmin", isAdmin);

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      
      let response
      if (isAdmin) {
        response = await getAllLeaveRequests(filters)
      } else {
        response = await getEmployeeLeaveRequests({
          status: activeTab !== "all" ? activeTab : undefined
        })
      }
      
      if (response.success && response.data) {
        const requests = normalizeLeaveList(
          response.data.leaveRequests ?? response.data
        )
        
        // Apply date range filter if both dates are selected
        let filteredRequests = requests
        if (filters.start_date && filters.end_date) {
          const startDate = new Date(filters.start_date)
          const endDate = new Date(filters.end_date)
          endDate.setHours(23, 59, 59, 999) // Include the entire end date
          
          filteredRequests = requests.filter((req: LeaveRequestType) => {
            const requestDate = new Date(req.createdAt)
            return requestDate >= startDate && requestDate <= endDate
          })
        }
        
        setLeaveRequests(filteredRequests)
        
        // Calculate stats from filtered requests
        const total = filteredRequests.length
        const pending = filteredRequests.filter((req: LeaveRequestType) => req.status === 'pending').length
        const approved = filteredRequests.filter((req: LeaveRequestType) => req.status === 'approved').length
        const rejected = filteredRequests.filter((req: LeaveRequestType) => req.status === 'rejected').length
        const cancelled = filteredRequests.filter((req: LeaveRequestType) => req.status === 'cancelled').length
        
        setStats({ total, pending, approved, rejected, cancelled })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leave requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchLeaveRequests()
  }, [user, filters])

  // Apply filters
  const applyFilters = () => {
    setSelectedRequests([]) // Clear selections when filters change
    fetchLeaveRequests()
    setShowFilters(false)
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      department: "",
      status: "",
      leave_type: "",
      start_date: "",
      end_date: ""
    })
    setSelectedRequests([])
  }

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true)
    fetchLeaveRequests()
  }

  // Create new leave request
  const handleAddLeaveRequest = async (formData: any) => {
    try {
      const response = await createLeaveRequest(formData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Leave request submitted successfully",
        })
        setDialogOpen(false)
        fetchLeaveRequests()  
      } else {
        throw new Error(response.message || "Failed to submit leave request")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to submit leave request"),
        variant: "destructive"
      })
    }
  }

  // Approve leave request
  const handleApproveRequest = async (id: string) => {
    try {
      const response = await approveLeaveRequest(id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Leave request approved successfully",
        })
        fetchLeaveRequests()
        setViewOpen(false)
        setSelectedRequests(prev => prev.filter(reqId => reqId !== id))
      } else {
        throw new Error(response.message || "Failed to approve leave request")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to approve leave request"),
        variant: "destructive"
      })
    }
  }

  // Reject leave request with reason
  const handleRejectWithReason = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter rejection reason",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await rejectLeaveRequest(selectedRequest._id, rejectionReason)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Leave request rejected successfully",
        })
        fetchLeaveRequests()
        setViewOpen(false)
        setRejectDialogOpen(false)
        setRejectionReason("")
        setSelectedRequests(prev => prev.filter(reqId => reqId !== selectedRequest._id))
      } else {
        throw new Error(response.message || "Failed to reject leave request")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to reject leave request"),
        variant: "destructive"
      })
    }
  }

  // Cancel leave request
  const handleCancelRequest = async (id: string) => {
    try {
      const response = await cancelLeaveRequest(id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Leave request cancelled successfully",
        })
        fetchLeaveRequests()
      } else {
        throw new Error(response.message || "Failed to cancel leave request")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to cancel leave request"),
        variant: "destructive"
      })
    }
  }

  // View leave request details
  const handleViewRequest = async (id: string) => {
    try {
      const response = await getLeaveRequest(id)
      
      if (response.success && response.data) {
        setSelectedRequest(
          normalizeLeaveRequest(response.data as Record<string, unknown>)
        )
        setViewOpen(true)
      } else {
        throw new Error("Failed to load leave request details")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to load leave request details"),
        variant: "destructive"
      })
    }
  }

  // Handle bulk selection
  const handleSelectRequest = (id: string) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(reqId => reqId !== id)
        : [...prev, id]
    )
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(filteredRequests.map(req => req._id))
    }
  }

  // Bulk approve/reject
  const handleBulkAction = async () => {
    if (selectedRequests.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one leave request",
        variant: "destructive"
      })
      return
    }

    if (bulkAction === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter rejection reason for bulk reject",
        variant: "destructive"
      })
      return
    }

    try {
      if (bulkAction === "approve") {
        // Approve all selected
        for (const id of selectedRequests) {
          await approveLeaveRequest(id)
        }
        toast({
          title: "Success",
          description: `${selectedRequests.length} leave requests approved successfully`,
        })
      } else {
        // Reject all selected
        await bulkProcessLeaves(selectedRequests, "reject", rejectionReason)
        toast({
          title: "Success",
          description: `${selectedRequests.length} leave requests rejected successfully`,
        })
        setRejectionReason("")
      }
      
      fetchLeaveRequests()
      setSelectedRequests([])
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, `Failed to ${bulkAction} leave requests`),
        variant: "destructive"
      })
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Employee Name", "Employee ID", "Leave Type", "Start Date", "End Date", "Days", "Reason", "Status", "Applied Date"]
    
    const csvContent = [
      headers.join(","),
      ...leaveRequests.map((request) => {
        const employeeName = request.employee 
          ? `${request.employee.firstName} ${request.employee.lastName}`
          : "Unknown"
          
        const employeeId = request.employee?.employeeId || "N/A"
        
        return [
          `"${employeeName}"`,
          employeeId,
          request.leave_type,
          formatLeaveDate(request.start_date, 'yyyy-MM-dd'),
          formatLeaveDate(request.end_date, 'yyyy-MM-dd'),
          request.number_of_days,
          `"${request.reason.replace(/"/g, '""')}"`,
          request.status,
          formatLeaveDate(request.createdAt, 'yyyy-MM-dd')
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `leave_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Export Successful",
      description: `${leaveRequests.length} leave requests exported to CSV.`,
    })
  }

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: "Pending", 
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      },
      approved: { 
        label: "Approved", 
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      },
      rejected: { 
        label: "Rejected", 
        icon: <XCircle className="h-3 w-3 mr-1" />,
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      },
      cancelled: { 
        label: "Cancelled", 
        icon: <XCircle className="h-3 w-3 mr-1" />,
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge variant="outline" className={`flex items-center text-xs ${config.className}`}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  // Leave type badge renderer
  const renderLeaveTypeBadge = (leaveType: string) => {
    const typeConfig: Record<string, { className: string; label: string }> = {
      vacation: { 
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Vacation"
      },
      sick: { 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        label: "Sick Leave"
      },
      personal: { 
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        label: "Personal"
      },
      maternity: { 
        className: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
        label: "Maternity"
      },
      paternity: { 
        className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        label: "Paternity"
      },
      bereavement: { 
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        label: "Bereavement"
      },
      casual: { 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        label: "Casual"
      },
      compensatory: { 
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        label: "Compensatory"
      }
    }

    const config = typeConfig[leaveType] || { 
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      label: leaveType
    }

    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  // Filter requests based on active tab
  const filteredRequests = leaveRequests.filter(request => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return request.status === "pending"
    if (activeTab === "approved") return request.status === "approved"
    if (activeTab === "rejected") return request.status === "rejected"
    if (activeTab === "cancelled") return request.status === "cancelled"
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sky-600" />
          <h3 className="text-lg font-medium">Leave Management</h3>
          {isAdmin && (
            <Badge variant="outline" className="ml-2">
              Admin View
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter leave requests</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={exportToCSV}
                  disabled={leaveRequests.length === 0}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export leave requests to CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {
            isAdmin ? "" :  <Button 
            className="bg-sky-600 hover:bg-sky-700" 
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Apply for Leave
          </Button>
          }
        </div>
      </Card>

      {/* Admin Filters */}
      {isAdmin && showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="leave_type">Leave Type</Label>
              <Select
                value={filters.leave_type}
                onValueChange={(value) => setFilters({...filters, leave_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="start_date" className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" /> From Date
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => {
                        setFilters({...filters, start_date: e.target.value})
                        // Auto-apply filter when both dates are selected
                        if (e.target.value && filters.end_date) {
                          setTimeout(() => applyFilters(), 100)
                        }
                      }}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="end_date" className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" /> To Date
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => {
                        setFilters({...filters, end_date: e.target.value})
                        // Auto-apply filter when both dates are selected
                        if (filters.start_date && e.target.value) {
                          setTimeout(() => applyFilters(), 100)
                        }
                      }}
                      className="mt-1.5"
                      min={filters.start_date}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Admin Bulk Actions */}
      {isAdmin && selectedRequests.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedRequests.length} selected
              </Badge>
              <span className="text-sm text-muted-foreground">
                Select action for selected requests
              </span>
            </div>
            <div className="flex gap-2">
              <Select
                value={bulkAction}
                onValueChange={(value: "approve" | "reject") => setBulkAction(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              {bulkAction === "reject" && (
                <Input
                  placeholder="Rejection reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-48"
                />
              )}
              <Button 
                onClick={handleBulkAction}
                variant={bulkAction === "approve" ? "default" : "destructive"}
              >
                {bulkAction === "approve" ? "Approve Selected" : "Reject Selected"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedRequests([])}>
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          gradientFrom="from-sky-600"
          gradientTo="to-cyan-500"
          icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          subtext="All submitted requests"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          gradientFrom="from-sky-700"
          gradientTo="to-sky-500"
          icon={<Hourglass className="h-5 w-5" aria-hidden="true" />}
          subtext="Awaiting review"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          gradientFrom="from-green-600"
          gradientTo="to-emerald-500"
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          subtext="Approved requests"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          gradientFrom="from-red-600"
          gradientTo="to-red-500"
          icon={<XCircleIcon className="h-5 w-5" aria-hidden="true" />}
          subtext="Rejected requests"
        />
      </div>

      {/* Tabs with Leave Requests */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full border-b rounded-none justify-start">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Requests
              <Badge variant="secondary" className="rounded-full">
                {stats.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <Badge variant="secondary" className="rounded-full">
                {stats.pending}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              Approved
              <Badge variant="secondary" className="rounded-full">
                {stats.approved}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              Rejected
              <Badge variant="secondary" className="rounded-full">
                {stats.rejected}
              </Badge>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                Cancelled
                <Badge variant="secondary" className="rounded-full">
                  {stats.cancelled}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
              <p className="mt-2 text-sm text-muted-foreground">Loading leave requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-muted-foreground">
                {filters.start_date && filters.end_date ? (
                  <>
                    No leave requests found from {formatLeaveDate(filters.start_date, 'dd MMM yyyy')} to {formatLeaveDate(filters.end_date, 'dd MMM yyyy')}
                  </>
                ) : (
                  `No ${activeTab === 'all' ? '' : activeTab} leave requests found`
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && (
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedRequests.length === filteredRequests.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4"
                        />
                      </TableHead>
                    )}
                    {isAdmin && <TableHead>Employee</TableHead>}
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      {isAdmin && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request._id)}
                            onChange={() => handleSelectRequest(request._id)}
                            className="h-4 w-4"
                          />
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          {request.employee ? (
                            <div>
                              <div className="font-medium">
                                {request.employee.firstName} {request.employee.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {request.employee.employeeId} • {request.employee.department}
                              </div>
                            </div>
                          ) : (
                            "Unknown"
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {renderLeaveTypeBadge(request.leave_type)}
                      </TableCell>
                      <TableCell>
                        {formatLeaveDate(request.start_date, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {formatLeaveDate(request.end_date, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.number_of_days} day{request.number_of_days > 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {formatLeaveDate(request.createdAt, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewRequest(request._id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {isAdmin && request.status === 'pending' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:text-green-700"
                                      onClick={() => handleApproveRequest(request._id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Approve</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700"
                                      onClick={() => {
                                        setSelectedRequest(request)
                                        setRejectDialogOpen(true)
                                      }}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Reject</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}

                          {!isAdmin && ['pending', 'approved'].includes(request.status) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                    onClick={() => handleCancelRequest(request._id)}
                                    disabled={new Date(request.start_date) <= new Date()}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {new Date(request.start_date) <= new Date() 
                                      ? "Cannot cancel started leave" 
                                      : "Cancel leave"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Tabs>
      </Card>

      {/* Apply for Leave Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <AddLeaveRequestForm 
            onSubmit={handleAddLeaveRequest} 
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Leave Request Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {isAdmin && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employee</p>
                      <p className="text-base">
                        {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.employee?.employeeId} • {selectedRequest.employee?.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employee Email</p>
                      <p className="text-base">{selectedRequest.employee?.email || "N/A"}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                  <div className="mt-1">{renderLeaveTypeBadge(selectedRequest.leave_type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{renderStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-base">
                    {formatLeaveDate(selectedRequest.start_date, 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-base">
                    {formatLeaveDate(selectedRequest.end_date, 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Number of Days</p>
                  <p className="text-base">{selectedRequest.number_of_days}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
                  <p className="text-base">
                    {formatLeaveDate(selectedRequest.createdAt, 'dd MMM yyyy')}
                  </p>
                </div>
                {selectedRequest.approved_by && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                    <p className="text-base">
                      {selectedRequest.approved_by.firstName} {selectedRequest.approved_by.lastName}
                    </p>
                  </div>
                )}
                {selectedRequest.approved_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved At</p>
                    <p className="text-base">
                      {formatLeaveDate(selectedRequest.approved_at, 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                )}
                {selectedRequest.rejection_reason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Rejection Reason</p>
                    <p className="text-base">{selectedRequest.rejection_reason}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reason</p>
                <p className="text-base mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedRequest.reason}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {selectedRequest.status === 'pending' && isAdmin ? (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600"
                      onClick={() => {
                        setRejectDialogOpen(true)
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveRequest(selectedRequest._id)}
                    >
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setViewOpen(false)}>Close</Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
              <p className="mt-2 text-sm text-muted-foreground">Loading details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setRejectDialogOpen(false)
                setRejectionReason("")
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectWithReason}
                disabled={!rejectionReason.trim()}
              >
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}