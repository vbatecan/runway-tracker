import { ExpenseItem, IncomeItem, RunwayResult, ProjectedMonth } from '@/types';

export function toMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return amount * (52 / 12);
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    case 'one-time':
      return 0;
    default:
      return amount;
  }
}

export function calculateBurnRate(expenses: ExpenseItem[]): number {
  return expenses.reduce((total, expense) => {
    if (expense.frequency === 'one-time') {
      return total;
    }
    return total + toMonthlyAmount(expense.amount, expense.frequency);
  }, 0);
}

export function calculateIncomeRate(incomes: IncomeItem[]): number {
  return incomes.reduce((total, income) => {
    if (income.frequency === 'one-time') {
      return total;
    }
    return total + toMonthlyAmount(income.amount, income.frequency);
  }, 0);
}

export function calculateNetCashFlow(incomes: IncomeItem[], expenses: ExpenseItem[]): number {
  return calculateIncomeRate(incomes) - calculateBurnRate(expenses);
}

export function calculateRunway(cashBalance: number, monthlyNetBurn: number): RunwayResult {
  if (monthlyNetBurn < 0) {
    return { months: Infinity, days: Infinity, isInfinite: false, isGrowing: true };
  }

  if (monthlyNetBurn === 0) {
    return { months: Infinity, days: Infinity, isInfinite: true, isGrowing: false };
  }

  const totalDays = Math.floor(cashBalance / (monthlyNetBurn / 30));
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  return { months, days, isInfinite: false, isGrowing: false };
}

export function projectRunway(
  cashBalance: number,
  monthlyNetBurn: number,
  monthsToProject: number = 24
): ProjectedMonth[] {
  const projection: ProjectedMonth[] = [];
  const startDate = new Date();
  
  let currentBalance = cashBalance;

  for (let i = 0; i <= monthsToProject; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    const label = i === 0 ? 'Now' : i === 1 ? '1 mo' : `${i} mo`;
    
    projection.push({
      month: i,
      balance: Math.max(0, currentBalance),
      label,
      date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    });

    currentBalance -= monthlyNetBurn;
  }

  return projection;
}

export function applyScenarioCut(
  expenses: ExpenseItem[],
  cutPercentage: number
): ExpenseItem[] {
  const multiplier = 1 - cutPercentage / 100;
  return expenses.map((expense) => ({
    ...expense,
    amount: expense.amount * multiplier,
  }));
}

export function applySideHustle(
  incomes: IncomeItem[],
  monthlyAmount: number
): IncomeItem[] {
  if (monthlyAmount <= 0) {
    return incomes;
  }

  const sideHustle: IncomeItem = {
    id: 'scenario-side-hustle',
    name: 'Side Hustle (Scenario)',
    amount: monthlyAmount,
    frequency: 'monthly',
    isRecurring: true,
    createdAt: Date.now(),
  };

  return [...incomes, sideHustle];
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRunway(runway: RunwayResult): string {
  if (runway.isInfinite) {
    return 'Infinite';
  }
  if (runway.isGrowing) {
    return 'Growing';
  }
  if (runway.months > 100) {
    return '100+ months';
  }
  if (runway.days > 0 && runway.months === 0) {
    return `${runway.days} days`;
  }
  return `${runway.months} mo ${runway.days}d`;
}

export function getTotalCash(cashPositions: { amount: number }[]): number {
  return cashPositions.reduce((sum, pos) => sum + pos.amount, 0);
}

export function calculateNextBillingDate(dayOfMonth: number): string {
  const now = new Date();
  const currentDay = now.getDate();

  if (dayOfMonth > currentDay) {
    now.setDate(dayOfMonth);
  } else {
    now.setMonth(now.getMonth() + 1);
    now.setDate(dayOfMonth);
  }

  return now.toISOString().split('T')[0];
}

export function getDaysUntilBilling(billingDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const billing = new Date(billingDate);
  billing.setHours(0, 0, 0, 0);
  return Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}


export function getSubscriptionMetrics(expenses: any[]) {
  const active = expenses.filter(e => e.isRecurring && e.category === 'Subscription' && e.subscriptionStatus !== 'cancelled');
  const totalMonthly = active.reduce((sum, e) => sum + e.amount, 0);
  
  // Reuse getUpcomingPayments for the list
  const upcoming = getUpcomingPayments(expenses);
  
  return {
    activeCount: active.length,
    totalMonthly,
    upcomingPayments: upcoming
  };
}

export function getUpcomingPayments(expenses: ExpenseItem[], currentDate: Date = new Date()) {
  const sevenDaysFromNow = new Date(currentDate);
  sevenDaysFromNow.setDate(currentDate.getDate() + 7);

  return expenses
    .filter((e) => e.nextBillingDate && e.subscriptionStatus !== 'cancelled')
    .map((e) => ({
      item: e,
      date: new Date(e.nextBillingDate!),
    }))
    .filter((p) => {
      const d = p.date;
      d.setHours(0, 0, 0, 0);
      const today = new Date(currentDate);
      today.setHours(0, 0, 0, 0);
      return d >= today && d <= sevenDaysFromNow;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}