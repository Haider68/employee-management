import { useMemo } from 'react';
import { AttendanceStatus } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface MonthCardProps {
  month: number;
  year: number;
  monthName: string;
  getStatus: (date: string) => AttendanceStatus;
  onDayClick: (date: string, currentStatus: AttendanceStatus) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthCard = ({ month, year, monthName, getStatus, onDayClick }: MonthCardProps) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const days = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    
    const daysArray: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }
    
    return daysArray;
  }, [month, year]);

  const formatDate = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isFutureDate = (day: number) => {
    const date = new Date(year, month, day);
    return date > today;
  };

  const isToday = (day: number) => {
    return formatDate(day) === todayStr;
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border card-hover animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-3 text-center">
        {monthName}
      </h3>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day.charAt(0)}
          </div>
        ))}
      </div>
      
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="w-full aspect-square" />;
          }

          const dateStr = formatDate(day);
          const status = getStatus(dateStr);
          const isFuture = isFutureDate(day);
          const todayCheck = isToday(day);

          return (
            <button
              key={day}
              disabled={isFuture}
              onClick={() => !isFuture && onDayClick(dateStr, status)}
              className={cn(
                "day-cell aspect-square text-xs",
                status === 'present' && "day-present",
                status === 'absent' && "day-absent",
                status === 'no-record' && "day-no-record hover:bg-muted",
                todayCheck && "day-today",
                isFuture && "day-future"
              )}
              title={`${day} ${monthName} - ${status === 'no-record' ? 'No Record' : status.charAt(0).toUpperCase() + status.slice(1)}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
