import { useState } from 'react';
import { ExpenseItem, IncomeItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';
import { Trash2, TrendingDown, TrendingUp, Filter, Edit2 } from 'lucide-react';
import type { SupportedCurrency } from '@/types';
import { getDaysUntilBilling } from '@/utils/calculations';

interface TransactionListProps {
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onEditIncome: (income: IncomeItem) => void;
  currency?: SupportedCurrency;
}

const categoryColors: Record<string, string> = {
  Subscription: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Rent: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Utilities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Food: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Transport: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  Insurance: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  Software: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const frequencyLabels: Record<string, string> = {
  weekly: '/wk',
  monthly: '/mo',
  yearly: '/yr',
  'one-time': 'once',
};

export function TransactionList({
  expenses,
  incomes,
  onDeleteExpense,
  onDeleteIncome,
  onEditExpense,
  onEditIncome,
  currency = 'PHP',
}: TransactionListProps) {
  const [filter, setFilter] = useState<'all' | 'subscriptions' | 'income'>('all');

  const filteredExpenses = filter === 'subscriptions' 
    ? expenses.filter(e => e.category === 'Subscription')
    : expenses;

  const filteredIncomes = filter === 'income' 
    ? incomes 
    : filter === 'subscriptions' ? [] : incomes;

  const sortedExpenses = [...filteredExpenses].sort((a, b) => b.createdAt - a.createdAt);
  const sortedIncomes = [...filteredIncomes].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" /> Transactions
        </h2>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button 
            variant={filter === 'all' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'subscriptions' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setFilter('subscriptions')}
          >
            Subs
          </Button>
          <Button 
            variant={filter === 'income' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setFilter('income')}
          >
            Income
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Expenses ({filteredExpenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No expenses found.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedExpenses.map((expense) => {
                  const daysUntil = expense.nextBillingDate ? getDaysUntilBilling(expense.nextBillingDate) : null;
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{expense.name}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${categoryColors[expense.category] || categoryColors.Other}`}
                          >
                            {expense.category}
                          </Badge>
                          {daysUntil !== null && (
                            <Badge variant="outline" className={`text-[10px] ${daysUntil <= 7 ? 'text-red-500 border-red-200' : 'text-muted-foreground'}`}>
                              {daysUntil === 0 ? 'Due Today' : `Due in ${daysUntil}d`}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {frequencyLabels[expense.frequency] || ''}
                          {expense.subscriptionStatus && ` • ${expense.subscriptionStatus}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="font-semibold text-sm text-red-500">
                          -{formatCurrency(expense.amount, currency)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                            onClick={() => onEditExpense(expense)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incomes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Income ({filteredIncomes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedIncomes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No income found.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedIncomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm truncate block">{income.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {frequencyLabels[income.frequency] || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-semibold text-sm text-green-600 dark:text-green-400">
                        +{formatCurrency(income.amount, currency)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                          onClick={() => onEditIncome(income)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteIncome(income.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}