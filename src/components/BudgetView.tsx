import React, { useState } from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Save,
  ShieldCheck,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  BudgetConfig,
  CurrencyCode,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  ExpenseItem,
} from '../types/finance';
import { formatCurrency } from '../utils/storage';

interface BudgetViewProps {
  budget: BudgetConfig;
  expenses: ExpenseItem[];
  currency: CurrencyCode;
  onUpdateBudget: (newBudget: BudgetConfig) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  expenses,
  currency,
  onUpdateBudget,
}) => {
  const [monthlyLimitInput, setMonthlyLimitInput] = useState<string>(
    budget.monthlyBudget ? budget.monthlyBudget.toString() : ''
  );
  const [categoryInputs, setCategoryInputs] = useState<Partial<Record<ExpenseCategory, string>>>(() => {
    const initial: Partial<Record<ExpenseCategory, string>> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      if (budget.categoryBudgets && budget.categoryBudgets[cat] !== undefined) {
        initial[cat] = budget.categoryBudgets[cat]!.toString();
      }
    });
    return initial;
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  // Calculations
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const monthlyLimit = budget.monthlyBudget || 0;
  const remainingBudget = monthlyLimit - totalSpent;
  const percentageUsed = monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0;
  const isExceeded = totalSpent > monthlyLimit && monthlyLimit > 0;
  const isClose = !isExceeded && percentageUsed >= 80 && monthlyLimit > 0;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newMonthly = parseFloat(monthlyLimitInput) || 0;

    const newCategoryBudgets: Partial<Record<ExpenseCategory, number>> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      const val = parseFloat(categoryInputs[cat] || '');
      if (!isNaN(val) && val > 0) {
        newCategoryBudgets[cat] = val;
      }
    });

    onUpdateBudget({
      monthlyBudget: Math.max(0, newMonthly),
      categoryBudgets: newCategoryBudgets,
    });

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleCategoryInputChange = (cat: ExpenseCategory, value: string) => {
    setCategoryInputs((prev) => ({
      ...prev,
      [cat]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner for Budget Status */}
      {isExceeded && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-rose-900">Monthly Budget Exceeded!</h4>
            <p className="mt-0.5 text-rose-700">
              Total expenses ({formatCurrency(totalSpent, currency)}) have exceeded your planned limit of{' '}
              {formatCurrency(monthlyLimit, currency)} by{' '}
              <span className="font-semibold underline">
                {formatCurrency(totalSpent - monthlyLimit, currency)}
              </span>
              . Immediate curtailment of discretionary expenses (entertainment, dining out, shopping) is recommended.
            </p>
          </div>
        </div>
      )}

      {isClose && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-900">Approaching Budget Limit ({percentageUsed.toFixed(1)}%)</h4>
            <p className="mt-0.5 text-amber-700">
              You have used more than 80% of your planned monthly budget. You only have{' '}
              <span className="font-semibold">{formatCurrency(remainingBudget, currency)}</span> remaining for
              additional expenses.
            </p>
          </div>
        </div>
      )}

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Monthly Budget</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(monthlyLimit, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Planned spending cap</p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Amount Spent</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalSpent, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {percentageUsed.toFixed(1)}% of total budget used
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Remaining Budget</span>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatCurrency(remainingBudget, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {remainingBudget >= 0 ? 'Available for rest of month' : 'Amount overplanned'}
          </p>
        </div>
      </div>

      {/* Main Budget Meter Card */}
      <div className="rounded-xl bg-white p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Budget Consumption Meter</h3>
            <p className="text-xs text-slate-500">Live pacing of your recorded outlays against monthly limit</p>
          </div>
          <span
            className={`self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-md ${
              isExceeded
                ? 'bg-rose-100 text-rose-800'
                : isClose
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {isExceeded
              ? 'Exceeded Budget'
              : isClose
              ? 'Caution: >80% Used'
              : 'Healthy Pacing (<80%)'}
          </span>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-slate-600 font-mono tabular-nums">
            <span>0%</span>
            <span>50%</span>
            <span className="text-amber-600 font-semibold">80% (Warning)</span>
            <span className="text-rose-600 font-semibold">100% (Limit)</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExceeded
                  ? 'bg-rose-600'
                  : isClose
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentageUsed)}%` }}
            />
            {/* 80% marker line */}
            <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-amber-400/80 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Set / Update Budget Form */}
      <div className="rounded-xl bg-white p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Set Monthly Budget & Limits</h3>
            <p className="text-xs text-slate-500">
              Customize your overarching monthly spending ceiling and category targets
            </p>
          </div>
          {savedFeedback && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Budget Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBudget} className="mt-5 space-y-6">
          {/* Overarching Monthly Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Overall Monthly Budget Cap ({currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'})
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400">
                  {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                </span>
                <input
                  type="number"
                  step="10"
                  min="0"
                  placeholder="e.g. 1500"
                  value={monthlyLimitInput}
                  onChange={(e) => setMonthlyLimitInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Budget</span>
              </button>
            </div>
          </div>

          {/* Category Budgets Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-700">Category Budgets (Optional)</h4>
                <p className="text-[11px] text-slate-500">
                  Allocate specific budgets to categories to monitor spending per area
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EXPENSE_CATEGORIES.map((cat) => {
                const catSpent = expenses
                  .filter((e) => e.category === cat)
                  .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                const limit = parseFloat(categoryInputs[cat] || '0') || 0;
                const catPct = limit > 0 ? (catSpent / limit) * 100 : 0;
                const isCatOver = limit > 0 && catSpent > limit;

                return (
                  <div
                    key={cat}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{cat}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Spent: {formatCurrency(catSpent, currency)}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[11px] text-slate-400">
                        {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Limit"
                        value={categoryInputs[cat] || ''}
                        onChange={(e) => handleCategoryInputChange(cat, e.target.value)}
                        className="w-full rounded border border-slate-300 pl-6 pr-2 py-1 text-xs font-mono tabular-nums bg-white text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    {limit > 0 && (
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>{catPct.toFixed(0)}% used</span>
                          <span className={isCatOver ? 'text-rose-600 font-semibold' : ''}>
                            {isCatOver ? 'Over Limit' : 'Within Cap'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCatOver ? 'bg-rose-500' : catPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, catPct)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
