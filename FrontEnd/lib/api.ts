 
 import api from "@/components/service/axiosInstance";

function extractValidationMessage(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;

  const msg = data.message ?? data.Message;
  if (typeof msg === "string" && msg) return msg;

  const title = data.title;
  if (typeof title === "string" && title) return title;

  const errors = data.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as { msg?: string; message?: string } | string;
    if (typeof first === "string") return first;
    return first?.msg ?? first?.message;
  }
  if (errors && typeof errors === "object") {
    for (const key of Object.keys(errors)) {
      const val = (errors as Record<string, unknown>)[key];
      if (Array.isArray(val) && val.length > 0) return String(val[0]);
      if (typeof val === "string") return val;
    }
  }
  return undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error) return error;
  if (error instanceof Error && error.message) return error.message;

  const axiosError = error as { response?: { data?: Record<string, unknown> }; message?: string };
  const fromData = extractValidationMessage(axiosError?.response?.data);
  if (fromData) return fromData;

  if (!axiosError?.response) {
    return "Unable to reach the server. Check that the API is running.";
  }

  if (typeof axiosError?.message === "string" && axiosError.message) {
    return axiosError.message;
  }

  return fallback;
}

const handleApi = async (promise: Promise<any>) => {
   try {
       const response = await promise
      return  response;
   }  catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, "Request failed"));
   }
};

const normalizeProjectPayload = (formData: any) => {
  const teamMembers = Array.isArray(formData?.teamMembers)
    ? formData.teamMembers
        .map((member: any) => {
          if (typeof member === "object" && member !== null) {
            return Number(member.employeeId ?? member._id ?? member.id ?? member);
          }
          return Number(member);
        })
        .filter((value: number) => Number.isFinite(value) && value > 0)
    : [];

  return {
    projectName: formData?.projectName ?? "",
    client: formData?.client ?? "",
    startDate: formData?.startDate ? new Date(formData.startDate).toISOString() : undefined,
    deadline: formData?.deadline ? new Date(formData.deadline).toISOString() : undefined,
    projectDescription: formData?.projectDescription ?? null,
    status: formData?.status ?? "planning",
    priority: formData?.priority ?? "medium",
    budget: Number(formData?.budget ?? 0),
    tags: Array.isArray(formData?.tags) ? formData.tags.filter(Boolean) : [],
    teamMembers,
  };
};


export const getData = async (url: string) => {
   try {
      const response = await api.get(url)
      return response?.data
   } catch (error) {
      throw error
   }
}


export const postFileData = async (url: string, data: any, config?: any) => {
   try {
       const response = await api.post(url, data, config);
       return response;
   } catch (error) {
       throw error;
   }
};

export const postData = async (url: string, formData: any) => {
   try {
      const response = await api.post(url, formData)
      return response?.data
   } catch (error) {
       throw error
   }
}

export const putData = async (url: string, formData: any) => {
   try {
      const response = await api.put(url, formData)
      return response?.data
   } catch (error) {
      throw error
   }
}


export const putFileData = async(url: string, data: any, config?: any) => {
      try {
          const response = await api.put(url, data, config)
          return response
      } catch (error) {
          throw error
      }
};


export const patchData = async (url: string, formData: any) => {
   try {
      const response = await api.patch(url, formData)
      return response?.data
   } catch (error) {
      throw error
   }
}

export const putDataWIthId = async (url: string, formData: any) => {
   try {
      const response = await api.put(url, formData)
      return response?.data
   } catch (error) {
      throw error
   }
}


export const deleteDataWithId = async (url: string) => {
   try {
      const response = await api.delete(`${url}`)
      return response?.data
   } catch (error) {
      throw error
   }
}

// ==================Admin User =======================

  export const AdminLogin = async (formData: any) => {
     return handleApi(postData('/admin/login', formData))
}


export const logOut = async () => {
     return handleApi(postData('/admin/logout', {}))
}


export const getMe = async() => {
   return handleApi(getData('/admin/me'))
}

// ========================EMployee =========================


export const createEmployee = async(formData: any) => {
   return handleApi(postData('/employee/create-employee', formData))
}


export const updateEmployee = async(id: any, formData: any) => {
   return handleApi(putDataWIthId(`/employee/update-employee/${id}`, formData))
}

export const getAllEmployees = async(filters: any) => {
   const queryParams = new URLSearchParams()
   if (filters?.status) queryParams.append('status', filters.status)
   if (filters?.department) queryParams.append('department', filters.department)
   const queryString = queryParams.toString()
   const url = `/employee/get-all-employees${queryString ? `?${queryString}` : ''}`
   return handleApi(getData(url))
}


