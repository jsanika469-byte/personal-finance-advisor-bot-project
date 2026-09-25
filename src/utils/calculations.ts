import { ExpenseCategory, ExpenseItem, FinanceData, IncomeItem } from '../types/finance';

export interface CategorySummary {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
  budget?: number;
  isOverBudget?: boolean;
}

export interface BudgetStatus {
  monthlyBudget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isWarning: boolean;
  isExceeded: boolean;
  statusText: string;
}

export interface Rule50_30_20 {
  income: number;
  needs: {
    amount: number;
    percentage: number;
    recommendedAmount: number;
    recommendedPercentage: number;
    diff: number;
  };
  wants: {
    amount: number;
    percentage: number;
    recommendedAmount: number;
    recommendedPercentage: number;
    diff: number;
  };
  savings: {
    amount: number;
    percentage: number;
    recommendedAmount: number;
    recommendedPercentage: number;
    diff: number;
  };
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  totalSavings: number;
  netSavingsRate: number; // percentage
  budgetStatus: BudgetStatus;
  categorySummaries: CategorySummary[];
  highestExpenseCategory: CategorySummary | null;
  rule50_30_20: Rule50_30_20;
}

export const calculateMetrics = (data: FinanceData): FinancialMetrics => {
  const totalIncome = data.incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBalance = totalIncome - totalExpenses;

  const totalSavings = data.savingsGoals.reduce((sum, item) => sum + (Number(item.currentAmount) || 0), 0);

  // Budget calculations
  const monthlyBudget = data.budget.monthlyBudget || 0;
  const spent = totalExpenses;
  const remaining = monthlyBudget - spent;
  const percentageUsed = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;
  const isExceeded = spent > monthlyBudget && monthlyBudget > 0;
  const isWarning = !isExceeded && percentageUsed >= 80 && monthlyBudget > 0;

  let statusText = 'On Track';
  if (monthlyBudget === 0) {
    statusText = 'No Budget Set';
  } else if (isExceeded) {
    statusText = 'Budget Exceeded';
  } else if (isWarning) {
    statusText = 'Approaching Limit';
  }

  const budgetStatus: BudgetStatus = {
    monthlyBudget,
    spent,
    remaining,
    percentageUsed,
    isWarning,
    isExceeded,
    statusText,
  };

  // Category breakdown
  const categoryMap: Record<ExpenseCategory, { amount: number; count: number }> = {
    Food: { amount: 0, count: 0 },
    Education: { amount: 0, count: 0 },
    Transport: { amount: 0, count: 0 },
    Shopping: { amount: 0, count: 0 },
    Bills: { amount: 0, count: 0 },
    Entertainment: { amount: 0, count: 0 },
    Healthcare: { amount: 0, count: 0 },
    Other: { amount: 0, count: 0 },
  };

  data.expenses.forEach((item) => {
    if (categoryMap[item.category]) {
      categoryMap[item.category].amount += Number(item.amount) || 0;
      categoryMap[item.category].count += 1;
    }
  });

  const categorySummaries: CategorySummary[] = (Object.keys(categoryMap) as ExpenseCategory[])
    .map((cat) => {
      const amount = categoryMap[cat].amount;
      const count = categoryMap[cat].count;
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      const catBudget = data.budget.categoryBudgets[cat];
      return {
        category: cat,
        amount,
        percentage,
        count,
        budget: catBudget,
        isOverBudget: Boolean(catBudget && amount > catBudget),
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const highestExpenseCategory = categorySummaries.length > 0 && categorySummaries[0].amount > 0
    ? categorySummaries[0]
    : null;

  // 50/30/20 Rule:
  // Needs: Food, Bills, Healthcare, Education, Transport
  // Wants: Shopping, Entertainment, Other
  // Savings: Remaining Balance or dedicated savings contribution
  const needsAmount = (categoryMap['Food'].amount +
    categoryMap['Bills'].amount +
    categoryMap['Healthcare'].amount +
    categoryMap['Education'].amount +
    categoryMap['Transport'].amount);

  const wantsAmount = (categoryMap['Shopping'].amount +
    categoryMap['Entertainment'].amount +
    categoryMap['Other'].amount);

  const effectiveBaseIncome = totalIncome > 0 ? totalIncome : totalExpenses;
  const targetNeeds = effectiveBaseIncome * 0.5;
  const targetWants = effectiveBaseIncome * 0.3;
  const targetSavings = effectiveBaseIncome * 0.2;

  const actualSavingsAmount = Math.max(0, remainingBalance);

  const rule50_30_20: Rule50_30_20 = {
    income: effectiveBaseIncome,
    needs: {
      amount: needsAmount,
      percentage: effectiveBaseIncome > 0 ? (needsAmount / effectiveBaseIncome) * 100 : 0,
      recommendedAmount: targetNeeds,
      recommendedPercentage: 50,
      diff: needsAmount - targetNeeds,
    },
    wants: {
      amount: wantsAmount,
      percentage: effectiveBaseIncome > 0 ? (wantsAmount / effectiveBaseIncome) * 100 : 0,
      recommendedAmount: targetWants,
      recommendedPercentage: 30,
      diff: wantsAmount - targetWants,
    },
    savings: {
      amount: actualSavingsAmount,
      percentage: effectiveBaseIncome > 0 ? (actualSavingsAmount / effectiveBaseIncome) * 100 : 0,
      recommendedAmount: targetSavings,
      recommendedPercentage: 20,
      diff: actualSavingsAmount - targetSavings,
    },
  };

  const netSavingsRate = totalIncome > 0 ? (Math.max(0, remainingBalance) / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    remainingBalance,
    totalSavings,
    netSavingsRate,
    budgetStatus,
    categorySummaries,
    highestExpenseCategory,
    rule50_30_20,
  };
};
