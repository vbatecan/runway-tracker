import { ExpenseItem, SupportedCurrency } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RunwayCounter } from '@/components/RunwayCounter';
import { RunwayChart } from '@/components/RunwayChart';
import { SubscriptionOverview } from '@/components/SubscriptionOverview';
import { PaymentRadarBanner } from '@/components/PaymentRadarBanner';
import { Calculator, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DashboardViewProps {
  expenses: ExpenseItem[];
  currency: SupportedCurrency;
  runway: number;
  totalCash: number;
  monthlyBurn: number;
  monthlyIncome: number;
  netCashFlow: number;
  baseProjection: any[];
  setCurrentView: (view: string) => void;
}

export default function DashboardView({
  expenses,
  currency,
  runway,
  totalCash,
  monthlyBurn,
  monthlyIncome,
  netCashFlow,
  baseProjection,
  setCurrentView,
}: DashboardViewProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PaymentRadarBanner 
        expenses={expenses} 
        currency={currency} 
        onViewDetails={() => setCurrentView('subscriptions')}
      />
      
      <section className="mb-6">
        <RunwayCounter
          runway={runway as any}
          currentCash={totalCash}
          monthlyBurn={Math.abs(netCashFlow)}
          currency={currency}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <ArrowDownCircle className="mx-auto h-5 w-5 text-red-500 mb-1" />
                <p className="text-2xl font-bold">{formatCurrency(monthlyBurn, currency)}</p>
                <p className="text-xs text-muted-foreground">Monthly Burn</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ArrowUpCircle className="mx-auto h-5 w-5 text-green-500 mb-1" />
                <p className="text-2xl font-bold">{formatCurrency(monthlyIncome, currency)}</p>
                <p className="text-xs text-muted-foreground">Monthly Income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ArrowDownCircle className="mx-auto h-5 w-5 text-primary mb-1" />
                <p className="text-2xl font-bold">{formatCurrency(totalCash, currency)}</p>
                <p className="text-xs text-muted-foreground">Total Cash</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calculator className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, currency)}
                </p>
                <p className="text-xs text-muted-foreground">Net Cash Flow</p>
              </CardContent>
            </Card>
          </div>

          <SubscriptionOverview expenses={expenses} currency={currency} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">24-Month Cash Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <RunwayChart data={baseProjection} currency={currency} />
            </CardContent>
          </Card>
        </div>
        
        {/* We leave a placeholder for the right column if we want to maintain the layout, 
            or we can just let the DashboardView be the full width and 
            move the management tools entirely to TransactionsView.
            Given the project structure, the management tools (Currency, Add New, etc.) 
            seem to be transaction-related. 
            However, if we want to keep them on the Dashboard, we'd need them here.
            The plan says "Extract Dashboard and Transactions into dedicated view components".
            Usually, "Dashboard" is for viewing, "Transactions" is for managing.
            Let's move the right column to TransactionsView.
        */}
      </div>
    </div>
  );
}
