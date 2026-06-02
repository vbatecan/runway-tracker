import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { ExpenseItem, SupportedCurrency } from "@/types";

interface SubscriptionsViewProps {
  expenses: ExpenseItem[];
  currency: SupportedCurrency;
  onToggleStatus: (id: string, active: boolean) => void;
}

function getNextBillingDate(expense: ExpenseItem): Date {
  if (expense.nextBillingDate) return new Date(expense.nextBillingDate);
  const now = new Date();
  const day = expense.billingDayOfMonth ?? now.getDate();
  const next = new Date(now.getFullYear(), now.getMonth(), day);
  if (next <= now) next.setMonth(next.getMonth() + 1);
  return next;
}

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SubscriptionsView({
  expenses,
  
  onToggleStatus,
}: SubscriptionsViewProps) {
  const subscriptions = expenses.filter(
    (e) => e.isRecurring && e.category === "Subscription"
  );
  const monthlyBurn = subscriptions
    .filter((s) => s.subscriptionStatus !== "cancelled")
    .reduce((sum, s) => sum + s.amount, 0);
  const annualImpact = monthlyBurn * 12;

  const sorted = [...subscriptions].sort((a, b) => {
    return daysUntil(getNextBillingDate(a)) - daysUntil(getNextBillingDate(b));
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Subscription Management
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Burn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {monthlyBurn.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {annualImpact.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Upcoming Payments</h3>

        {sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No subscriptions found. Add a recurring expense with category
            "Subscription" to track it here.
          </p>
        ) : (
          sorted.map((sub) => {
            const nextDate = getNextBillingDate(sub);
            const remaining = daysUntil(nextDate);
            const isActive = sub.subscriptionStatus !== "cancelled" && sub.subscriptionStatus !== "paused";
            const isOverdue = remaining < 0;

            return (
              <Card
                key={sub.id}
                className={isActive ? "" : "opacity-50"}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{sub.name}</span>
                      {isOverdue && isActive && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                      {remaining >= 0 && remaining <= 7 && isActive && (
                        <Badge variant="secondary">Due soon</Badge>
                      )}
                      {!isActive && (
                        <Badge variant="outline">
                          {sub.subscriptionStatus === "paused" ? "Paused" : "Cancelled"}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {isOverdue
                        ? `Was due ${Math.abs(remaining)} days ago`
                        : remaining === 0
                          ? "Due today"
                          : `Due in ${remaining} day${remaining !== 1 ? "s" : ""}`}{" "}
                      —{" "}
                      {nextDate.toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    <span className="font-semibold tabular-nums">
                      {sub.amount.toLocaleString()}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        onToggleStatus(sub.id, checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}