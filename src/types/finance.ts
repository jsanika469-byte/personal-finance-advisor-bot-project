export type ExpenseCategory =
  | 'Food'
  | 'Education'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Education',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other',
];

export const INCOME_SOURCES = [
  'Part-time Income',
  'Part-time Job',
  'Salary',
  'Scholarship',
  'Freelance',
  'Allowance',
  'Stipend',
  'Gift',
  'Investment Return',
  'Other',
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number] | string;

export interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: string;
}

export interface BudgetConfig {
  monthlyBudget: number;
  categoryBudgets: Partial<Record<ExpenseCategory, number>>;
}

export interface AdvisorRecommendation {
  id: string;
  title: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  message: string;
  category?: string;
  metric?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedAction?: {
    tab: string;
    label: string;
  };
}

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export interface FinanceData {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savingsGoals: SavingsGoal[];
  budget: BudgetConfig;
  currency: CurrencyCode;
  lastUpdated: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'budget'
  | 'savings'
  | 'advisor'
  | 'summary'
  | 'transactions';
