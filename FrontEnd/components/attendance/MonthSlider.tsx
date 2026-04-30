import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthSliderProps {
  month: number;
  year: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthSlider = ({ month, year, onPrevious, onNext, canGoNext }: MonthSliderProps) => {
  return (
    <div className="flex items-center justify-center gap-4 animate-fade-in">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        className="rounded-full h-12 w-12 shadow-sm hover:shadow-md transition-all hover:scale-105"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      
      <div className="flex items-center gap-3 px-8 py-3 bg-card rounded-full border border-border  min-w-[280px] justify-center">
        <Calendar className="w-6 h-6 text-primary" />
        <div className="text-center">
          <span className="text-2xl font-bold text-foreground">{MONTH_NAMES[month]}</span>
          <span className="text-2xl font-light text-muted-foreground ml-2">{year}</span>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-full h-12 w-12 shadow-sm hover:shadow-md transition-all hover:scale-105 disabled:opacity-50"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  );
};
