import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  CurrencyCode,
  ExpenseItem,
  FinanceData,
  IncomeItem,
  SavingsGoal,
  BudgetConfig,
} from './types/finance';
import {
  loadFinanceData,
  saveFinanceData,
  resetToDemoData,
  clearAllFinanceData,
} from './utils/storage';
import { calculateMetrics } from './utils/calculations';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IncomeView } from './components/IncomeView';
import { ExpenseView } from './components/ExpenseView';
import { BudgetView } from './components/BudgetView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { TransactionsView } from './components/TransactionsView';
import { Footer } from './components/Footer';
import { ModalMode, TransactionModal } from './components/TransactionModal';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  const [data, setData] = useState<FinanceData>(() => loadFinanceData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: true,
    onConfirm: () => {},
  });

  // Keep data synced to localStorage
  useEffect(() => {
    saveFinanceData(data);
  }, [data]);

  const metrics = calculateMetrics(data);

  // Income Handlers
  const handleSaveIncome = (income: Omit<IncomeItem, 'id'>, id?: string) => {
    setData((prev) => {
      if (id) {
        // Edit existing
        const updated = prev.incomes.map((item) =>
          item.id === id ? { ...item, ...income } : item
        );
        return { ...prev, incomes: updated };
      } else {
        // Add new
        const newItem: IncomeItem = {
          id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          ...income,
        };
        return { ...prev, incomes: [newItem, ...prev.incomes] };
      }
    });
  };

  const handleDeleteIncome = (id: string, source: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Income Record',
      message: `Are you sure you want to delete the income record for "${source}"? This will automatically recalculate your total earnings and balance.`,
      confirmLabel: 'Delete',
      isDestructive: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          incomes: prev.incomes.filter((item) => item.id !== id),
        }));
      },
    });
  };

  // Expense Handlers
  const handleSaveExpense = (expense: Omit<ExpenseItem, 'id'>, id?: string) => {
    setData((prev) => {
      if (id) {
        // Edit
        const updated = prev.expenses.map((item) =>
          item.id === id ? { ...item, ...expense } : item
        );
        return { ...prev, expenses: updated };
      } else {
        // Add
        const newItem: ExpenseItem = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          ...expense,
        };
        return { ...prev, expenses: [newItem, ...prev.expenses] };
      }
    });
  };

  const handleDeleteExpense = (id: string, description: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Expense Record',
      message: `Are you sure you want to delete the expense for "${description}"? This will update your total expenses and budget meter.`,
      confirmLabel: 'Delete',
      isDestructive: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          expenses: prev.expenses.filter((item) => item.id !== id),
        }));
      },
    });
  };

  // Budget Handlers
  const handleUpdateBudget = (newBudget: BudgetConfig) => {
    setData((prev) => ({
      ...prev,
      budget: newBudget,
    }));
  };

  // Savings Goal Handlers
  const handleSaveGoal = (goal: Omit<SavingsGoal, 'id'>, id?: string) => {
    setData((prev) => {
      if (id) {
        const updated = prev.savingsGoals.map((g) =>
          g.id === id ? { ...g, ...goal } : g
        );
        return { ...prev, savingsGoals: updated };
      } else {
        const newGoal: SavingsGoal = {
          id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          ...goal,
        };
        return { ...prev, savingsGoals: [...prev.savingsGoals, newGoal] };
      }
    });
  };

  const handleDeleteGoal = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Savings Goal',
      message: `Are you sure you want to delete the savings goal "${name}"?`,
      confirmLabel: 'Delete',
      isDestructive: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
        }));
      },
    });
  };

  const handleAddMoneyToGoal = (id: string, amount: number) => {
    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            currentAmount: g.currentAmount + amount,
          };
        }
        return g;
      }),
    }));
  };

  // Currency & Reset Handlers
  const handleCurrencyChange = (currency: CurrencyCode) => {
    setData((prev) => ({ ...prev, currency }));
  };

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Sample Data?',
      message:
        'This will restore the standard sample college student financial records (scholarship, tech assistant wages, groceries, textbooks, emergency fund). Any custom transactions will be replaced.',
      confirmLabel: 'Reset Demo Data',
      isDestructive: false,
      onConfirm: () => {
        const fresh = resetToDemoData();
        setData(fresh);
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currency={data.currency}
        onCurrencyChange={handleCurrencyChange}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddIncome={() => setModalMode({ type: 'add_income' })}
          onOpenAddExpense={() => setModalMode({ type: 'add_expense' })}
          currency={data.currency}
          remainingBalance={metrics.remainingBalance}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              data={data}
              setActiveTab={setActiveTab}
              onOpenAddIncome={() => setModalMode({ type: 'add_income' })}
              onOpenAddExpense={() => setModalMode({ type: 'add_expense' })}
              currency={data.currency}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              incomes={data.incomes}
              currency={data.currency}
              onOpenAddIncome={() => setModalMode({ type: 'add_income' })}
              onEditIncome={(item) => setModalMode({ type: 'edit_income', item })}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseView
              expenses={data.expenses}
              currency={data.currency}
              onOpenAddExpense={() => setModalMode({ type: 'add_expense' })}
              onEditExpense={(item) => setModalMode({ type: 'edit_expense', item })}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              budget={data.budget}
              expenses={data.expenses}
              currency={data.currency}
              onUpdateBudget={handleUpdateBudget}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsGoalsView
              goals={data.savingsGoals}
              currency={data.currency}
              onSaveGoal={handleSaveGoal}
              onDeleteGoal={handleDeleteGoal}
              onAddMoneyToGoal={handleAddMoneyToGoal}
            />
          )}

          {activeTab === 'advisor' && (
            <AIAdvisorView data={data} currency={data.currency} />
          )}

          {activeTab === 'summary' && (
            <MonthlySummaryView data={data} currency={data.currency} />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              incomes={data.incomes}
              expenses={data.expenses}
              currency={data.currency}
              onEditIncome={(item) => setModalMode({ type: 'edit_income', item })}
              onDeleteIncome={handleDeleteIncome}
              onEditExpense={(item) => setModalMode({ type: 'edit_expense', item })}
              onDeleteExpense={handleDeleteExpense}
            />
          )}
        </main>

        <Footer />
      </div>

      {/* Shared Income/Expense Modal */}
      <TransactionModal
        mode={modalMode}
        onClose={() => setModalMode(null)}
        onSaveIncome={handleSaveIncome}
        onSaveExpense={handleSaveExpense}
        currency={data.currency}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
