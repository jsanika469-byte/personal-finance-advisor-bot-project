import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Wallet,
  Building,
} from 'lucide-react';
import { CurrencyCode, IncomeItem } from '../types/finance';
import { formatCurrency, formatDateDisplay } from '../utils/storage';
import { ModalMode } from './TransactionModal';

interface IncomeViewProps {
  incomes: IncomeItem[];
  currency: CurrencyCode;
  onOpenAddIncome: () => void;
  onEditIncome: (item: IncomeItem) => void;
  onDeleteIncome: (id: string, source: string) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes,
  currency,
  onOpenAddIncome,
  onEditIncome,
  onDeleteIncome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;

  // Filter & sort
  const filteredIncomes = incomes
    .filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.source.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        item.date.includes(q)
      );
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
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Income</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalIncome, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automatically calculated across {incomes.length} records
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average Per Entry</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(avgIncome, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Mean earnings per logged source</p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Manage Earnings</span>
            <p className="mt-1 text-xs text-slate-600">
              Log salary, fellowships, freelance gigs, or allowances.
            </p>
          </div>
          <button
            onClick={onOpenAddIncome}
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Income</span>
          </button>
        </div>
      </div>

      {/* Income Records Ledger */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Income History</h2>
            <span className="text-xs text-slate-500">
              ({filteredIncomes.length} {filteredIncomes.length === 1 ? 'entry' : 'entries'})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search source or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredIncomes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredIncomes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatDateDisplay(item.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>{item.source}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono tabular-nums whitespace-nowrap">
                      +{formatCurrency(item.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditIncome(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Income"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteIncome(item.id, item.source)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Income"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            {searchTerm ? 'No income records match your search query.' : 'No income records added yet.'}
          </div>
        )}
      </div>
    </div>
  );
};
