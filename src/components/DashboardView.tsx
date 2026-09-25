import React from 'react';
import {
  TrendingUp,
  Receipt,
  Wallet,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PieChart,
  Calendar,
} from 'lucide-react';
import { ActiveTab, CurrencyCode, FinanceData } from '../types/finance';
import { calculateMetrics } from '../utils/calculations';
import { formatCurrency, formatDateDisplay } from '../utils/storage';
import { generateRecommendations } from '../utils/advisorEngine';

interface DashboardViewProps {
  data: FinanceData;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  currency: CurrencyCode;
}

// Category palette mapping for clean, consistent visuals
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F59E0B', // Amber
  Education: '#3B82F6', // Blue
  Transport: '#8B5CF6', // Purple
  Shopping: '#EC4899', // Pink
  Bills: '#EF4444', // Red
  Entertainment: '#10B981', // Emerald
  Healthcare: '#06B6D4', // Cyan
  Other: '#64748B', // Slate
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  setActiveTab,
  onOpenAddIncome,
  onOpenAddExpense,
  currency,
}) => {
  const metrics = calculateMetrics(data);
  const recommendations = generateRecommendations(data);
  const topRecommendation = recommendations[0];

  // Merge recent transactions from both income and expenses
  const allTransactions = [
    ...data.incomes.map((inc) => ({
      id: inc.id,
      date: inc.date,
      title: inc.source,
      category: 'Income',
      amount: inc.amount,
      isIncome: true,
    })),
    ...data.expenses.map((exp) => ({
      id: exp.id,
      date: exp.date,
      title: exp.description,
      category: exp.category,
      amount: exp.amount,
      isIncome: false,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentTransactions = allTransactions.slice(0, 5);

  // SVG Chart: Income vs Expenses values
  const maxBarValue = Math.max(metrics.totalIncome, metrics.totalExpenses, metrics.budgetStatus.monthlyBudget, 100);
  const incomeHeightPct = (metrics.totalIncome / maxBarValue) * 100;
  const expenseHeightPct = (metrics.totalExpenses / maxBarValue) * 100;
  const budgetHeightPct = (metrics.budgetStatus.monthlyBudget / maxBarValue) * 100;

  return (
    <div className="space-y-6">
      {/* Top 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Income</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(metrics.totalIncome, currency)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {data.incomes.length} recorded {data.incomes.length === 1 ? 'source' : 'sources'}
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Expenses</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(metrics.totalExpenses, currency)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {data.expenses.length} transactions logged
            </p>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Remaining Balance</span>
            <div
              className={`rounded-lg p-2 ${
                metrics.remainingBalance >= 0 ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
                metrics.remainingBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(metrics.remainingBalance, currency)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {metrics.remainingBalance >= 0 ? 'Net positive cash flow' : 'Deficit across recorded period'}
            </p>
          </div>
        </div>

        {/* Total Savings */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Savings</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(metrics.totalSavings, currency)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Across {data.savingsGoals.length} savings goals
            </p>
          </div>
        </div>
      </div>

      {/* AI Advisor Insight Bar */}
      {topRecommendation && (
        <div
          onClick={() => setActiveTab('advisor')}
          className="group cursor-pointer rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-4 border border-emerald-200/70 hover:border-emerald-300 transition-all shadow-2xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    AI Advisor Insight
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-100/60 px-2 py-0.5 rounded">
                    {topRecommendation.title}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5 line-clamp-2">
                  {topRecommendation.message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 shrink-0 self-end sm:self-auto group-hover:translate-x-0.5 transition-transform">
              <span>Open Advisor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* Budget Status Banner */}
      <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Monthly Budget Pacing</h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  metrics.budgetStatus.isExceeded
                    ? 'bg-rose-100 text-rose-800'
                    : metrics.budgetStatus.isWarning
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {metrics.budgetStatus.statusText}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {metrics.budgetStatus.monthlyBudget > 0
                ? `Spent ${formatCurrency(metrics.budgetStatus.spent, currency)} of ${formatCurrency(
                    metrics.budgetStatus.monthlyBudget,
                    currency
                  )} monthly cap`
                : 'No monthly budget defined yet'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('budget')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 self-start sm:self-auto inline-flex items-center gap-1"
          >
            <span>Manage Budget</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {metrics.budgetStatus.monthlyBudget > 0 ? (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>{metrics.budgetStatus.percentageUsed.toFixed(1)}% Used</span>
              <span>
                {metrics.budgetStatus.remaining >= 0
                  ? `${formatCurrency(metrics.budgetStatus.remaining, currency)} Remaining`
                  : `${formatCurrency(Math.abs(metrics.budgetStatus.remaining), currency)} Over Budget`}
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.budgetStatus.isExceeded
                    ? 'bg-rose-600'
                    : metrics.budgetStatus.isWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, metrics.budgetStatus.percentageUsed)}%` }}
              />
            </div>
            {metrics.budgetStatus.isWarning && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 mt-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>You have crossed 80% of your planned budget. Pacing spending is recommended.</span>
              </div>
            )}
            {metrics.budgetStatus.isExceeded && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 mt-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Expenses have surpassed your planned monthly budget limit.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600">Set a monthly limit to track your spending pacing accurately.</span>
            <button
              onClick={() => setActiveTab('budget')}
              className="px-3 py-1 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800"
            >
              Set Budget
            </button>
          </div>
        )}
      </div>

      {/* Visual Charts: 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Income vs Expenses vs Budget Comparison */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Cash Flow Comparison</h3>
              <p className="text-xs text-slate-500">Income vs Expenses vs Budget</p>
            </div>
            <div className="text-xs text-slate-500 font-mono tabular-nums">
              Ratio: {metrics.totalIncome > 0 ? ((metrics.totalExpenses / metrics.totalIncome) * 100).toFixed(0) : 0}%
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-end space-y-4">
            {/* Visual Comparative Bars */}
            <div className="space-y-4">
              {/* Income Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                    Total Income
                  </span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {formatCurrency(metrics.totalIncome, currency)}
                  </span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-md overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-xs transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white font-mono"
                    style={{ width: `${Math.max(4, Math.min(100, incomeHeightPct))}%` }}
                  >
                    {incomeHeightPct > 20 ? `${incomeHeightPct.toFixed(0)}%` : ''}
                  </div>
                </div>
              </div>

              {/* Expense Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
                    Total Expenses
                  </span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {formatCurrency(metrics.totalExpenses, currency)}
                  </span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-md overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rose-500 rounded-xs transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white font-mono"
                    style={{ width: `${Math.max(4, Math.min(100, expenseHeightPct))}%` }}
                  >
                    {expenseHeightPct > 20 ? `${expenseHeightPct.toFixed(0)}%` : ''}
                  </div>
                </div>
              </div>

              {/* Monthly Budget Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-600"></span>
                    Planned Budget
                  </span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {formatCurrency(metrics.budgetStatus.monthlyBudget, currency)}
                  </span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-md overflow-hidden p-0.5">
                  <div
                    className="h-full bg-slate-600 rounded-xs transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white font-mono"
                    style={{ width: `${Math.max(4, Math.min(100, budgetHeightPct))}%` }}
                  >
                    {budgetHeightPct > 20 ? `${budgetHeightPct.toFixed(0)}%` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Summary Metric */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Net Surplus</span>
                <span className="font-semibold text-emerald-700 font-mono tabular-nums text-sm">
                  {formatCurrency(Math.max(0, metrics.remainingBalance), currency)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Savings Rate</span>
                <span className="font-semibold text-indigo-700 font-mono tabular-nums text-sm">
                  {metrics.netSavingsRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Expense Categories Breakdown */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Expense Categories</h3>
              <p className="text-xs text-slate-500">Distribution across active spend buckets</p>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </button>
          </div>

          {metrics.totalExpenses > 0 ? (
            <div className="mt-4 space-y-3">
              {/* Stacked Percentage Bar */}
              <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden flex">
                {metrics.categorySummaries
                  .filter((cat) => cat.amount > 0)
                  .map((cat) => (
                    <div
                      key={cat.category}
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[cat.category] || '#64748B',
                      }}
                      title={`${cat.category}: ${formatCurrency(cat.amount, currency)} (${cat.percentage.toFixed(1)}%)`}
                      className="h-full transition-all hover:opacity-85"
                    />
                  ))}
              </div>

              {/* Category Breakdown Rows */}
              <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
                {metrics.categorySummaries.map((cat) => {
                  if (cat.amount === 0) return null;
                  const color = CATEGORY_COLORS[cat.category] || '#64748B';
                  return (
                    <div key={cat.category} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-slate-700">{cat.category}</span>
                        <span className="text-[11px] text-slate-400">({cat.count} items)</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono tabular-nums">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(cat.amount, currency)}
                        </span>
                        <span className="text-slate-500 text-[11px] w-10 text-right">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No expenses recorded yet. Use "+ Add Expense" to populate categories.
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest entries across incomes and expenditures</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 mt-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      tx.isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tx.isIncome ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <Receipt className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{tx.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{tx.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateDisplay(tx.date)}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-xs font-bold font-mono tabular-nums ${
                    tx.isIncome ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {tx.isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No transactions found. Log your first income or expense to get started.
          </div>
        )}
      </div>
    </div>
  );
};
