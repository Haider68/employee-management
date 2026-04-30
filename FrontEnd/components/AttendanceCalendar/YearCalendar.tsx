import { useMemo } from 'react';
 import { MonthCard } from '../attendance/MonthCard';
 import { AttendanceStatus } from '../types/attendance';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface YearCalendarProps {
  year: number;
  getStatus: (date: string) => AttendanceStatus;
  onDayClick: (date: string, currentStatus: AttendanceStatus) => void;
}

export const YearCalendar = ({ year, getStatus, onDayClick }: YearCalendarProps) => {
  const months = useMemo(() => {
    return MONTH_NAMES.map((name, index) => ({
      name,
      month: index,
      year
    }));
  }, [year]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map(({ name, month }) => (
        <MonthCard
          key={month}
          month={month}
          year={year}
          monthName={name}
          getStatus={getStatus}
          onDayClick={onDayClick}
        />
      ))}
    </div>
  );
};
