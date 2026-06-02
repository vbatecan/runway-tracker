import { useCallback, useMemo, useState } from "react";
import { useLocalStorage, generateId } from "@/hooks/useLocalStorage";
import type {
  ExpenseItem,
  IncomeItem,
  CashPosition,
  AppData,
  SupportedCurrency,
  SubscriptionStatus,
} from "@/types";
import {
  calculateBurnRate,
  calculateIncomeRate,
  calculateNetCashFlow,
  calculateRunway,
  projectRunway,
  getTotalCash,
} from "@/utils/calculations";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import DashboardView from "@/components/views/DashboardView";
import TransactionsView from "@/components/views/TransactionsView";
import SubscriptionsView from "@/components/views/SubscriptionsView";

const DEFAULT_DATA: AppData = {
  expenses: [
    {
      id: "demo-spotify",
      name: "Spotify Premium",
      amount: 149,
      frequency: "monthly",
      category: "Subscription",
      isRecurring: true,
      createdAt: Date.now(),
      billingDayOfMonth: 15,
      subscriptionStatus: "active",
    },
    {
      id: "demo-netflix",
      name: "Netflix",
      amount: 549,
      frequency: "monthly",
      category: "Subscription",
      isRecurring: true,
      createdAt: Date.now(),
      billingDayOfMonth: 1,
      subscriptionStatus: "active",
    },
    {
      id: "demo-rent",
      name: "Rent",
      amount: 18000,
      frequency: "monthly",
      category: "Rent",
      isRecurring: true,
      createdAt: Date.now(),
    },
  ],
  incomes: [
    {
      id: "demo-salary",
      name: "Monthly Salary",
      amount: 65000,
      frequency: "monthly",
      isRecurring: true,
      createdAt: Date.now(),
    },
  ],
  cashPositions: [
    {
      id: "demo-savings",
      amount: 150000,
      label: "Savings Account",
      createdAt: Date.now(),
    },
    {
      id: "demo-checking",
      amount: 45000,
      label: "Checking Account",
      createdAt: Date.now(),
    },
  ],
  settings: {
    currency: "PHP",
    theme: "light",
  },
};

export default function App() {
  const [data, setData] = useLocalStorage<AppData>(
    "runway-tracker-data",
    DEFAULT_DATA
  );
  const [currentView, setCurrentView] = useState("dashboard");

  const currency: SupportedCurrency = data.settings?.currency || "PHP";
  const expenses = data.expenses;
  const incomes = data.incomes;
  const cashPositions = data.cashPositions;

  const totalCash = useMemo(
    () => getTotalCash(cashPositions),
    [cashPositions]
  );
  const monthlyBurn = useMemo(
    () => calculateBurnRate(expenses),
    [expenses]
  );
  const monthlyIncome = useMemo(
    () => calculateIncomeRate(incomes),
    [incomes]
  );
  const netCashFlow = useMemo(
    () => calculateNetCashFlow(incomes, expenses),
    [incomes, expenses]
  );
  const runway = useMemo(
    () => calculateRunway(totalCash, netCashFlow),
    [totalCash, netCashFlow]
  );
  const baseProjection = useMemo(
    () => projectRunway(totalCash, netCashFlow, 24),
    [totalCash, netCashFlow]
  );

  const [editingItem, setEditingItem] = useState<{
    item: ExpenseItem | IncomeItem | null;
    type: "expense" | "income";
  }>({ item: null, type: "expense" });

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
      setData((prev) => ({
        ...prev,
        expenses: [...prev.expenses, expense],
      }));
    },
    [setData]
  );

  const handleAddIncome = useCallback(
    (income: IncomeItem) => {
      const newIncome: IncomeItem = {
        ...income,
        id: generateId(),
        createdAt: Date.now(),
      };
      setData((prev) => ({
        ...prev,
        incomes: [...prev.incomes, newIncome],
      }));
    },
    [setData]
  );

  const handleDeleteExpense = useCallback(
    (id: string) => {
      if (id.startsWith("scenario-")) return;
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
      }));
    },
    [setData]
  );

  const handleDeleteIncome = useCallback(
    (id: string) => {
      if (id.startsWith("scenario-")) return;
      setData((prev) => ({
        ...prev,
        incomes: prev.incomes.filter((i) => i.id !== id),
      }));
    },
    [setData]
  );

  const handleEditExpense = useCallback((expense: ExpenseItem) => {
    setEditingItem({ item: expense, type: "expense" });
  }, []);

  const handleEditIncome = useCallback((income: IncomeItem) => {
    setEditingItem({ item: income, type: "income" });
  }, []);

  const handleSaveExpense = useCallback(
    (updatedExpense: ExpenseItem) => {
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === updatedExpense.id ? updatedExpense : e
        ),
      }));
    },
    [setData]
  );

  const handleSaveIncome = useCallback(
    (updatedIncome: IncomeItem) => {
      setData((prev) => ({
        ...prev,
        incomes: prev.incomes.map((i) =>
          i.id === updatedIncome.id ? updatedIncome : i
        ),
      }));
    },
    [setData]
  );

  const handleToggleSubscriptionStatus = useCallback(
    (id: string, active: boolean) => {
      const newStatus: SubscriptionStatus = active ? "active" : "paused";
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === id ? { ...e, subscriptionStatus: newStatus } : e
        ),
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
      alert("Data imported successfully!");
    },
    [setData]
  );

  const viewTitle =
    currentView.charAt(0).toUpperCase() + currentView.slice(1);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentView={currentView} setView={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={viewTitle} />

        <main className="flex-1 p-6 overflow-auto">
          {currentView === "dashboard" && (
            <DashboardView
              expenses={expenses}
              currency={currency}
              runway={runway as any}
              totalCash={totalCash}
              monthlyBurn={monthlyBurn}
              monthlyIncome={monthlyIncome}
              netCashFlow={netCashFlow}
              baseProjection={baseProjection}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === "transactions" && (
            <TransactionsView
              data={data}
              currency={currency}
              expenses={expenses}
              incomes={incomes}
              cashPositions={cashPositions}
              onCurrencyChange={handleCurrencyChange}
              onAddExpense={handleAddExpense}
              onAddIncome={handleAddIncome}
              onDeleteExpense={handleDeleteExpense}
              onDeleteIncome={handleDeleteIncome}
              onEditExpense={handleEditExpense}
              onEditIncome={handleEditIncome}
              onSaveExpense={handleSaveExpense}
              onSaveIncome={handleSaveIncome}
              onAddCash={handleAddCash}
              onDeleteCash={handleDeleteCash}
              onImportData={handleImportData}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
            />
          )}
          {currentView === "subscriptions" && (
            <SubscriptionsView
              expenses={expenses}
              currency={currency}
              onToggleStatus={handleToggleSubscriptionStatus}
            />
          )}
          {currentView !== "dashboard" &&
            currentView !== "subscriptions" &&
            currentView !== "transactions" && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>View {currentView} is under construction</p>
              </div>
            )}
        </main>

        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Runway Tracker - Local-first expense tracking</p>
            <p className="mt-1">
              Your data is stored locally and never leaves your device.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}