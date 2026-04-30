import { CheckCircle2, XCircle, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
 import { AttendanceStatus } from '../types/attendance';

interface TodayMarkerProps {
  todayStatus: AttendanceStatus;
  onMarkAttendance: (status: AttendanceStatus) => void;
}

export const TodayMarker = ({ todayStatus, onMarkAttendance }: TodayMarkerProps) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border animate-scale-in">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-1">Today's Date</p>
        <h2 className="text-2xl font-bold text-foreground">{formattedDate}</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <p className="text-muted-foreground font-medium">Mark Attendance:</p>
        
        <div className="flex gap-3">
          <Button
            onClick={() => onMarkAttendance('present')}
            variant={todayStatus === 'present' ? 'default' : 'outline'}
            className={`gap-2 ${todayStatus === 'present' ? 'bg-present hover:bg-present/90' : 'hover:bg-present/10 hover:text-present hover:border-present'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Present
          </Button>

          <Button
            onClick={() => onMarkAttendance('absent')}
            variant={todayStatus === 'absent' ? 'default' : 'outline'}
            className={`gap-2 ${todayStatus === 'absent' ? 'bg-absent hover:bg-absent/90' : 'hover:bg-absent/10 hover:text-absent hover:border-absent'}`}
          >
            <XCircle className="w-4 h-4" />
            Absent
          </Button>

          {todayStatus !== 'no-record' && (
            <Button
              onClick={() => onMarkAttendance('no-record')}
              variant="outline"
              className="gap-2 hover:bg-muted"
            >
              <Minus className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {todayStatus !== 'no-record' && (
        <div className="mt-4 text-center">
          <span className={`status-badge ${todayStatus === 'present' ? 'bg-present/10 text-present' : 'bg-absent/10 text-absent'}`}>
            {todayStatus === 'present' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                You are marked Present today
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                You are marked Absent today
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
