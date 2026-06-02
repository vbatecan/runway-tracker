import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import type { SupportedCurrency } from '@/types';

interface CashInputProps {
  cashPositions: { id: string; amount: number; label: string }[];
  onAdd: (amount: number, label: string) => void;
  onDelete: (id: string) => void;
  currency?: SupportedCurrency;
}

export function CashInput({
  cashPositions,
  onAdd,
  onDelete,
  currency = 'PHP',
}: CashInputProps) {
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    onAdd(parsedAmount, label.trim() || 'Cash Account');
    setAmount('');
    setLabel('');
  };

  const totalCash = cashPositions.reduce((sum, pos) => sum + pos.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Cash Positions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total */}
        <div className="rounded-lg bg-primary/10 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Cash</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(totalCash, currency)}
          </p>
        </div>

        {/* Add Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <Label htmlFor="cash-amount" className="text-xs">
              Amount
            </Label>
            <Input
              id="cash-amount"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="cash-label" className="text-xs">
              Label (optional)
            </Label>
            <Input
              id="cash-label"
              placeholder="Savings, Checking..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={!amount}>
            <Plus className="h-4 w-4 mr-1" />
            Add Cash
          </Button>
        </form>

        {/* List */}
        {cashPositions.length > 0 && (
          <div className="space-y-1">
            {cashPositions.map((pos) => (
              <div
                key={pos.id}
                className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors group"
              >
                <span className="text-sm truncate flex-1">{pos.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {formatCurrency(pos.amount, currency)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(pos.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}