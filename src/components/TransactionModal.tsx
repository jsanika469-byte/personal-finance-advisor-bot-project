import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Receipt } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  ExpenseItem,
  INCOME_SOURCES,
  IncomeItem,
  CurrencyCode,
} from '../types/finance';

export type ModalMode =
  | { type: 'add_income' }
  | { type: 'edit_income'; item: IncomeItem }
  | { type: 'add_expense' }
  | { type: 'edit_expense'; item: ExpenseItem }
  | null;

interface TransactionModalProps {
  mode: ModalMode;
  onClose: () => void;
  onSaveIncome: (income: Omit<IncomeItem, 'id'>, id?: string) => void;
  onSaveExpense: (expense: Omit<ExpenseItem, 'id'>, id?: string) => void;
  currency: CurrencyCode;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  mode,
  onClose,
  onSaveIncome,
  onSaveExpense,
  currency,
}) => {
  if (!mode) return null;

  const isIncome = mode.type === 'add_income' || mode.type === 'edit_income';
  const isEditing = mode.type === 'edit_income' || mode.type === 'edit_expense';

  // Income form state
  const [source, setSource] = useState('Salary');
  const [incomeNotes, setIncomeNotes] = useState('');

  // Expense form state
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState('');

  // Common form state
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (mode.type === 'edit_income') {
      setSource(mode.item.source);
      setAmount(mode.item.amount.toString());
      setDate(mode.item.date);
      setIncomeNotes(mode.item.notes || '');
    } else if (mode.type === 'edit_expense') {
      setCategory(mode.item.category);
      setDescription(mode.item.description);
      setAmount(mode.item.amount.toString());
      setDate(mode.item.date);
    } else {
      // Add defaults
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setIncomeNotes('');
      setSource('Salary');
      setCategory('Food');
    }
    setError('');
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    if (isIncome) {
      if (!source.trim()) {
        setError('Please specify an income source.');
        return;
      }
      const existingId = mode.type === 'edit_income' ? mode.item.id : undefined;
      onSaveIncome(
        {
          source: source.trim(),
          amount: numAmount,
          date,
          notes: incomeNotes.trim() || undefined,
        },
        existingId
      );
    } else {
      if (!description.trim()) {
        setError('Please enter a brief expense description.');
        return;
      }
      const existingId = mode.type === 'edit_expense' ? mode.item.id : undefined;
      onSaveExpense(
        {
          category,
          description: description.trim(),
          amount: numAmount,
          date,
        },
        existingId
      );
    }

    onClose();
  };

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {isIncome ? <TrendingUp className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEditing ? (isIncome ? 'Edit Income Entry' : 'Edit Expense Entry') : (isIncome ? 'Add New Income' : 'Record New Expense')}
              </h2>
              <p className="text-xs text-slate-500">
                {isIncome ? 'Log your earnings and deposits' : 'Categorize your spending accurately'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Income Source or Expense Category */}
          {isIncome ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Income Source <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {INCOME_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom source (e.g. Tutoring, Hackathon Prize)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Expense Description */}
          {!isIncome && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Groceries, Semester Textbooks, Subway card"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none"
              />
            </div>
          )}

          {/* Amount and Date in a 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Income Notes */}
          {isIncome && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Direct deposit from campus student services"
                value={incomeNotes}
                onChange={(e) => setIncomeNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs ${
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isEditing ? 'Save Changes' : isIncome ? 'Save Income' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
