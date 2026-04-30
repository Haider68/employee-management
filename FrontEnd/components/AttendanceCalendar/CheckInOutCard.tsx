"use client"
import { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, AlertCircle, XCircle, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from './ConfirmationModal';

interface CheckInOutCardProps {
  todayRecord: any | null;   
  onCheckIn: () => void;
  onCheckOut: () => void;
  onMarkAbsent: () => void;
  isSunday: boolean;
}

export const CheckInOutCard = ({ 
  todayRecord, 
  onCheckIn, 
  onCheckOut, 
  onMarkAbsent, 
  isSunday 
}: CheckInOutCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'checkin' | 'checkout'>('checkin');
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

 
   console.log("todayRecord",todayRecord);
  useEffect(() => {
    if (Array.isArray(todayRecord)) {
      const todaysRecord = todayRecord.find(record => {

         console.log("todaysRecord",todaysRecord);
        if (record.date) {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
           console.log("recordDate",recordDate,todayStr);
          return recordDate === todayStr;
        }
        return false;
      });

        console.log("todaysRecord",todaysRecord);
      setCurrentRecord(todaysRecord || null);
    } else {
     
      if (todayRecord?.date) {
        const recordDate = new Date(todayRecord.date).toISOString().split('T')[0];
        if (recordDate === todayStr) {
          setCurrentRecord(todayRecord);
        } else {
          setCurrentRecord(null);
        }
      } else {
        setCurrentRecord(null);
      }
    }
  }, [todayRecord, todayStr]);

  // Get current time for display
  const getCurrentTime = () => {
    return today.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleCheckInClick = () => {
    setModalType('checkin');
    setModalOpen(true);
  };

  const handleCheckOutClick = () => {
    setModalType('checkout');
    setModalOpen(true);
  };


  const handleConfirm = () => {
    if (modalType === 'checkin') {
      onCheckIn();
    } else {
      onCheckOut();
    }
    setModalOpen(false);
  };

  // IMPORTANT FIX: Properly check check-in and check-out status
  const hasCheckedIn = currentRecord !== null && 
                      currentRecord.checkIn !== null && 
                      currentRecord.checkIn !== undefined && 
                      currentRecord.checkIn !== '';

  const hasCheckedOut = currentRecord !== null && 
                        currentRecord.checkOut !== null && 
                        currentRecord.checkOut !== undefined && 
                        currentRecord.checkOut !== '';

  // Check if user is marked absent today
  const isMarkedAbsent = currentRecord !== null && currentRecord.status === 'absent';

  console.log("Current Record:", currentRecord);
  console.log("hasCheckedIn:", hasCheckedIn, "checkIn value:", currentRecord?.checkIn);
  console.log("hasCheckedOut:", hasCheckedOut, "checkOut value:", currentRecord?.checkOut);
  console.log("isMarkedAbsent:", isMarkedAbsent);

  // Get formatted check-in time
  const getCheckInTime = () => {
    if (currentRecord?.checkIn) {
      return new Date(currentRecord.checkIn).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    return '';
  };

  // Get formatted check-out time
  const getCheckOutTime = () => {
    if (currentRecord?.checkOut) {
      return new Date(currentRecord.checkOut).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    return '';
  };

  // Calculate working hours
  const calculateDuration = () => {
    if (currentRecord?.checkIn && currentRecord?.checkOut) {
      const checkInTime = new Date(currentRecord.checkIn);
      const checkOutTime = new Date(currentRecord.checkOut);
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const minutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return '0h';
  };

  // Calculate working hours so far (for current session)
  const calculateCurrentDuration = () => {
    if (currentRecord?.checkIn && !hasCheckedOut) {
      const checkInTime = new Date(currentRecord.checkIn);
      const now = new Date();
      const diffMs = now.getTime() - checkInTime.getTime();
      const minutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return '0h';
  };


  // Determine the current status for rendering
  const getCurrentStatus = () => {
    if (isSunday) return 'sunday';
    if (isMarkedAbsent) return 'absent';
    if (hasCheckedIn && hasCheckedOut) return 'completed';
    if (hasCheckedIn && !hasCheckedOut) return 'working';
    return 'not_started';
  };

  const currentStatus = getCurrentStatus();

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className={`p-4 md:p-6 border-b ${isSunday ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Today's Attendance</p>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{formattedDate}</h2>
            {isSunday && (
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                🎉 Sunday - Holiday
              </span>
            )}
          </div>
        </div>

        {/* Status Section */}
        <div className="p-4 md:p-6">
          {currentStatus === 'sunday' ? (
            <div className="text-center space-y-4">
              <div className="inline-flex flex-col items-center gap-3 px-4 py-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 w-full max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-3xl">🏖️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800 mb-1">Enjoy Your Holiday!</h3>
                  <p className="text-amber-600 text-sm">
                    No attendance tracking required today.
                  </p>
                </div>
              </div>
            </div>
          ) : currentStatus === 'absent' ? (
            // Show ABSENT status - NO BUTTONS
            <div className="text-center space-y-6">
              <div className="inline-flex flex-col items-center gap-4 px-6 py-5 bg-red-50 rounded-xl border border-red-100 w-full max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Ban className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Marked Absent</h3>
                  <p className="text-red-600 text-sm max-w-xs">
                    You have been marked absent for today.
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Contact HR if there's an error
                </p>
              </div>
            </div>
          ) : currentStatus === 'not_started' ? (
            // User hasn't checked in yet - Show Check In and Mark Absent buttons
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">Ready to start your day?</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Button 
                  onClick={handleCheckInClick}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-3 h-14 text-base font-semibold shadow-lg shadow-green-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogIn className="w-5 h-5" />
                  Check In Now
                </Button>
                
                <Button 
                  onClick={onMarkAbsent}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50 gap-3 h-14 text-base font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <XCircle className="w-5 h-5" />
                  Mark Absent
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Check in to start tracking your working hours
              </p>
            </div>
          ) : currentStatus === 'working' ? (
            // User has checked in but NOT checked out - Show Checkout button
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 md:p-5 text-center border border-green-200">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-full relative"></div>
                  </div>
                  <span className="font-semibold text-green-700">Currently Working</span>
                </div>
                
                <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Check-in Time</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{getCheckInTime()}</div>
                </div>
                
                <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration so far: {calculateCurrentDuration()}
                </div>
              </div>
              
              <Button 
                onClick={handleCheckOutClick}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-3 h-14 text-base font-semibold shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogOut className="w-5 h-5" />
                Check Out Now
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Click check out when you finish your work
              </p>
            </div>
          ) : currentStatus === 'completed' ? (
            // User has BOTH checked in AND checked out - Show completion status (NO BUTTONS)
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 md:p-5 border border-emerald-200">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-800">Day Completed ✓</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Check In</p>
                    <p className="text-lg font-bold text-gray-800">{getCheckInTime()}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Check Out</p>
                    <p className="text-lg font-bold text-gray-800">{getCheckOutTime()}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Total Hours</p>
                    <p className="text-lg font-bold text-emerald-600">{calculateDuration()}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">
                  ✅ Today's attendance has been recorded successfully
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You can check in again tomorrow
                </p>
              </div>
            </div>
          ) : (
            // Default state when no record exists for today
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium">No attendance record for today</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Button 
                  onClick={handleCheckInClick}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-3 h-14 text-base font-semibold"
                >
                  <LogIn className="w-5 h-5" />
                  Check In
                </Button>
                
                <Button 
                  onClick={onMarkAbsent}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 gap-3 h-14 text-base font-semibold"
                >
                  <XCircle className="w-5 h-5" />
                  Mark Absent
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Only show modal if not absent and not already checked out */}
      {!isMarkedAbsent && !hasCheckedOut && (
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          type={modalType}
          date={todayStr}
          time={getCurrentTime()}
          checkInTime={getCheckInTime()}
        />
      )}
    </>
  );
};