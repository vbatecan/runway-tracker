import { useState, useEffect } from "react";
import type { ExpenseItem, Frequency, SubscriptionStatus } from "@/types";
import { generateId } from "@/hooks/useLocalStorage";
import { calculateNextBillingDate } from "@/utils/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: ExpenseItem) => void;
  onDelete?: (id: string) => void;
  editItem?: ExpenseItem | null;
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "yearly", label: "Yearly" },
  { value: "one-time", label: "One-time" },
];

const STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

export function SubscriptionDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  editItem,
}: SubscriptionDialogProps) {
  const isEdit = !!editItem;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [billingDay, setBillingDay] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus>("active");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setAmount(String(editItem.amount));
      setFrequency(editItem.frequency);
      setBillingDay(editItem.billingDayOfMonth ? String(editItem.billingDayOfMonth) : "");
      setStatus(editItem.subscriptionStatus || "active");
    } else {
      setName("");
      setAmount("");
      setFrequency("monthly");
      setBillingDay("");
      setStatus("active");
    }
  }, [editItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const dayOfMonth = billingDay ? parseInt(billingDay, 10) : undefined;

    const item: ExpenseItem = {
      id: editItem?.id || generateId(),
      name,
      amount: parseFloat(amount),
      frequency,
      category: "Subscription",
      isRecurring: true,
      createdAt: editItem?.createdAt || Date.now(),
      ...(frequency !== "one-time" && {
        billingDayOfMonth: dayOfMonth,
        nextBillingDate: dayOfMonth ? calculateNextBillingDate(dayOfMonth) : undefined,
        subscriptionStatus: status,
      }),
    };

    onSave(item);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (editItem && onDelete) {
      onDelete(editItem.id);
      onOpenChange(false);
    }
  };

  const showBilling = frequency !== "one-time";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Subscription" : "Add Subscription"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the subscription details below."
                : "Add a new subscription to track."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Netflix, Spotify, Adobe..."
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
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as Frequency)}
              >
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

            {showBilling && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="billingDay">Billing Day (1–31)</Label>
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
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as SubscriptionStatus)}
                  >
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
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <Button type="submit">
              {isEdit ? "Save Changes" : "Add Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}