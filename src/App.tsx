import { useCallback, useMemo, useState } from 'react';
import { useLocalStorage, generateId } from '@/hooks/useLocalStorage';
import {
  ExpenseItem,
  IncomeItem,
  CashPosition,
  AppData,
  SupportedCurrency,
} from '@/types';
import {
  calculateBurnRate,
  calculateIncomeRate,
  calculateNetCashFlow,
  calculateRunway,
  projectRunway,
  getTotalCash,
} from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';
import { RunwayCounter } from '@/components/RunwayCounter';
import { RunwayChart } from '@/components/RunwayChart';
import { TransactionList } from '@/components/TransactionList';
import { CashInput } from '@/components/CashInput';
import { CurrencySelector } from '@/components/CurrencySelector';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { DataExport } from '@/components/DataExport';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { SubscriptionOverview } from '@/components/SubscriptionOverview';
import { EditTransactionDialog } from '@/components/EditTransactionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Calculator, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const DEFAULT_DATA: AppData = {
  expenses: [
    {
      id: 'demo-spotify',
      name: 'Spotify Premium',
      amount: 149,
      frequency: 'monthly',
      category: 'Subscription',
      isRecurring: true,
      createdAt: Date.now(),
      billingDayOfMonth: 15,
      subscriptionStatus: 'active',
    },
    {
      id: 'demo-netflix',
      name: 'Netflix',
      amount: 549,
      frequency: 'monthly',
      category: 'Subscription',
      isRecurring: true,
      createdAt: Date.now(),
      billingDayOfMonth: 1,
      subscriptionStatus: 'active',
    },
    {
      id: 'demo-rent',
      name: 'Rent',
      amount: 18000,
      frequency: 'monthly',
      category: 'Rent',
      isRecurring: true,
      createdAt: Date.now(),
    },
  ],
  incomes: [
    {
      id: 'demo-salary',
      name: 'Monthly Salary',
      amount: 65000,
      frequency: 'monthly',
      isRecurring: true,
      createdAt: Date.now(),
    },
  ],
  cashPositions: [
    {
      id: 'demo-savings',
      amount: 150000,
      label: 'Savings Account',
      createdAt: Date.now(),
    },
    {
      id: 'demo-checking',
      amount: 45000,
      label: 'Checking Account',
      createdAt: Date.now(),
    },
  ],
  settings: {
    currency: 'PHP',
    theme: 'light',
  },
};