export const getEmployee = async(id: any) => {
   return handleApi(getData(`/employee/employee/${id}`))
}


export const deleteEmployee = async(id: any) => {
   return handleApi(deleteDataWithId(`/employee/delete-employee/${id}`))
}


export const changeEmployeeStatus = async(id: any, status: any) => {
   return handleApi(patchData(`/employee/${id}/status`, { status }))
}

// =========================Project =========================

export const createProject = async(formData: any) => {
   return handleApi(postData('/project/create-project', normalizeProjectPayload(formData)))
}  


export const updateProject = async(id: any, formData: any) => {
   return handleApi(putDataWIthId(`/project/update-project/${id}`, normalizeProjectPayload(formData)))
}


export const getAllProjects = async(filters: any) => {
   const queryParams = new URLSearchParams()
   if (filters?.status) queryParams.append('status', filters.status)
   const queryString = queryParams.toString()
   return handleApi(getData(`/project/get-all-projects${queryString ? `?${queryString}` : ''}`))
}


export const getProject = async(id: any) => {
   return handleApi(getData(`/project/get-project/${id}`))
}


export const deleteProject = async(id: any) => {
   return handleApi(deleteDataWithId(`/project/delete-project/${id}`))
}


export const changeProjectStatus = async(id: any, status: any) => {
   return handleApi(patchData(`/project/update-status/${id}/status`, { status }))
}

export const getProjectStats = async() => {
   return handleApi(getData('/project/stats'))
}


export const addTeamMember = async(projectId: any, employeeId: any) => {
   return handleApi(postData(`/project/${projectId}/team-members`, { employeeId }))
}



export const removeTeamMember = async(projectId: any, employeeId: any) => {
   return handleApi(deleteDataWithId(`/project/${projectId}/team-members/${employeeId}`))
}


// ==============+Attendence ===============

export const markAttendence = async() => {
   return handleApi(postData('/attendence/check-in', {}))
}


export const checkOutAttendence = async() => {
   return handleApi(postData('/attendence/check-out', {}))
}


export const getAllAttendance = async(filters: any) => {
   const queryParams = new URLSearchParams();
   
   if (filters?.status) queryParams.append('status', filters.status);
   if (filters?.employeeId) queryParams.append('employeeId', filters.employeeId);
   if (filters?.startDate) queryParams.append('startDate', filters.startDate);
   if (filters?.endDate) queryParams.append('endDate', filters.endDate);
   if (filters?.page) queryParams.append('page', filters.page.toString());
   if (filters?.limit) queryParams.append('limit', filters.limit.toString());
   
   const queryString = queryParams.toString();
   const url = `/attendence/all${queryString ? '?' + queryString : ''}`;
   
   return handleApi(getData(url));
}


export const markAbsent = async() => {
   return handleApi(postData('/attendence/mark-absent', {}))
}


 
export const getStats = async(employeeId: string, month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  return handleApi(getData(`/attendence/stats/${employeeId}?${params.toString()}`));
}

export const getTodayAttendance = async(employeeId: any) => {
   return handleApi(getData(`/attendence/today/${employeeId}`))
}

export const getAttendanceByDateRange = async(employeeId: any, startDate: any, endDate: any) => {
   return handleApi(getData(`/attendence/employee/${employeeId}/range`))
}


// ==================== Leave Management =====================

// Create leave request
export const createLeaveRequest = async (formData: any) => {
    const payload = {
        leaveType: formData.leave_type,
        startDate: formData.start_date,
        endDate: formData.end_date,
        reason: formData.reason,
        numberOfDays: formData.number_of_days,
    };
    return handleApi(postData('/leave/create-leave', payload));
}



// Get employee's own leave requests
export const getEmployeeLeaveRequests = async (filters:any) => {
    const params = new URLSearchParams();
    
    // Add optional filters
    if (filters.status) params.append('status', filters.status);
    if (filters.leave_type) params.append('leave_type', filters.leave_type);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = queryString ? `/leave/my-leaves?${queryString}` : '/leave/my-leaves';
    
    return handleApi(getData(url));
}

// Get leave balance
export const getLeaveBalance = async () => {
    return handleApi(getData('/leave/balance'));
}

// Get leave statistics
export const getLeaveStatistics = async (year = null) => {
    const url = year ? `/leave/statistics?year=${year}` : '/leave/statistics';
    return handleApi(getData(url));
}

