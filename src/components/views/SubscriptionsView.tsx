import React, { useMemo } from 'react';
import { ExpenseItem, SupportedCurrency, SubscriptionStatus } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Calendar, CreditCard } from 'lucide-react';

interface SubscriptionsViewProps {
  expenses: ExpenseItem[];
  currency: SupportedCurrency;
  onToggleStatus: (id: string, status: SubscriptionStatus) => void;
}

export function SubscriptionsView({ expenses, currency, onToggleStatus }: SubscriptionsViewProps) {
  const subscriptions = useMemo(() => {
    return expenses
      .filter((e) => e.isRecurring && (e.category === 'Subscription' || e.subscriptionStatus))
      .sort((a, b) => {
        const dateA = a.nextBillingDate ? new Date(a.nextBillingDate).getTime() : Infinity;
        const dateB = b.nextBillingDate ? new Date(b.nextBillingDate).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [expenses]);

  const monthlyBurn = useMemo(() => {
    return subscriptions
      .filter((s) => s.subscriptionStatus !== 'paused' && s.subscriptionStatus !== 'cancelled')
      .reduce((acc, s) => {
        if (s.frequency === 'yearly') return acc + s.amount / 12;
        if (s.frequency === 'weekly') return acc + s.amount * 4.33;
        return acc + s.amount;
      }, 0);
  }, [subscriptions]);

  const annualImpact = monthlyBurn * 12;

  const isDueSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className=\"max-w-4xl mx-auto space-y-6\">
      <div className=\"flex items-center justify-between">
        <h2 className=\"text-2xl font-bold tracking-tight\">Subscription Management</h2>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm font-medium text-muted-foreground\">Monthly Burn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-3xl font-bold\">{formatCurrency(monthlyBurn, currency)}</div>
            <p className=\"text-xs text-muted-foreground mt-1\">Total of all active recurring costs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=\"pb-2\">
            <CardTitle className=\"text-sm font-medium text-muted-foreground\">Annual Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"text-3xl font-bold\">{formatCurrency(annualImpact, currency)}</div>
            <p className=\"text-xs text-muted-foreground mt-1\">Estimated yearly expenditure</p>
          </CardContent>
        </Card>
      </div>

      <div className=\"space-y-4\">
        <h3 className=\"text-lg font-semibold flex items-center gap-2\">
          <Calendar className=\"h-5 w-5\" />
          Upcoming Renewals
        </h3>
        
        {subscriptions.length === 0 ? (
          <div className=\"text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground\">
            No active subscriptions found.
          </div>
        ) : (
          <div className=\"grid gap-3\">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className={`transition-colors ${isDueSoon(sub.nextBillingDate) ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                <CardContent className=\"p-4 flex items-center justify-between\">
                  <div className=\"flex items-center gap-4\">
                    <div className={`p-2 rounded-full ${isDueSoon(sub.nextBillingDate) ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                      <CreditCard className=\"h-4 w-4\" />
                    </div>
                    <div>
                      <div className=\"font-medium flex items-center gap-2\">
                        {sub.name}
                        {isDueSoon(sub.nextBillingDate) && (
                          <span className=\"text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase font-bold\">Due Soon</span>
                        )}
                      </div>
                      <div className=\"text-sm text-muted-foreground\">
                        {formatCurrency(sub.amount, currency)} • {sub.frequency}
                        {sub.nextBillingDate && ` • Next: ${new Date(sub.nextBillingDate).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>

                  <div className=\"flex items-center gap-3">
                    <div className=\"flex items-center gap-2 mr-2">
                      <span className=\"text-xs text-muted-foreground\">Active</span>
                      <Switch 
                        checked={sub.subscriptionStatus !== 'paused' && sub.subscriptionStatus !== 'cancelled'}
                        onCheckedChange={(checked) => {
                          const nextStatus = checked ? 'active' : 'paused';
                          onToggleStatus(sub.id, nextStatus);
                        }}
                      />
                    </div>
                    {sub.subscriptionStatus === 'paused' && (
                      <span className=\"text-xs text-amber-600 font-medium px-2 py-1 bg-amber-100 rounded dark:bg-amber-900/30\">Paused</span>
                    )}
                    {sub.subscriptionStatus === 'cancelled' && (
                      <span className=\"text-xs text-red-600 font-medium px-2 py-1 bg-red-100 rounded dark:bg-red-900/30\">Cancelled</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
