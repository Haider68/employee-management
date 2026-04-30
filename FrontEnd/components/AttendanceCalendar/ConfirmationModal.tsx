// components/attendance/ConfirmationModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, LogIn, LogOut, Clock, Calendar } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'checkin' | 'checkout';
  date: string;
  time: string;
  checkInTime?: string;
}

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  date, 
  time,
  checkInTime 
}: ConfirmationModalProps) => {
  // Safe date formatting with error handling
  const getFormattedDate = () => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formattedDate = getFormattedDate();

  const calculateDuration = () => {
    try {
      if (!checkInTime) return null;
      
      // Handle time format (could be "HH:MM" or "HH:MM AM/PM")
      const parseTime = (timeStr: string) => {
        let [timePart, modifier] = timeStr.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        if (modifier && modifier.toLowerCase() === 'pm' && hours < 12) {
          hours += 12;
        }
        if (modifier && modifier.toLowerCase() === 'am' && hours === 12) {
          hours = 0;
        }
        
        return { hours, minutes };
      };

      const inTime = parseTime(checkInTime);
      const outTime = parseTime(time);
      
      const diff = (outTime.hours * 60 + outTime.minutes) - (inTime.hours * 60 + inTime.minutes);
      
      if (diff <= 0) return null;
      
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      
      return `${hours}h ${mins}m`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {type === 'checkin' ? (
              <>
                <div className="p-2 rounded-full bg-green-100">
                  <LogIn className="w-6 h-6 text-green-600" />
                </div>
                Confirm Check-In
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-blue-100">
                  <LogOut className="w-6 h-6 text-blue-600" />
                </div>
                Confirm Check-Out
              </>
            )}
          </DialogTitle>
          
          {/* Remove DialogDescription and use a div instead */}
          <div className="pt-4 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Date</div>
                  <div className="font-semibold text-gray-800">{formattedDate}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">
                    {type === 'checkin' ? 'Check-In Time' : 'Check-Out Time'}
                  </div>
                  <div className="font-semibold text-gray-800 text-lg">{time}</div>
                </div>
              </div>

              {type === 'checkout' && checkInTime && (
                <>
                  <div className="flex items-center gap-3">
                    <LogIn className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Check-In Time</div>
                      <div className="font-medium text-gray-800">{checkInTime}</div>
                    </div>
                  </div>
                  
                  {calculateDuration() && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Duration</span>
                        <span className="font-bold text-green-600 text-lg">{calculateDuration()}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="border-gray-300">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className={type === 'checkin' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm {type === 'checkin' ? 'Check-In' : 'Check-Out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};