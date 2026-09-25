import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { CurrencyCode, SavingsGoal } from '../types/finance';
import { formatCurrency } from '../utils/storage';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  currency: CurrencyCode;
  onSaveGoal: (goal: Omit<SavingsGoal, 'id'>, id?: string) => void;
  onDeleteGoal: (id: string, name: string) => void;
  onAddMoneyToGoal: (id: string, amount: number) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  currency,
  onSaveGoal,
  onDeleteGoal,
  onAddMoneyToGoal,
}) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  // Quick Deposit modal state
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const totalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    setCategory('General');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDate(goal.targetDate || '');
    setCategory(goal.category || 'General');
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const currentNum = parseFloat(currentAmount) || 0;

    if (!name.trim()) {
      setError('Please provide a goal name.');
      return;
    }

    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Please enter a valid positive target amount.');
      return;
    }

    if (currentNum < 0) {
      setError('Current saved amount cannot be negative.');
      return;
    }

    onSaveGoal(
      {
        name: name.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        targetDate: targetDate || undefined,
        category: category.trim() || undefined,
      },
      editingGoal?.id
    );

    setIsModalOpen(false);
  };

  const handleQuickDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const addAmt = parseFloat(depositAmount);
    if (isNaN(addAmt) || addAmt <= 0) return;

    onAddMoneyToGoal(depositGoal.id, addAmt);
    setDepositGoal(null);
    setDepositAmount('');
  };

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6">
      {/* Top Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Saved</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalSaved, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Across {goals.length} active goals</p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Cumulative Target</span>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalTarget, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {overallProgress.toFixed(1)}% overall progress reached
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Create New Target</span>
            <p className="mt-1 text-xs text-slate-600">
              Set funds for emergency, education exams, tech, or trips.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Savings Goal</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Meter */}
      <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Total Savings Target Completion</h3>
            <p className="text-xs text-slate-500">Combined progress across all savings plans</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700">
            {overallProgress.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isDone = pct >= 100;

          return (
            <div
              key={goal.id}
              className={`rounded-xl bg-white p-5 border transition-all shadow-2xs flex flex-col justify-between ${
                isDone ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <PiggyBank className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                        {goal.name}
                      </h4>
                      {goal.category && (
                        <span className="text-[11px] text-slate-500">{goal.category}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id, goal.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amounts & Percentage */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-xs text-slate-500">
                    Saved:{' '}
                    <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Target:{' '}
                    <span className="font-semibold text-slate-700 font-mono tabular-nums">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{pct.toFixed(0)}% reached</span>
                    <span className="text-slate-500">
                      {isDone ? 'Goal Completed!' : `${formatCurrency(remaining, currency)} remaining`}
                    </span>
                  </div>
                </div>

                {goal.targetDate && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Target Date: {goal.targetDate}
                  </p>
                )}
              </div>

              {/* Add Money Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Deposit savings:</span>
                <button
                  onClick={() => {
                    setDepositGoal(goal);
                    setDepositAmount('50');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>+ Add Money</span>
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl bg-white">
            <PiggyBank className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No savings goals created yet</p>
            <p className="text-slate-500 mt-1">Start by creating an Emergency Fund or Laptop Target.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, Laptop Upgrade, Vacation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Amount ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    placeholder="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Saved ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Emergency, Tech, Travel"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  {editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Add Money to Savings</h3>
                <p className="text-xs text-slate-500">{depositGoal.name}</p>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickDepositSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Amount ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-emerald-600 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick chips */}
              <div className="flex gap-2">
                {[25, 50, 100, 200].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setDepositAmount(amt.toString())}
                    className="flex-1 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 font-mono"
                  >
                    +{currencySymbol}{amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
