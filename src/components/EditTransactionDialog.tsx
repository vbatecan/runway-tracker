import { useState, useEffect } from 'react';
import { ExpenseItem, IncomeItem, Frequency, SubscriptionStatus } from '@/types';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calculateNextBillingDate } from '@/utils/calculations';

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ExpenseItem | IncomeItem | null;
  onSave: (updatedItem: ExpenseItem | IncomeItem) => void;
  onDelete: (id: string) => void;
  type: 'expense' | 'income';
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

export function EditTransactionDialog({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
  type,
}: EditTransactionDialogProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [category, setCategory] = useState('Other');
  const [isRecurring, setIsRecurring] = useState(true);
  const [billingDay, setBillingDay] = useState<string>('');
  const [status, setStatus] = useState<SubscriptionStatus>('active');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setAmount(item.amount.toString());
      setFrequency(item.frequency);
      if ('category' in item) {
        setCategory(item.category);
        setBillingDay(item.billingDayOfMonth?.toString() || '');
        setStatus(item.subscriptionStatus || 'active');
      }
      setIsRecurring(item.isRecurring);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !item) return;

    const isSub = type === 'expense' && category === 'Subscription';
    const dayOfMonth = billingDay ? parseInt(billingDay, 10) : undefined;
    
    if (type === 'expense') {
      const expenseItem: ExpenseItem = {
        ...item as ExpenseItem,
        name,
        amount: parseFloat(amount),
        frequency,
        category,
        isRecurring,
        ...(isSub && {
          billingDayOfMonth: dayOfMonth,
          nextBillingDate: dayOfMonth ? calculateNextBillingDate(dayOfMonth) : undefined,
          subscriptionStatus: status,
        }),
      };
      onSave(expenseItem);
    } else {
      const incomeItem: IncomeItem = {
        ...item as IncomeItem,
        name,
        amount: parseFloat(amount),
        frequency,
        isRecurring,
      };
      onSave(incomeItem);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit {type === 'expense' ? 'Expense' : 'Income'}</DialogTitle>
            <DialogDescription>Update the details of this transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
            {type === 'expense' && (
              <>
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
                        <Label htmlFor="edit-billingDay">Billing Day</Label>
                        <Input
                          id="edit-billingDay"
                          type="number"
                          min="1"
                          max="31"
                          value={billingDay}
                          onChange={(e) => setBillingDay(e.target.value)}
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
              </>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-recurring">Recurring</Label>
              <Switch
                id="edit-recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="destructive" onClick={() => onDelete(item?.id || '')}>
              Delete
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}