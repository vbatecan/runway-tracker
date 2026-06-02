import { useState } from 'react';
import { ExpenseItem, Frequency, SubscriptionStatus } from '@/types';
import { generateId } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { calculateNextBillingDate } from '@/utils/calculations';

interface AddExpenseDialogProps {
  onAdd: (item: ExpenseItem) => void;
  type?: 'expense' | 'income';
}

const EXPENSE_CATEGORIES = [
  'Subscription',
  'Rent',
  'Utilities',
  'Insurance',
  'Software',
  'Entertainment',
  'Food',
  'Transport',
  'Healthcare',
  'Other',
];

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' },
];

const STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'paused', label: 'Paused' },
];

export function AddExpenseDialog({ onAdd, type = 'expense' }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [category, setCategory] = useState('Other');
  const [isRecurring, setIsRecurring] = useState(true);
  const [billingDay, setBillingDay] = useState<string>('');
  const [status, setStatus] = useState<SubscriptionStatus>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const isSub = category === 'Subscription';
    const dayOfMonth = billingDay ? parseInt(billingDay, 10) : undefined;
    
    const item: ExpenseItem = {
      id: generateId(),
      name,
      amount: parseFloat(amount),
      frequency,
      category,
      isRecurring,
      createdAt: Date.now(),
      ...(isSub && {
        billingDayOfMonth: dayOfMonth,
        nextBillingDate: dayOfMonth ? calculateNextBillingDate(dayOfMonth) : undefined,
        subscriptionStatus: status,
      }),
    };

    onAdd(item);
    setName('');
    setAmount('');
    setFrequency('monthly');
    setCategory('Other');
    setIsRecurring(true);
    setBillingDay('');
    setStatus('active');
    setOpen(false);
  };

  const isIncome = type === 'income';
  const title = isIncome ? 'Add Income Source' : 'Add Expense';
  const description = isIncome
    ? 'Add a recurring or one-time income stream.'
    : 'Add a subscription or expense item.';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add {isIncome ? 'Income' : 'Expense'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isIncome ? "Side hustle, freelance..." : "Netflix, Spotify, rent..."}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isIncome && (
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {category === 'Subscription' && (
                  <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-muted rounded-lg">
                    <div className="grid gap-2">
                      <Label htmlFor="billingDay">Billing Day</Label>
                      <Input
                        id="billingDay"
                        type="number"
                        min="1"
                        max="31"
                        value={billingDay}
                        onChange={(e) => setBillingDay(e.target.value)}
                        placeholder="e.g. 15"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as SubscriptionStatus)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">Recurring</Label>
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add {isIncome ? 'Income' : 'Expense'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}