import { SupportedCurrency } from '@/types';
import { CURRENCY_LIST, getCurrencyInfo } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onChange: (currency: SupportedCurrency) => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const info = getCurrencyInfo(value);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Display Currency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={value} onValueChange={(v) => onChange(v as SupportedCurrency)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_LIST.map((code) => {
              const c = getCurrencyInfo(code);
              return (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono">{c.symbol}</span>
                    <span>{c.name}</span>
                    <span className="text-muted-foreground text-xs ml-1">{code}</span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          All amounts will be displayed in{' '}
          <span className="font-medium text-foreground">
            {info.symbol} {info.name}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}