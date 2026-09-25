import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PiggyBank,
  PieChart,
  Bot,
  CalendarCheck,
  ListFilter,
  RotateCcw,
  Sparkles,
  X,
  GraduationCap,
} from 'lucide-react';
import { ActiveTab, CurrencyCode } from '../types/finance';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  currency,
  onCurrencyChange,
  onResetData,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'budget', label: 'Budget Planner', icon: PieChart },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'advisor', label: 'AI Financial Advisor', icon: Bot },
    { id: 'summary', label: 'Monthly Summary', icon: CalendarCheck },
    { id: 'transactions', label: 'Transactions', icon: ListFilter },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Title & Brand */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-900">
                Finance Advisor
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Smart Planning Bot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Project Tag */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-emerald-700 shrink-0" />
          <span className="text-[11px] font-medium text-slate-600">
            NASSCOM / SmartBridge
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'advisor' && (
                  <span className="ml-auto inline-flex items-center text-[10px] font-semibold text-emerald-600">
                    <Sparkles className="h-3 w-3 mr-0.5" />
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Preferences & Reset */}
        <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/60">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
              Display Currency
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-white border border-slate-200 rounded-lg">
              {(['USD', 'INR', 'EUR', 'GBP'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onCurrencyChange(c)}
                  className={`py-1 text-[11px] font-medium rounded transition-colors ${
                    currency === c
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c === 'USD' ? '$' : c === 'INR' ? '₹' : c === 'EUR' ? '€' : '£'} {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onResetData}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
