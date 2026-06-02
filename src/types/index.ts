export type Frequency = 'weekly' | 'monthly' | 'yearly' | 'one-time';

export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  isRecurring: boolean;
  createdAt: number;
  billingDayOfMonth?: number;
  nextBillingDate?: string;
  subscriptionStatus?: SubscriptionStatus;
}

export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  isRecurring: boolean;
  createdAt: number;
}

export interface CashPosition {
  id: string;
  amount: number;
  label: string;
  createdAt: number;
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP' | 'INR' | 'IDR' | 'SGD' | 'AUD' | 'CAD';

export interface CurrencyInfo {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateToPHP: number; // How many PHP per 1 unit of this currency
}

export interface AppSettings {
  currency: SupportedCurrency;
  theme: 'light' | 'dark';
}

export interface AppData {
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  cashPositions: CashPosition[];
  settings: AppSettings;
}

export interface RunwayResult {
  months: number;
  days: number;
  isInfinite: boolean;
  isGrowing: boolean;
}

export interface ProjectedMonth {
  month: number;
  balance: number;
  label: string;
  date: string;
}