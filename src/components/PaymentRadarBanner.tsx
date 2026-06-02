import { ExpenseItem } from '@/types';
import { formatCurrency, getUpcomingPayments } from '@/utils/calculations';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentRadarBannerProps {
  expenses: ExpenseItem[];
  currency: string;
  onViewDetails: () => void;
}

export function PaymentRadarBanner({ expenses, currency, onViewDetails }: PaymentRadarBannerProps) {
  const upcoming = getUpcomingPayments(expenses);
  
  if (upcoming.length === 0) {
    return null;
  }

  const totalDue = upcoming.reduce((sum: number, p: any) => sum + (p.item?.amount || 0), 0);

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500 p-1.5 rounded-full text-white">
          <Bell className="h-4 w-4" />
        </div>
        <p className="text-amber-900 font-medium">
          ⚠️ {upcoming.length} payment{upcoming.length > 1 ? 's' : ''} due this week 
          <span className="ml-2 font-bold">
            (Total: {formatCurrency(totalDue, currency)})
          </span>
        </p>
      </div>
      <Button 
        variant="link" 
        className="text-amber-700 hover:text-amber-900 p-0 h-auto font-bold underline underline-offset-4"
        onClick={onViewDetails}
      >
        View Details
      </Button>
    </div>
  );
}