// Update leave request
export const updateLeaveRequest = async (leaveId :string, formData:any) => {
    return handleApi(putDataWIthId(`/leave/${leaveId}`, formData));
}

// Cancel leave request
export const cancelLeaveRequest = async (leaveId: string) => {
    return handleApi(putDataWIthId(`/leave/${leaveId}/cancel`,{}));
}

// Get all leave requests (for admin/manager)
export const getAllLeaveRequests = async (filters:any) => {
    const params = new URLSearchParams();
    
    // Add optional filters
    if (filters.status) params.append('status', filters.status);
    if (filters.leave_type) params.append('leave_type', filters.leave_type);
    if (filters.employee_id) params.append('employee_id', filters.employee_id);
    if (filters.department) params.append('department', filters.department);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = queryString ? `/leave/all?${queryString}` : '/leave/all';
    
    return handleApi(getData(url));
}

// Get upcoming leaves
export const getUpcomingLeaves = async (department = null, limit :any) => {
    const params = new URLSearchParams();
    
    if (department) params.append('department', department);
    if (limit) params.append('limit', limit);
    
    const queryString = params.toString();
    const url = queryString ? `/leave/upcoming?${queryString}` : '/leave/upcoming';
    
    return handleApi(getData(url));
}

// Get single leave request by ID
export const getLeaveRequest = async (leaveId:string) => {
    return handleApi(getData(`/leave/${leaveId}`));
}

// Approve leave request
export const approveLeaveRequest = async (leaveId:string) => {
    return handleApi(putDataWIthId(`/leave/${leaveId}/approve`,{}));
}

// Reject leave request
export const rejectLeaveRequest = async (leaveId: string, rejectionReason: string) => {
    return handleApi(
        putDataWIthId(`/leave/${leaveId}/reject`, { rejectionReason })
    );
}

// Bulk process leaves (approve/reject multiple)
export const bulkProcessLeaves = async (
    leaveIds: (string | number)[],
    action: string,
    rejectionReason?: string
) => {
    const payload: {
        leaveIds: number[];
        action: string;
        rejectionReason?: string;
    } = {
        leaveIds: leaveIds.map((id) => Number(id)),
        action,
    };

    if (action === "reject" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
    }

    return handleApi(postData("/leave/bulk-process", payload));
}


// employe Update Profile 
export const updateProfile = async(formData: any) => {
   return handleApi(putDataWIthId(`/employee/update-profile`, formData))
}

// Update Employee  Password
export const updatePassword = async(formData: any) => {
   return handleApi(putDataWIthId(`/employee/update-password`, formData))
}


// Update Super Admin Profile
export const updateSuperAdminProfile = async(formData: any) => {
   return handleApi(putDataWIthId(`/admin/update-profile`, formData))
}

// Update Super Admin Password
export const updateSuperAdminPassword = async(formData: any) => {
   return handleApi(putDataWIthId(`/admin/update-password`, formData))
}



//================================ Admin Profile Update ===================



export const updateAdminProfile = async(formData: any) => {
   return handleApi(putData(`/admin/update-profile`, formData))
}

export const changePaasword = async(formData: any) => {
   return handleApi(putData(`/admin/update-password`, formData))
}


export const AdminRegister = async (formData: any) => {
   return handleApi(postData('/admin/register', formData))
}



// =======================================Employee Profile Update =====================

export const updateEmployeeProfile = async(formData: any) => {
   return handleApi(putData(`/employee/update-profile`, formData))
}

export const updateEmployeePassword = async(formData: any) => {
   return handleApi(putData(`/employee/update-password`, formData))
}

// ======================================= Chat =====================

export type ChatHistoryItem = { role: string; content: string }

export type ChatMessagePayload = {
  message: string
  history: ChatHistoryItem[]
}

export type ChatMessageResponseData = {
  reply: string
  message?: string
  executedQueries?: unknown[]
  rowCount?: number
}

export type ChatMessageResponse = {
  success: boolean
  message: string
  data: ChatMessageResponseData
}

export function extractChatReply(response: ChatMessageResponse): string {
  const reply = response?.data?.reply ?? response?.data?.message
  if (!reply?.trim()) {
    throw new Error("No response received from the assistant.")
  }
  return reply.trim()
}

export const sendChatMessage = async (
  payload: ChatMessagePayload
): Promise<ChatMessageResponse> => {
  return handleApi(postData("/chat/message", payload))
}








