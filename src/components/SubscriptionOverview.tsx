import { ExpenseItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';
import { getSubscriptionMetrics } from '@/utils/calculations';
import { Calendar, CreditCard, AlertCircle } from 'lucide-react';

export function SubscriptionOverview({ expenses, currency }: { expenses: ExpenseItem[]; currency: any }) {
  const metrics = getSubscriptionMetrics(expenses);

  if (metrics.activeCount === 0) {
    return null;
  }

  return (
    <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-500" />
          Subscription Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Monthly Spend</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(metrics.totalMonthly, currency)}
            </p>
          </div>
          <Badge variant="outline" className="bg-white dark:bg-background px-3 py-1">
            {metrics.activeCount} Active
          </Badge>
        </div>

        {metrics.upcomingPayments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Upcoming Payments
            </p>
            <div className="grid gap-2">
              {metrics.upcomingPayments.slice(0, 3).map((payment: any) => {
                const isUrgent = payment.daysUntil <= 7;
                return (
                  <div
                    key={payment.item.id}
                    className="flex items-center justify-between p-2 rounded-md bg-background border text-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isUrgent && <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />}
                      <span className="truncate">{payment.item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {payment.daysUntil === 0 ? 'Today' : `in ${payment.daysUntil}d`}
                      </span>
                      <span className="font-semibold">{formatCurrency(payment.item.amount, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}