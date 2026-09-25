import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import {
  CurrencyCode,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  ExpenseItem,
} from '../types/finance';
import { formatCurrency, formatDateDisplay } from '../utils/storage';

interface ExpenseViewProps {
  expenses: ExpenseItem[];
  currency: CurrencyCode;
  onOpenAddExpense: () => void;
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string, description: string) => void;
}

const CATEGORY_STYLES: Record<ExpenseCategory, { bg: string; text: string; dot: string }> = {
  Food: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500' },
  Education: { bg: 'bg-blue-50', text: 'text-blue-800', dot: 'bg-blue-500' },
  Transport: { bg: 'bg-purple-50', text: 'text-purple-800', dot: 'bg-purple-500' },
  Shopping: { bg: 'bg-pink-50', text: 'text-pink-800', dot: 'bg-pink-500' },
  Bills: { bg: 'bg-rose-50', text: 'text-rose-800', dot: 'bg-rose-500' },
  Entertainment: { bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  Healthcare: { bg: 'bg-cyan-50', text: 'text-cyan-800', dot: 'bg-cyan-500' },
  Other: { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' },
};

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  expenses,
  currency,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Compute category breakdown
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
    const sum = expenses
      .filter((e) => e.category === cat)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return {
      category: cat,
      amount: sum,
      pct: totalExpenses > 0 ? (sum / totalExpenses) * 100 : 0,
    };
  }).filter((c) => c.amount > 0);

  const filteredExpenses = expenses
    .filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Top Summary & Action Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Expenses</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalExpenses, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automatically computed across {expenses.length} transactions
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Spend Categories</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {categoryTotals.length} / {EXPENSE_CATEGORIES.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {categoryTotals.length > 0 ? `Top: ${categoryTotals.sort((a,b)=>b.amount-a.amount)[0]?.category}` : 'No active categories'}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Track Outflows</span>
            <p className="mt-1 text-xs text-slate-600">
              Record meals, textbooks, rent, transit, and student supplies.
            </p>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {EXPENSE_CATEGORIES.map((cat) => {
          const count = expenses.filter((e) => e.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${CATEGORY_STYLES[cat].dot}`}
              />
              <span>{cat}</span>
              <span className="text-[11px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Expense History Table */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Expense History</h2>
            <span className="text-xs text-slate-500">
              ({filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search description, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:border-slate-800 focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredExpenses.map((item) => {
                  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['Other'];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatDateDisplay(item.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${style.bg} ${style.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-sm truncate">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono tabular-nums whitespace-nowrap">
                        -{formatCurrency(item.amount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditExpense(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(item.id, item.description)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            {searchTerm || selectedCategory !== 'All'
              ? 'No expense records found matching current filters.'
              : 'No expenses logged yet.'}
          </div>
        )}
      </div>
    </div>
  );
};
