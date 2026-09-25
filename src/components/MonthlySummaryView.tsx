import React from 'react';
import {
  CalendarCheck,
  TrendingUp,
  Receipt,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  PieChart,
} from 'lucide-react';
import { CurrencyCode, FinanceData } from '../types/finance';
import { calculateMetrics } from '../utils/calculations';
import { formatCurrency } from '../utils/storage';

interface MonthlySummaryViewProps {
  data: FinanceData;
  currency: CurrencyCode;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({ data, currency }) => {
  const metrics = calculateMetrics(data);
  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Evaluation narrative
  let healthSummary = '';
  if (metrics.remainingBalance > 0 && !metrics.budgetStatus.isExceeded) {
    healthSummary = 'Excellent cash flow discipline. Income exceeds expenses, budget targets are respected, and surplus is available for savings.';
  } else if (metrics.budgetStatus.isExceeded) {
    healthSummary = 'Caution: Recorded expenditures have surpassed the planned budget ceiling. Rebalancing high-spending categories is advised.';
  } else if (metrics.remainingBalance < 0) {
    healthSummary = 'Alert: Deficit cash flow detected where expenses exceed total recorded earnings. Urgent spending rationalization recommended.';
  } else {
    healthSummary = 'Balanced cash flow with moderate financial pacing. Continue monitoring ongoing outlays.';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Month & Actions Banner */}
      <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Monthly Financial Statement: {currentMonthName}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic analysis of cash flow, budget containment, and goal progress
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Print / Export Statement</span>
        </button>
      </div>

      {/* Core Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Income</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(metrics.totalIncome, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Gross inflows</p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Expenses</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(metrics.totalExpenses, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Cumulative spending</p>
        </div>

        {/* Net Balance */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Net Balance</span>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              metrics.remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {formatCurrency(metrics.remainingBalance, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {metrics.remainingBalance >= 0 ? 'Cash surplus' : 'Cash deficit'}
          </p>
        </div>

        {/* Total Savings */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Savings</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(metrics.totalSavings, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">In active goal pots</p>
        </div>
      </div>

      {/* Highlights: Highest Expense Category & Budget Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highest Expense Category */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Highest Expense Category</span>
            <div className="mt-2 text-xl font-bold text-slate-900">
              {metrics.highestExpenseCategory ? metrics.highestExpenseCategory.category : 'None'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {metrics.highestExpenseCategory
                ? `${formatCurrency(metrics.highestExpenseCategory.amount, currency)} (${metrics.highestExpenseCategory.percentage.toFixed(1)}% of total expenses)`
                : 'No expense recorded'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
            {metrics.highestExpenseCategory ? `${metrics.highestExpenseCategory.percentage.toFixed(0)}%` : '0%'}
          </div>
        </div>

        {/* Budget Usage */}
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Budget Usage</span>
            <div className="mt-2 text-xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.budgetStatus.percentageUsed.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Status: <span className="font-semibold text-slate-700">{metrics.budgetStatus.statusText}</span>
            </p>
          </div>
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-xs ${
              metrics.budgetStatus.isExceeded
                ? 'bg-rose-100 text-rose-800'
                : metrics.budgetStatus.isWarning
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {metrics.budgetStatus.isExceeded ? 'Over' : 'Normal'}
          </div>
        </div>
      </div>

      {/* Simple Monthly Analysis Report Card */}
      <div className="rounded-xl bg-white p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Monthly Financial Analysis & Diagnostic
        </h3>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-800 leading-relaxed">
          <span className="font-bold text-slate-900">Summary Verdict: </span>
          {healthSummary}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Income & Expense Ratios</h4>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Expense-to-Income Ratio:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {metrics.totalIncome > 0
                    ? `${((metrics.totalExpenses / metrics.totalIncome) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Net Savings Margin:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {metrics.netSavingsRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Discretionary "Wants" Share:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {metrics.rule50_30_20.wants.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Actionable Next Month Directives</h4>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li>Keep Food and Dining expenses under 25% of total outlays.</li>
              <li>Maintain an emergency buffer equivalent to at least 1 month of fixed needs.</li>
              <li>Review monthly subscription bills periodically to cancel unused tools.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
