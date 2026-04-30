"use client"
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Check, X, Home, Calendar, Timer, Sun, Moon } from 'lucide-react';

interface AttendanceRecord {
  _id?: string;
  date: string;
  checkIn?: string;
  checkOut?: string | null;
  status: string;
}

interface AttendanceData {
  attendance: AttendanceRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

type AttendanceStatus = 'present' | 'absent' | 'working' | 'holiday' | 'no-record' | 'future';

interface MonthCalendarProps {
  month: number;
  year: number;
  getRecord: (date: string) => AttendanceRecord | null;
  getStatus: (date: string) => AttendanceStatus;
  attendanceData: AttendanceData;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthCalendar = ({ 
  month, 
  year, 
  getRecord, 
  getStatus, 
  attendanceData 
}: MonthCalendarProps) => {
  const today = new Date();
  
  // Check if data is in correct format
  const safeAttendanceData = useMemo(() => {
    if (!attendanceData || typeof attendanceData !== 'object') {
      return { attendance: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
    }
    
    // Ensure attendance is an array
    const attendanceArray = Array.isArray(attendanceData.attendance) 
      ? attendanceData.attendance 
      : [];
    
    // Ensure pagination exists
    const pagination = attendanceData.pagination || {
      total: attendanceArray.length,
      page: 1,
      limit: 10,
      pages: Math.ceil(attendanceArray.length / 10)
    };
    
    return {
      attendance: attendanceArray,
      pagination
    };
  }, [attendanceData]);

  // Calculate total duration for present records
  const calculateDuration = (checkIn?: string, checkOut?: string | null) => {
    if (!checkIn || !checkOut) return null;
    
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffMs = end.getTime() - start.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours === 0) return `${minutes}m`;
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return null;
    }
  };

