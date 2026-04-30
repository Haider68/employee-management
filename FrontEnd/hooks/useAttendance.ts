"use client"
import { useState, useCallback, useMemo } from 'react';
 import { AttendanceRecord,AttendanceStatus } from '@/components/types/attendance';

const STORAGE_KEY = 'attendance_records_v2';

const loadFromStorage = (): AttendanceRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const useAttendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(loadFromStorage);

  const checkIn = useCallback((date: string, time: string) => {
    setRecords(prev => {
      const filtered = prev.filter(r => r.date !== date);
      const newRecords = [...filtered, { 
        date, 
        status: 'checked-in' as AttendanceStatus,
        checkInTime: time 
      }];
      saveToStorage(newRecords);
      return newRecords;
    });
  }, []);

  const checkOut = useCallback((date: string, time: string) => {
    setRecords(prev => {
      const existing = prev.find(r => r.date === date);
      if (!existing || !existing.checkInTime) return prev;

      const filtered = prev.filter(r => r.date !== date);
      
      // Calculate duration in minutes
      const [inHours, inMins] = existing.checkInTime.split(':').map(Number);
      const [outHours, outMins] = time.split(':').map(Number);
      const inTotal = inHours * 60 + inMins;
      const outTotal = outHours * 60 + outMins;
      const duration = outTotal - inTotal;

      const newRecords = [...filtered, { 
        date, 
        status: 'present' as AttendanceStatus,
        checkInTime: existing.checkInTime,
        checkOutTime: time,
        duration: duration > 0 ? duration : 0
      }];
      saveToStorage(newRecords);
      return newRecords;
    });
  }, []);

  const markAbsent = useCallback((date: string) => {
    setRecords(prev => {
      const filtered = prev.filter(r => r.date !== date);
      const newRecords = [...filtered, { date, status: 'absent' as AttendanceStatus }];
      saveToStorage(newRecords);
      return newRecords;
    });
  }, []);

  const clearRecord = useCallback((date: string) => {
    setRecords(prev => {
      const filtered = prev.filter(r => r.date !== date);
      saveToStorage(filtered);
      return filtered;
    });
  }, []);

  const getRecord = useCallback((date: string): AttendanceRecord | null => {
    return records.find(r => r.date === date) || null;
  }, [records]);

  const getStatus = useCallback((date: string): AttendanceStatus => {
    const record = records.find(r => r.date === date);
    return record?.status || 'no-record';
  }, [records]);

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearRecords = records.filter(r => r.date.startsWith(String(currentYear)));
    
    const present = yearRecords.filter(r => r.status === 'present').length;
    const absent = yearRecords.filter(r => r.status === 'absent').length;
    const checkedIn = yearRecords.filter(r => r.status === 'checked-in').length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    const totalMinutes = yearRecords.reduce((acc, r) => acc + (r.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;

    return { present, absent, checkedIn, total, percentage, totalHours, remainingMins, totalMinutes };
  }, [records]);

  return { records, checkIn, checkOut, markAbsent, clearRecord, getRecord, getStatus, stats };
};
