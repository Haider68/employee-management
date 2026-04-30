"use client"
import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { CheckInOutCard } from './CheckInOutCard';
import { StatsCard } from './StatsCard';
import { MonthCalendar } from '../attendance/MonthCalendar';
import { MonthSlider } from '../attendance/MonthSlider';
import { Legend } from './Legend';
import { useAuth } from '../context/auth';
import EmployeesWithAttendance from './EmployesWIthAttendence';
import { 
  markAttendence, 
  getAllAttendance, 
  getTodayAttendance, 
  checkOutAttendence,
  getStats,
  markAbsent
} from '@/lib/api';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Loader2,User } from 'lucide-react';

interface TodayAttendanceData {
  _id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  employee: {
    _id: string;
    department: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TodayAttendanceResponse {
  success: boolean;
  data: {
    attendance: TodayAttendanceData;
    hasCheckedIn: boolean;
    hasCheckedOut: boolean;
    workingHours: number;
  };
}

// Type definition for monthly attendance
interface MonthlyAttendanceData {
  attendance: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const AttendanceCalendar = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendanceData | null>(null);
  const [monthlyAttendanceData, setMonthlyAttendanceData] = useState<MonthlyAttendanceData>({
    attendance: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0
    }
  });

  const [statsData, setStatsData] = useState({});
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // JavaScript months are 0-11, backend expects 1-12
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const isTodaySunday = today.getDay() === 0;

  const userRole = user?.data?.user?.role;
  
  // Reset loading when user changes
  useEffect(() => {
    if (user && !authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Employee check-in function
  const EmployeeMarkAttendence = async () => {
    try {
      const res = await markAttendence();
      if (res?.success) {
        await Promise.all([
          fetchTodayAttendance(),
          fetchMonthlyAttendance(),
          fetchStats()
        ]);
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        });
      }
    } catch (error) {
      console.log("Check-in error:", error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    }
  };

  // Fetch statistics for current month
  const fetchStats = async () => {
    try {
      if (!user?.data?.user?._id) return;
      
      const res = await getStats(user.data.user._id, currentMonth, currentYear);
      console.log("Stats response:", res);
      
      if (res?.success) {
        setStatsData(res.data);
      }
    } catch (error) {
      console.log("Error fetching stats:", error);
    }
  };

  // Check-out function
  const handleCheckOut = async () => {
    try {
      const res = await checkOutAttendence();  
      if (res?.success) {
        await Promise.all([
          fetchTodayAttendance(),
          fetchMonthlyAttendance(),
          fetchStats()
        ]);
        toast({
          title: "Success",
          description: "Attendance checked-out successfully",
        });
      }
    } catch (error) {
      console.log("Check-out error:", error);
      toast({
        title: "Error",
        description: "Failed to check out",
        variant: "destructive"
      });
    }
  };

  // Mark absent function
  const handleMarkAbsent = async () => {
    try {
      const res = await markAbsent()
      if(res.success){
          toast({
              title: "Success",
              description: "Absent marked successfully",
              variant: "success"
          })
      }
      await fetchMonthlyAttendance();
    } catch (error) {
      console.log("Mark absent error:", error);
    }
  };


 

  // Fetch today's attendance
  const fetchTodayAttendance = async () => {
    try {
      if (!user?.data?.user?._id) return;
      
       const res = await getTodayAttendance(user?.data?.user?._id)

        console.log("res123",res);
      if (res?.success && res?.data?.attendance) {
        setTodayAttendance(res.data.attendance);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      setTodayAttendance(null);
    }
  };

  // Fetch monthly attendance data with filters
  const fetchMonthlyAttendance = async () => {
    try {
      if (!user?.data?.user?._id) return;
      
      // Calculate start and end dates for the current month
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const filters = {
        employeeId: user.data.user._id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        page: 1,
        limit: 100
      };
      
      const res = await getAllAttendance(filters);
      
      if (res?.success && res?.data) {
        setMonthlyAttendanceData({
          attendance: res.data.attendance || [],
          pagination: res.data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
          }
        });
      } else {
        setMonthlyAttendanceData({
          attendance: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
          }
        });
      }
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      setMonthlyAttendanceData({
        attendance: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      });
    }
  };

  // Handle month change
  const handlePrevious = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const canGoNext = !(currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear());

  // Fetch all data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTodayAttendance(),
        fetchMonthlyAttendance(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.data?.user?._id) {
      fetchAllData();
    }
  }, [user, currentMonth, currentYear]);

  const displayMonth = currentMonth - 1;
  
  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Loading Your Attendance</h2>
            <p className="text-gray-600">Please wait while we fetch your data...</p>
          </div>
          <div className="w-64 mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no user state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 max-w-md space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">No User Found</h2>
          <p className="text-gray-600">Please log in to view your attendance records.</p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {userRole === "admin" ? (
        <EmployeesWithAttendance />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <main className="container mx-auto px-4 py-6 space-y-8">
            {/* Check In/Out Card */}
            <CheckInOutCard
              todayRecord={todayAttendance}
              onCheckIn={EmployeeMarkAttendence}
              onCheckOut={handleCheckOut}
              onMarkAbsent={handleMarkAbsent}
              isSunday={isTodaySunday}
            />

            {/* Stats - Pass the stats data */}
            <StatsCard {...statsData} />
            <MonthSlider
              month={displayMonth}
              year={currentYear}
              onPrevious={handlePrevious}
              onNext={handleNext}
              canGoNext={canGoNext}
            />

            {/* Legend */}
            <Legend />

            <MonthCalendar
              month={displayMonth}
              year={currentYear}
              getRecord={(date) => {
                // Find record for the specific date
                return monthlyAttendanceData.attendance.find(record => {
                  const recordDate = new Date(record.date);
                  const targetDate = new Date(date);
                  return (
                    recordDate.getDate() === targetDate.getDate() &&
                    recordDate.getMonth() === targetDate.getMonth() &&
                    recordDate.getFullYear() === targetDate.getFullYear()
                  );
                }) || null;
              }}
              getStatus={(date) => {
                const targetDate = new Date(date);
                const dayOfWeek = targetDate.getDay();
                
                // Check if it's Sunday
                if (dayOfWeek === 0) {
                  // Check if it's a future date
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  targetDate.setHours(0, 0, 0, 0);
                  return targetDate > today ? 'future' : 'holiday';
                }
                
                // Check if it's a future date
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                targetDate.setHours(0, 0, 0, 0);
                if (targetDate > today) {
                  return 'future';
                }
                
                // Check attendance record
                const record = monthlyAttendanceData.attendance.find(record => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === targetDate.getDate() &&
                    recordDate.getMonth() === targetDate.getMonth() &&
                    recordDate.getFullYear() === targetDate.getFullYear()
                  );
                });
                
                if (record) {
                  if (record.status === 'present') {
                    return record.checkOut ? 'present' : 'working';
                  }
                  if (record.status === 'absent') {
                    return 'absent';
                  }
                }
                
                return 'no-record';
              }}
              attendanceData={monthlyAttendanceData}
            />

            {/* Footer */}
            <div className="text-center py-4 text-muted-foreground text-sm">
              <p>Hover over any day to see check-in/check-out details</p>
              <p className="text-xs mt-1">Showing data for {currentMonth}/{currentYear}</p>
            </div>
          </main>
        </div>
      )}
    </>
  );
};