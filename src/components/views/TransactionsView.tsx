import { ExpenseItem, IncomeItem, CashPosition, SupportedCurrency, AppData } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionList } from '@/components/TransactionList';
import { CashInput } from '@/components/CashInput';
import { CurrencySelector } from '@/components/CurrencySelector';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { DataExport } from '@/components/DataExport';
import { EditTransactionDialog } from '@/components/EditTransactionDialog';
import { AdPlaceholder } from '@/components/AdPlaceholder';

interface TransactionsViewProps {
  data: AppData;
  currency: SupportedCurrency;
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  cashPositions: CashPosition[];
  onCurrencyChange: (newCurrency: SupportedCurrency) => void;
  onAddExpense: (expense: ExpenseItem) => void;
  onAddIncome: (income: IncomeItem) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onEditIncome: (income: IncomeItem) => void;
  onSaveExpense: (updatedExpense: ExpenseItem) => void;
  onSaveIncome: (updatedIncome: IncomeItem) => void;
  onAddCash: (amount: number, label: string) => void;
  onDeleteCash: (id: string) => void;
  onImportData: (importedData: AppData) => void;
  editingItem: { item: ExpenseItem | IncomeItem | null; type: 'expense' | 'income' };
  setEditingItem: (item: { item: ExpenseItem | IncomeItem | null; type: 'expense' | 'income' }) => void;
}

export default function TransactionsView({
  data,
  currency,
  expenses,
  incomes,
  cashPositions,
  onCurrencyChange,
  onAddExpense,
  onAddIncome,
  onDeleteExpense,
  onDeleteIncome,
  onEditExpense,
  onEditIncome,
  onSaveExpense,
  onSaveIncome,
  onAddCash,
  onDeleteCash,
  onImportData,
  editingItem,
  setEditingItem,
}: TransactionsViewProps) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <TransactionList
          expenses={expenses}
          incomes={incomes}
          onDeleteExpense={onDeleteExpense}
          onDeleteIncome={onDeleteIncome}
          onEditExpense={onEditExpense}
          onEditIncome={onEditIncome}
          currency={currency}
        />
        <DataExport data={data} onImport={onImportData} />
      </div>

      <div className="space-y-6">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add New</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AddExpenseDialog onAdd={onAddExpense} type="expense" />
            <AddExpenseDialog onAdd={onAddIncome} type="income" />
          </CardContent>
        </Card>

        <CashInput
          cashPositions={cashPositions}
          onAdd={onAddCash}
          onDelete={onDeleteCash}
        />
        
        <EditTransactionDialog
          open={!!editingItem.item}
          onOpenChange={(open) => {
            if (!open) setEditingItem({ item: null, type: 'expense' });
          }}
          item={editingItem.item}
          type={editingItem.type}
          onSave={editingItem.type === 'expense' ? (item) => onSaveExpense(item as ExpenseItem) : onSaveIncome}
          onDelete={editingItem.type === 'expense' ? onDeleteExpense : onDeleteIncome}
        />

        <AdPlaceholder size="sidebar" />
        <AdPlaceholder size="tall-sidebar" />
      </div>
    </div>
  );
}
