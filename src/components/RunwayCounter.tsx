import { RunwayResult } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatRunway as formatRunwayCalc } from '@/utils/calculations';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SupportedCurrency } from '@/types';

interface RunwayCounterProps {
  runway: RunwayResult;
  currentCash: number;
  monthlyBurn: number;
  currency?: SupportedCurrency;
}

export function RunwayCounter({
  runway,
  currentCash,
  monthlyBurn,
  currency = 'PHP',
}: RunwayCounterProps) {
  const runwayLabel = formatRunwayCalc(runway);
  const isInfinite = runway.isInfinite || runway.isGrowing;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 p-6 md:p-8">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative grid md:grid-cols-3 gap-6 items-center">
        {/* Runway Display */}
        <div className="md:col-span-2 text-center md:text-left">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Your Runway
          </p>
          <h2
            className={cn(
              'text-5xl md:text-7xl font-black tracking-tight',
              isInfinite ? 'text-green-500' : 'text-primary',
              'transition-all duration-500'
            )}
          >
            {runwayLabel}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {isInfinite
              ? 'Your income exceeds your expenses!'
              : `Based on ${formatCurrency(monthlyBurn, currency)}/month burn rate`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Cash Left</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(currentCash, currency)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly Burn</p>
              <p className="text-xl font-bold text-red-500">
                {formatCurrency(monthlyBurn, currency)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}