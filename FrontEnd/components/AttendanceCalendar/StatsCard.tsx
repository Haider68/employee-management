import { CheckCircle2, XCircle, Clock, TrendingUp, Sparkles } from 'lucide-react';

export const StatsCard = (data: any) => {
  const stats = data || {};
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
      {/* Present Card */}
      <div className="relative rounded-2xl p-5 overflow-hidden group transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 group-hover:scale-125 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-400 rounded-full translate-y-8 -translate-x-8 opacity-20 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:rotate-12 transition-all duration-500">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div>
            <p className="text-3xl font-bold text-emerald-900 group-hover:text-emerald-950 transition-colors duration-300">
              {stats?.presentDays || 0}
              <span className="text-emerald-700 text-sm ml-2">days</span>
            </p>
            <p className="text-sm font-semibold text-emerald-800/80 mt-1">Days Present</p>
            <div className="w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min(100, ((stats?.presentDays || 0) / (stats?.totalDays || 1)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Absent Card */}
      <div className="relative rounded-2xl p-5 overflow-hidden group transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div className="absolute top-0 left-0 w-20 h-20 bg-rose-500 rounded-full -translate-y-10 -translate-x-10 opacity-20 group-hover:opacity-30 group-hover:scale-125 transition-all duration-700"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-rose-400 rounded-full translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30 group-hover:shadow-rose-500/50 group-hover:-rotate-12 transition-all duration-500">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></div>
          </div>
          
          <div>
            <p className="text-3xl font-bold text-rose-900 group-hover:text-rose-950 transition-colors duration-300">
              {stats?.absentDays || 0}
              <span className="text-rose-700 text-sm ml-2">days</span>
            </p>
            <p className="text-sm font-semibold text-rose-800/80 mt-1">Days Absent</p>
            <div className="w-full h-1.5 bg-gradient-to-r from-rose-400 to-rose-300 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 to-rose-500 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min(100, ((stats?.absentDays || 0) / (stats?.totalDays || 1)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Hours Card */}
      <div className="relative rounded-2xl p-5 overflow-hidden group transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-400 rounded-full translate-y-10 -translate-x-5 opacity-20 group-hover:opacity-30 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3].map((dot) => (
                <div key={dot} className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${dot * 200}ms` }}></div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-blue-900 group-hover:text-blue-950 transition-colors duration-300">
              {stats?.totalWorkingTimeFormatted || stats?.totalWorkingTimeDetailed || '0h 0m'}
            </p>
            <p className="text-sm font-semibold text-blue-800/80 mt-1">Total Hours</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min(100, ((stats?.totalWorkingHours || 0) / 200) * 100)}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs font-bold text-blue-700">
                {Math.round((stats?.totalWorkingHours || 0))}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Rate Card */}
      <div className="relative rounded-2xl p-5 overflow-hidden group transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full -translate-y-8 translate-x-8 opacity-20 group-hover:opacity-30 group-hover:rotate-45 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-400 rounded-full translate-y-8 -translate-x-8 opacity-20 group-hover:opacity-30 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 group-hover:rotate-12 transition-all duration-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-amber-600 animate-bounce">
              <span className="text-xs font-bold">↑</span>
            </div>
          </div>
          
          <div>
            <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-950 transition-colors duration-300">
              {stats?.attendancePercentage ? parseFloat(stats.attendancePercentage).toFixed(1) : '0.0'}
              <span className="text-xl text-amber-700 ml-1">%</span>
            </p>
            <p className="text-sm font-semibold text-amber-800/80 mt-1">Attendance Rate</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-1.5 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-1500 ease-out"
                  style={{ 
                    width: `${Math.min(100, parseFloat(stats?.attendancePercentage || 0))}%` 
                  }}
                ></div>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {stats?.attendancePercentage ? Math.round(parseFloat(stats.attendancePercentage)) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};