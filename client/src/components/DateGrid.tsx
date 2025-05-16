import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Postcard } from "@shared/schema";

interface DateGridProps {
  userId: number;
  onDateSelect: (date: Date, postcard?: Postcard) => void;
  selectedDate?: Date | null;
}

export default function DateGrid({ userId, onDateSelect, selectedDate }: DateGridProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
  
  // Fetch user's postcards
  const { data: postcards } = useQuery<Postcard[]>({
    queryKey: ['/api/postcards', userId],
  });
  
  // Group postcards by date
  const postcardsByDate = React.useMemo(() => {
    if (!postcards) return new Map<string, Postcard>();
    
    const map = new Map<string, Postcard>();
    postcards.forEach(postcard => {
      const date = new Date(postcard.createdAt);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      map.set(dateKey, postcard);
    });
    
    return map;
  }, [postcards]);
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week of first day (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // Format month name
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Generate blank spaces for days before the first day of the month
    const blanks = Array(firstDayOfMonth).fill(null).map((_, i) => (
      <div key={`blank-${i}`} className="h-10"></div>
    ));
    
    // Generate day cells
    const days = Array(daysInMonth).fill(null).map((_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const dateKey = `${year}-${month + 1}-${day}`;
      const hasPostcard = postcardsByDate.has(dateKey);
      
      // Check if this day is selected
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;
      
      return (
        <div 
          key={`day-${day}`} 
          className={`h-10 flex items-center justify-center rounded-full cursor-pointer
            ${hasPostcard ? 'bg-accent dark:bg-accent hover:bg-accent/80' : 'hover:bg-muted'}
            ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
          `}
          onClick={() => {
            const newDate = new Date(year, month, day);
            const postcard = postcardsByDate.get(dateKey);
            onDateSelect(newDate, postcard);
          }}
        >
          <span className="text-sm">{day}</span>
        </div>
      );
    });
    
    return [...blanks, ...days];
  };
  
  return (
    <div>
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={prevMonth}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">{formatMonth(currentMonth)}</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={nextMonth}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {/* Day headers */}
        <div className="text-xs text-muted-foreground text-center">S</div>
        <div className="text-xs text-muted-foreground text-center">M</div>
        <div className="text-xs text-muted-foreground text-center">T</div>
        <div className="text-xs text-muted-foreground text-center">W</div>
        <div className="text-xs text-muted-foreground text-center">T</div>
        <div className="text-xs text-muted-foreground text-center">F</div>
        <div className="text-xs text-muted-foreground text-center">S</div>
        
        {/* Calendar days */}
        {renderCalendar()}
      </div>
    </div>
  );
}
