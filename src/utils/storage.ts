import { FinanceData, ExpenseCategory, ExpenseItem, IncomeItem, SavingsGoal } from '../types/finance';

const STORAGE_KEY = 'personal_finance_advisor_data_v3';

// Generate current date helper
const getRelativeDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const getInitialDemoData = (): FinanceData => {
  const todayStr = new Date().toISOString().split('T')[0];

  const sampleIncomes: IncomeItem[] = [
    {
      id: 'inc-user-today',
      source: 'Part-time Income',
      amount: 5000,
      date: todayStr,
      notes: 'Part-time job earnings',
    },
    {
      id: 'inc-1',
      source: 'Scholarship / Fellowship',
      amount: 8500,
      date: getRelativeDate(2),
      notes: 'Monthly university merit stipend',
    },
    {
      id: 'inc-2',
      source: 'Freelance Web Design',
      amount: 4500,
      date: getRelativeDate(8),
      notes: 'Client landing page development',
    },
  ];

  const sampleExpenses: ExpenseItem[] = [
    {
      id: 'exp-user-lunch',
      category: 'Food',
      description: 'Lunch',
      amount: 500,
      date: todayStr,
    },
    {
      id: 'exp-1',
      category: 'Food',
      description: 'Campus cafeteria & weekly groceries',
      amount: 2400,
      date: getRelativeDate(1),
    },
    {
      id: 'exp-2',
      category: 'Education',
      description: 'Algorithm textbooks & cloud lab credits',
      amount: 1450,
      date: getRelativeDate(3),
    },
    {
      id: 'exp-3',
      category: 'Transport',
      description: 'Monthly city metro & bus transit pass',
      amount: 850,
      date: getRelativeDate(5),
    },
    {
      id: 'exp-4',
      category: 'Bills',
      description: 'Broadband internet & mobile plan',
      amount: 900,
      date: getRelativeDate(7),
    },
    {
      id: 'exp-5',
      category: 'Food',
      description: 'Coffee & weekend group study lunch',
      amount: 650,
      date: getRelativeDate(9),
    },
    {
      id: 'exp-6',
      category: 'Entertainment',
      description: 'Coding platform & streaming subscription',
      amount: 350,
      date: getRelativeDate(11),
    },
    {
      id: 'exp-7',
      category: 'Shopping',
      description: 'Ergonomic study mouse & notebook stationery',
      amount: 600,
      date: getRelativeDate(13),
    },
    {
      id: 'exp-8',
      category: 'Healthcare',
      description: 'Health center prescription & vitamins',
      amount: 400,
      date: getRelativeDate(16),
    },
    {
      id: 'exp-9',
      category: 'Other',
      description: 'Laundry supplies and room sundries',
      amount: 300,
      date: getRelativeDate(18),
    },
  ];

  const sampleGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      name: 'Emergency Student Safety Fund',
      targetAmount: 15000,
      currentAmount: 10500,
      targetDate: '2026-12-31',
      category: 'Emergency',
    },
    {
      id: 'goal-2',
      name: 'High-Performance Laptop Upgrade',
      targetAmount: 9000,
      currentAmount: 5400,
      targetDate: '2026-11-15',
      category: 'Tech Gear',
    },
    {
      id: 'goal-3',
      name: 'Cloud Certification Exam Voucher',
      targetAmount: 3000,
      currentAmount: 2200,
      targetDate: '2026-10-30',
      category: 'Career',
    },
  ];

  return {
    incomes: sampleIncomes,
    expenses: sampleExpenses,
    savingsGoals: sampleGoals,
    budget: {
      monthlyBudget: 12000,
      categoryBudgets: {
        Food: 3500,
        Education: 2000,
        Transport: 1000,
        Shopping: 1200,
        Bills: 1200,
        Entertainment: 800,
        Healthcare: 800,
        Other: 600,
      },
    },
    currency: 'INR',
    lastUpdated: new Date().toISOString(),
  };
};

export const loadFinanceData = (): FinanceData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDemoData();
      saveFinanceData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as FinanceData;
    // Basic schema guarantee
    if (!parsed.incomes || !parsed.expenses || !parsed.budget) {
      const initial = getInitialDemoData();
      saveFinanceData(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to load finance data from localStorage, falling back to demo data', err);
    return getInitialDemoData();
  }
};

export const saveFinanceData = (data: FinanceData): void => {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save finance data to localStorage', err);
  }
};

export const resetToDemoData = (): FinanceData => {
  const initial = getInitialDemoData();
  saveFinanceData(initial);
  return initial;
};

export const clearAllFinanceData = (): FinanceData => {
  const empty: FinanceData = {
    incomes: [],
    expenses: [],
    savingsGoals: [],
    budget: {
      monthlyBudget: 0,
      categoryBudgets: {},
    },
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  };
  saveFinanceData(empty);
  return empty;
};

export const formatCurrency = (amount: number, currency: 'USD' | 'INR' | 'EUR' | 'GBP' = 'USD'): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
  };
  const sym = symbols[currency] || '$';
  return `${sym}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  // Convert YYYY-MM-DD to DD-MM-YYYY or return as is if already DD-MM-YYYY
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
};

