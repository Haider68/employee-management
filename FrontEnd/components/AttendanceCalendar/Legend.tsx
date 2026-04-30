export const Legend = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-[#10B981] shadow-sm shadow-[#10B981]/30" />
        <span className="text-sm text-muted-foreground font-medium">Present</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-[#3B82F6] shadow-sm animate-pulse" />
        <span className="text-sm text-muted-foreground font-medium">Working</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-[#EF4444] shadow-sm shadow-[#EF4444]/30" />
        <span className="text-sm text-muted-foreground font-medium">Absent</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30" />
        <span className="text-sm text-muted-foreground font-medium">Sunday</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-[#6B7280] border border-[#D1D5DB]" />
        <span className="text-sm text-muted-foreground font-medium">No Record</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-[#6B7280] ring-2 ring-[#6366F1] ring-offset-1 ring-offset-[#FFFFFF]" />
        <span className="text-sm text-muted-foreground font-medium">Today</span>
      </div>
    </div>
  );
};