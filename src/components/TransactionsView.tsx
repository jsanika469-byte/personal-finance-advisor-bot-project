import React, { useState } from 'react';
import {
  ListFilter,
  Search,
  Download,
  TrendingUp,
  Receipt,
  Edit2,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import {
  CurrencyCode,
  ExpenseCategory,
  ExpenseItem,
  IncomeItem,
} from '../types/finance';
import { formatCurrency, formatDateDisplay } from '../utils/storage';

interface TransactionsViewProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  currency: CurrencyCode;
  onEditIncome: (item: IncomeItem) => void;
  onDeleteIncome: (id: string, source: string) => void;
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string, description: string) => void;
}

interface UnifiedTransaction {
  id: string;
  type: 'Income' | 'Expense';
  date: string;
  categoryOrSource: string;
  description: string;
  amount: number;
  originalIncome?: IncomeItem;
  originalExpense?: ExpenseItem;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  incomes,
  expenses,
  currency,
  onEditIncome,
  onDeleteIncome,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Combine both sources
  const unifiedList: UnifiedTransaction[] = [
    ...incomes.map((inc) => ({
      id: inc.id,
      type: 'Income' as const,
      date: inc.date,
      categoryOrSource: inc.source,
      description: inc.notes || 'Income deposit',
      amount: inc.amount,
      originalIncome: inc,
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      type: 'Expense' as const,
      date: exp.date,
      categoryOrSource: exp.category,
      description: exp.description,
      amount: exp.amount,
      originalExpense: exp,
    })),
  ];

  const filteredList = unifiedList
    .filter((tx) => {
      const matchType = typeFilter === 'All' || tx.type === typeFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        tx.categoryOrSource.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.date.includes(q);
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category/Source', 'Description', 'Amount'];
    const rows = filteredList.map((tx) => [
      tx.date,
      tx.type,
      `"${tx.categoryOrSource.replace(/"/g, '""')}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.type === 'Income' ? tx.amount : -tx.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Unified Transaction Ledger</h2>
            <span className="text-xs text-slate-500">
              ({filteredList.length} of {unifiedList.length} items)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
              {(['All', 'Income', 'Expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    typeFilter === t
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
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

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
              title="Export current view to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category / Source</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredList.map((tx) => {
                  const isIncome = tx.type === 'Income';
                  return (
                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatDateDisplay(tx.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Receipt className="w-3 h-3 text-rose-600" />
                          )}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {tx.categoryOrSource}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold font-mono tabular-nums whitespace-nowrap ${
                          isIncome ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (isIncome && tx.originalIncome) {
                                onEditIncome(tx.originalIncome);
                              } else if (!isIncome && tx.originalExpense) {
                                onEditExpense(tx.originalExpense);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (isIncome) {
                                onDeleteIncome(tx.id, tx.categoryOrSource);
                              } else {
                                onDeleteExpense(tx.id, tx.description);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete"
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
            No transactions match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