  // Format time to AM/PM
  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return null;
    }
  };

  // Create attendance map with UTC to IST conversion
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    
    if (safeAttendanceData.attendance && Array.isArray(safeAttendanceData.attendance)) {
      safeAttendanceData.attendance.forEach(record => {
        try {
          if (!record.date) return;
      
          const utcDate = new Date(record.date);
          const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
          const year = istDate.getFullYear();
          const month = String(istDate.getMonth() + 1).padStart(2, '0');
          const day = String(istDate.getDate()).padStart(2, '0');
          const dateKey = `${year}-${month}-${day}`;
          
          map.set(dateKey, record);
        } catch (error) {
          console.error('Error processing record:', error, record);
        }
      });
    }
    return map;
  }, [safeAttendanceData.attendance]);

  
  const { daysArray, daysInMonth } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    
    const daysArray: (number | null)[] = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }
    
    return { daysArray, daysInMonth };
  }, [month, year]);

   
  const formatDate = (day: number): string => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  // Check if it's Sunday
  const isSunday = (day: number): boolean => {
    const date = new Date(year, month, day);
    return date.getDay() === 0;
  };

  // Check if it's today
  const isToday = (day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if it's future date
  const isFuture = (day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    
    // Compare dates (ignore time)
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return dateStart > todayStart;
  };

  // Get record for a specific date
  const getRecordForDate = (dateStr: string): AttendanceRecord | null => {
    return attendanceMap.get(dateStr) || null;
  };

  // Get status for a specific date
  const getStatusForDate = (dateStr: string): AttendanceStatus => {
    const day = parseInt(dateStr.split('-')[2], 10);
    
    // Check if Sunday
    if (isSunday(day)) {
      return isFuture(day) ? 'future' : 'holiday';
    }
    
    // Check if future
    if (isFuture(day)) {
      return 'future';
    }
    
    // Check attendance
    const record = getRecordForDate(dateStr);
    
    if (record) {
      if (record.status === 'present') {
        return record.checkOut ? 'present' : 'working';
      }
      if (record.status === 'absent') {
        return 'absent';
      }
    }
    
    return 'no-record';
  };

  // Get status display properties with vibrant colors on white background
  const getStatusDisplay = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return {
          text: 'Present',
          icon: <Check className="w-3.5 h-3.5" strokeWidth={2.5} />,
          bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200',
          dayBg: 'bg-emerald-600',
          textColor: 'text-emerald-800',
          iconColor: 'text-emerald-600',
          iconBg: 'bg-emerald-100',
          statusBg: 'bg-emerald-50',
          shadow: 'shadow-emerald-100/50'
        };
      case 'working':
        return {
          text: 'Working',
          icon: <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />,
          bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200',
          dayBg: 'bg-blue-600',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          statusBg: 'bg-blue-50',
          shadow: 'shadow-blue-100/50'
        };
      case 'absent':
        return {
          text: 'Absent',
          icon: <X className="w-3.5 h-3.5" strokeWidth={2.5} />,
          bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200',
          dayBg: 'bg-rose-600',
          textColor: 'text-rose-800',
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-100',
          statusBg: 'bg-rose-50',
          shadow: 'shadow-rose-100/50'
        };
      case 'holiday':
        return {
          text: 'Holiday',
          icon: <Home className="w-3.5 h-3.5" strokeWidth={2.5} />,
          bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200',
          dayBg: 'bg-amber-600',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-100',
          statusBg: 'bg-amber-50',
          shadow: 'shadow-amber-100/50'
        };
      case 'future':
        return {
          text: 'Future',
          icon: null,
          bgColor: 'bg-gray-50 border-2 border-gray-200',
          dayBg: 'bg-gray-400',
          textColor: 'text-gray-600',
          iconColor: '',
          iconBg: '',
          statusBg: 'bg-gray-100',
          shadow: 'shadow-gray-100/50'
        };
      default:
        return {
          text: 'No Record',
          icon: null,
          bgColor: 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200',
          dayBg: 'bg-slate-500',
          textColor: 'text-slate-700',
          iconColor: '',
          iconBg: '',
          statusBg: 'bg-slate-100',
          shadow: 'shadow-slate-100/50'
        };
    }
  };

  return (
    <div className="border border-slate-200 rounded-3xl p-4 sm:p-8 bg-white shadow-xl">
      {/* Month Header */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                {MONTH_NAMES[month]} {year}
              </h2>
              <p className="text-slate-600 text-sm mt-1">Attendance Calendar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5 bg-gradient-to-r from-slate-50 to-white px-5 py-3 rounded-2xl border-2 border-slate-100 shadow-sm">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                {safeAttendanceData.pagination.total}
              </div>
              <div className="text-xs text-slate-600 font-medium">Records</div>
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                {safeAttendanceData.attendance.filter(a => a.status === 'present').length}
              </div>
              <div className="text-xs text-slate-600 font-medium">Present</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-600 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="font-medium">Today's date has a blue ring</span>
        </div>
      </div>
      
      {/* Weekday headers with FULL weekday names */}

     {/* Weekday headers with FULL weekday names */}
<div className="grid grid-cols-7 gap-5 mb-6">
  {WEEKDAYS.map((day, index) => (
    <div 
      key={day} 
      className={cn(
        "text-center text-sm sm:text-base font-bold py-4 rounded-xl border-2 shadow-sm min-h-[60px] flex items-center justify-center",
        index === 0 
          ? "text-rose-600 bg-gradient-to-br from-rose-50 to-white border-rose-100" 
          : "text-slate-700 bg-gradient-to-br from-slate-50 to-white border-slate-100"
      )}
    >
      {day}
    </div>
  ))}
</div>
      
      {/* Days grid - ALL CARDS SAME SIZE with min-h */}
      <div className="grid grid-cols-7 gap-5">
        {daysArray.map((day, index) => {
          if (day === null) {
            return (
              <div 
                key={`empty-${index}`} 
                className="min-h-[180px] rounded-2xl border-2 border-transparent"
              />
            );
          }

          const dateStr = formatDate(day);
          const status = getStatusForDate(dateStr);
          const record = getRecordForDate(dateStr);
          const todayCheck = isToday(day);
          const display = getStatusDisplay(status);
          const isFutureDate = status === 'future';
          const isSundayDate = isSunday(day) && !isFutureDate;
          const duration = record ? calculateDuration(record.checkIn, record.checkOut) : null;
          const checkInTime = formatTime(record?.checkIn);
          const checkOutTime = formatTime(record?.checkOut);

          return (
            <div
              key={day}
              className={cn(
                "min-h-[180px] rounded-2xl flex flex-col items-center justify-center p-4 border-2 transition-all duration-300",
                display.bgColor,
                todayCheck && "ring-4 ring-blue-500 ring-offset-2",
                isSundayDate && "border-amber-200"
              )}
            >
              {/* Day number */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-base font-bold mb-3 transition-all shadow-md",
                todayCheck ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white scale-110" :
                isSundayDate ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white" :
                isFutureDate ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white" :
                display.dayBg + " text-white"
              )}>
                {day}
              </div>
              
              {/* Status with icon - CONSISTENT HEIGHT */}
              <div className="flex flex-col items-center w-full min-h-[100px] justify-between">
                <div className="flex flex-col items-center space-y-3 w-full">
                  {display.icon && (
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2 p-2",
                      display.iconBg,
                      "border border-white/50 shadow-inner"
                    )}>
                      <div className={display.iconColor}>
                        {display.icon}
                      </div>
                    </div>
                  )}
                  
                  {/* Status text */}
                  <div className={cn(
                    "text-sm font-bold px-3 py-2 rounded-xl w-full text-center shadow-sm",
                    display.textColor,
                    display.statusBg,
                    "border border-white"
                  )}>
                    {display.text}
                  </div>
                </div>
                
                {/* Additional information area - CONSISTENT HEIGHT */}
                <div className="w-full mt-3">
                  {/* Duration for present days */}
                  {status === 'present' && duration && (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-xl w-full border border-emerald-200 shadow-sm">
                        <Timer className="w-4 h-4" />
                        <span>{duration}</span>
                      </div>
                      
                      {/* Show times with AM/PM */}
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600 text-center w-full mt-2">
                        {checkInTime && (
                          <div className="flex items-center justify-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-100">
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold">{checkInTime}</span>
                          </div>
                        )}
                        {checkOutTime && (
                          <div className="flex items-center justify-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-100">
                            <Moon className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-bold">{checkOutTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Check-in time for working status with AM/PM */}
                  {status === 'working' && checkInTime && (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-2 rounded-xl w-full border border-blue-200 shadow-sm">
                        <Clock className="w-4 h-4" />
                        <span>Working</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 bg-white px-2 py-1.5 rounded-lg border border-slate-100 w-full mt-2">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold">{checkInTime}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* For absent days - FILLER CONTENT */}
                  {status === 'absent' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-xs text-slate-500 italic text-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full">
                        No check-in recorded
                      </div>
                    </div>
                  )}
                  
                  {/* For future days - FILLER CONTENT */}
                  {status === 'future' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-xs text-slate-400 italic text-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-full">
                        Future date
                      </div>
                    </div>
                  )}
                  
                  {/* For no-record days - FILLER CONTENT */}
                  {status === 'no-record' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-xs text-slate-400 text-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full">
                        No attendance data
                      </div>
                    </div>
                  )}
                  
                  {/* For holiday days - FILLER CONTENT */}
                  {status === 'holiday' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-xs text-amber-600 text-center bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-full">
                        Weekly holiday
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      
      {/* Enhanced Legend */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-500 to-purple-500 shadow"></div>
          Status Legend
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-100 shadow-sm hover:shadow-emerald-100 transition-shadow min-h-[120px] justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3 shadow-lg">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-emerald-800">Present</div>
              <div className="text-xs text-emerald-600 mt-1">Shows duration & times</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 shadow-sm hover:shadow-blue-100 transition-shadow min-h-[120px] justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-800">Working</div>
              <div className="text-xs text-blue-600 mt-1">Checked in only</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-white border-2 border-rose-100 shadow-sm hover:shadow-rose-100 transition-shadow min-h-[120px] justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-3 shadow-lg">
              <X className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-rose-800">Absent</div>
              <div className="text-xs text-rose-600 mt-1">No check-in record</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 shadow-sm hover:shadow-amber-100 transition-shadow min-h-[120px] justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3 shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-amber-800">Sunday</div>
              <div className="text-xs text-amber-600 mt-1">Weekly holiday</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 shadow-sm hover:shadow-slate-100 transition-shadow min-h-[120px] justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center mb-3 shadow-lg">
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-800">No Record</div>
              <div className="text-xs text-slate-600 mt-1">No attendance data</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="mt-10 p-6 bg-gradient-to-r from-slate-50 to-white rounded-2xl border-2 border-slate-100 shadow-lg">
        <h5 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-3">
          <Timer className="w-5 h-5 text-blue-600" />
          Monthly Summary
        </h5>
        <div className="grid grid-cols-3 gap-5">
          <div className="text-center bg-white py-4 rounded-xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow min-h-[100px] flex flex-col justify-center">
            <div className="text-xl font-bold text-emerald-600">
              {safeAttendanceData.attendance.filter(a => a.status === 'present').length}
            </div>
            <div className="text-sm text-slate-600 font-medium mt-1">Present Days</div>
          </div>
          <div className="text-center bg-white py-4 rounded-xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow min-h-[100px] flex flex-col justify-center">
            <div className="text-xl font-bold text-rose-600">
              {safeAttendanceData.attendance.filter(a => a.status === 'absent').length}
            </div>
            <div className="text-sm text-slate-600 font-medium mt-1">Absent Days</div>
          </div>
          <div className="text-center bg-white py-4 rounded-xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow min-h-[100px] flex flex-col justify-center">
            <div className="text-xl font-bold text-blue-600">
              {Math.ceil(safeAttendanceData.attendance.filter(a => a.status === 'present').length / 7)}
            </div>
            <div className="text-sm text-slate-600 font-medium mt-1">Working Weeks</div>
          </div>
        </div>
        
        {/* Total Hours Summary */}
        {safeAttendanceData.attendance.some(a => a.status === 'present' && a.checkIn && a.checkOut) && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
              <div className="text-sm font-medium text-slate-700 mb-2">Estimated Total Hours This Month</div>
              <div className="text-2xl font-bold text-blue-700">
                {(() => {
                  const presentRecords = safeAttendanceData.attendance.filter(a => 
                    a.status === 'present' && a.checkIn && a.checkOut
                  );
                  
                  let totalMinutes = 0;
                  presentRecords.forEach(record => {
                    try {
                      const start = new Date(record.checkIn!);
                      const end = new Date(record.checkOut!);
                      const diffMs = end.getTime() - start.getTime();
                      totalMinutes += Math.floor(diffMs / (1000 * 60));
                    } catch (error) {
                      
                    }
                  });
                  
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  
                  if (hours === 0) return `${minutes} minutes`;
                  return `${hours}h ${minutes}m total`;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};