export default function App() {
  const [data, setData] = useLocalStorage<AppData>('runway-tracker-data', DEFAULT_DATA);

  const currency: SupportedCurrency = data.settings?.currency || 'PHP';

  const expenses = data.expenses;
  const incomes = data.incomes;
  const cashPositions = data.cashPositions;

  const totalCash = useMemo(() => getTotalCash(cashPositions), [cashPositions]);
  const monthlyBurn = useMemo(() => calculateBurnRate(expenses), [expenses]);
  const monthlyIncome = useMemo(() => calculateIncomeRate(incomes), [incomes]);
  const netCashFlow = useMemo(() => calculateNetCashFlow(incomes, expenses), [incomes, expenses]);
  const runway = useMemo(() => calculateRunway(totalCash, netCashFlow), [totalCash, netCashFlow]);
  const baseProjection = useMemo(
    () => projectRunway(totalCash, netCashFlow, 24),
    [totalCash, netCashFlow]
  );

  const [editingItem, setEditingItem] = useState<{
    item: ExpenseItem | IncomeItem | null;
    type: 'expense' | 'income';
  }>({
    item: null,
    type: 'expense',
  });

  const handleCurrencyChange = useCallback(
    (newCurrency: SupportedCurrency) => {
      setData((prev) => ({
        ...prev,
        settings: { ...prev.settings, currency: newCurrency },
      }));
    },
    [setData]
  );

  const handleAddExpense = useCallback(
    (expense: ExpenseItem) => {
      setData((prev) => ({ ...prev, expenses: [...prev.expenses, expense] }));
    },
    [setData]
  );

  const handleAddIncome = useCallback(
    (income: IncomeItem) => {
      const newIncome: IncomeItem = { ...income, id: generateId(), createdAt: Date.now() };
      setData((prev) => ({ ...prev, incomes: [...prev.incomes, newIncome] }));
    },
    [setData]
  );

  const handleDeleteExpense = useCallback(
    (id: string) => {
      if (id.startsWith('scenario-')) return;
      setData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
    },
    [setData]
  );

  const handleDeleteIncome = useCallback(
    (id: string) => {
      if (id.startsWith('scenario-')) return;
      setData((prev) => ({ ...prev, incomes: prev.incomes.filter((i) => i.id !== id) }));
    },
    [setData]
  );

  const handleEditExpense = useCallback(
    (expense: ExpenseItem) => {
      setEditingItem({ item: expense, type: 'expense' });
    },
    []
  );

  const handleEditIncome = useCallback(
    (income: IncomeItem) => {
      setEditingItem({ item: income, type: 'income' });
    },
    []
  );

  const handleSaveExpense = useCallback(
    (updatedExpense: ExpenseItem) => {
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)),
      }));
    },
    [setData]
  );

  const handleSaveIncome = useCallback(
    (updatedIncome: IncomeItem) => {
      setData((prev) => ({
        ...prev,
        incomes: prev.incomes.map((i) => (i.id === updatedIncome.id ? updatedIncome : i)),
      }));
    },
    [setData]
  );

  const handleAddCash = useCallback(
    (amount: number, label: string) => {
      const newPosition: CashPosition = {
        id: generateId(),
        amount,
        label,
        createdAt: Date.now(),
      };
      setData((prev) => ({
        ...prev,
        cashPositions: [...prev.cashPositions, newPosition],
      }));
    },
    [setData]
  );

  const handleDeleteCash = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        cashPositions: prev.cashPositions.filter((c) => c.id !== id),
      }));
    },
    [setData]
  );

  const handleImportData = useCallback(
    (importedData: AppData) => {
      setData(importedData);
      alert('Data imported successfully!');
    },
    [setData]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Leaderboard Ad - Top Banner */}
      <div className="hidden lg:block lg:py-2 lg:px-4">
        <AdPlaceholder size="leaderboard" className="mx-auto max-w-[728px]" />
      </div>

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Runway Tracker</h1>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Know exactly how long your money will last
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Runway Counter - Full Width Hero */}
        <section className="mb-6">
          <RunwayCounter
            runway={runway}
            currentCash={totalCash}
            monthlyBurn={Math.abs(netCashFlow)}
            currency={currency}
          />
        </section>

        {/* Two Column Layout: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Main Content (3/4 width on desktop) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Row */}
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
                  <p
                    className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {netCashFlow >= 0 ? '+' : ''}
                    {formatCurrency(netCashFlow, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Hub - New Section */}
            <SubscriptionOverview expenses={expenses} currency={currency} />

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">24-Month Cash Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <RunwayChart data={baseProjection} currency={currency} />
              </CardContent>
            </Card>

            {/* Transactions */}
            <TransactionList
              expenses={expenses}
              incomes={incomes}
              onDeleteExpense={handleDeleteExpense}
              onDeleteIncome={handleDeleteIncome}
              onEditExpense={handleEditExpense}
              onEditIncome={handleEditIncome}
              currency={currency}
            />

            {/* Data Export */}
            <DataExport data={data} onImport={handleImportData} />
          </div>

          {/* Right: Sidebar Ads + Add Forms (1/4 width on desktop) */}
          <div className="space-y-6">
            {/* Currency Selector */}
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />

            {/* Add Buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add New</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AddExpenseDialog onAdd={handleAddExpense} type="expense" />
                <AddExpenseDialog onAdd={handleAddIncome} type="income" />
              </CardContent>
            </Card>

            {/* Cash Input */}
            <CashInput
              cashPositions={cashPositions}
              onAdd={handleAddCash}
              onDelete={handleDeleteDeleteCash}
              currency={currency}
            />
            
            {/* Edit Dialog - Shared for both types */}
            <EditTransactionDialog
              open={!!editingItem.item}
              onOpenChange={(open) => {
                if (!open) setEditingItem({ item: null, type: 'expense' });
              }}
              item={editingItem.item}
              type={editingItem.type}
              onSave={editingItem.type === 'expense' ? handleSaveExpense : handleSaveIncome}
              onDelete={editingItem.type === 'expense' ? handleDeleteExpense : handleDeleteIncome}
            />

            {/* Sidebar Ad */}
            <AdPlaceholder size="sidebar" />

            {/* Tall Sidebar Ad (below) */}
            <AdPlaceholder size="tall-sidebar" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Runway Tracker - Local-first expense tracking</p>
          <p className="mt-1">Your data is stored locally and never leaves your device.</p>
        </div>
      </footer>
    </div>
  );
}