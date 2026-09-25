import React from 'react';
import { Menu, Plus, TrendingUp, Receipt } from 'lucide-react';
import { ActiveTab, CurrencyCode } from '../types/finance';
import { formatCurrency } from '../utils/storage';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenSidebar: () => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  currency: CurrencyCode;
  remainingBalance: number;
}

const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Financial Overview',
    subtitle: 'Track your real-time cash flow, monthly budget pacing, and smart recommendations',
  },
  income: {
    title: 'Income Management',
    subtitle: 'Record and track academic stipends, part-time wages, and other earnings',
  },
  expenses: {
    title: 'Expense Tracker',
    subtitle: 'Categorize spending across food, transport, bills, and study essentials',
  },
  budget: {
    title: 'Monthly Budget Planner',
    subtitle: 'Set spending caps and monitor safety margins to prevent overspending',
  },
  savings: {
    title: 'Savings Goals',
    subtitle: 'Build dedicated emergency and long-term milestones with tracked progress',
  },
  advisor: {
    title: 'AI Financial Advisor',
    subtitle: 'Data-driven budgeting recommendations and interactive financial guidance',
  },
  summary: {
    title: 'Monthly Financial Summary',
    subtitle: 'Comprehensive financial health report, cash-flow ratios, and key trends',
  },
  transactions: {
    title: 'Transaction Ledger',
    subtitle: 'Complete searchable audit trail of all recorded incomes and expenditures',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSidebar,
  onOpenAddIncome,
  onOpenAddExpense,
  currency,
  remainingBalance,
}) => {
  const info = tabTitles[activeTab];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur-xs md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              {info.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {info.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Net Balance and Quick Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          <div className="hidden lg:flex items-center gap-2 border-r border-slate-200 pr-3 mr-1 text-xs">
            <span className="text-slate-500">Net Balance:</span>
            <span
              className={`font-semibold font-mono tabular-nums ${
                remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatCurrency(remainingBalance, currency)}
            </span>
          </div>

          <button
            onClick={onOpenAddIncome}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors whitespace-nowrap"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
            <span>+ Add Income</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
