import { AdvisorRecommendation, ChatMessage, FinanceData } from '../types/finance';
import { calculateMetrics } from './calculations';
import { formatCurrency } from './storage';

export const generateRecommendations = (data: FinanceData): AdvisorRecommendation[] => {
  const metrics = calculateMetrics(data);
  const recs: AdvisorRecommendation[] = [];

  const curr = data.currency;

  // 1. Food Expenses Check
  const foodCat = metrics.categorySummaries.find((c) => c.category === 'Food');
  if (foodCat && metrics.totalExpenses > 0) {
    const foodShare = foodCat.percentage;
    if (foodShare >= 30) {
      recs.push({
        id: 'rec-food-high',
        title: 'Food Expenses Notice',
        type: 'warning',
        category: 'Food',
        message: `Your food expenses are relatively high this month (${formatCurrency(foodCat.amount, curr)}, representing ${foodShare.toFixed(1)}% of all expenses). Planning meals in advance or making groceries can help optimize this category.`,
        metric: `${foodShare.toFixed(0)}% of total expenses`,
      });
    } else if (foodShare >= 20) {
      recs.push({
        id: 'rec-food-moderate',
        title: 'Food Spending Observation',
        type: 'info',
        category: 'Food',
        message: `Your food expenses account for ${foodShare.toFixed(1)}% (${formatCurrency(foodCat.amount, curr)}) of your total spending, which is fairly standard for student budgeting.`,
        metric: `${foodShare.toFixed(0)}% of expenses`,
      });
    }
  }

  // 2. Budget Limit Warnings
  if (metrics.budgetStatus.monthlyBudget > 0) {
    if (metrics.budgetStatus.isExceeded) {
      const overBy = metrics.budgetStatus.spent - metrics.budgetStatus.monthlyBudget;
      recs.push({
        id: 'rec-budget-exceeded',
        title: 'Monthly Budget Limit Exceeded',
        type: 'warning',
        category: 'Budget',
        message: `You have spent ${formatCurrency(metrics.budgetStatus.spent, curr)}, which is ${formatCurrency(overBy, curr)} over your planned ${formatCurrency(metrics.budgetStatus.monthlyBudget, curr)} monthly limit (${metrics.budgetStatus.percentageUsed.toFixed(0)}% used). Try reviewing discretionary expenses.`,
        metric: `${metrics.budgetStatus.percentageUsed.toFixed(0)}% used`,
      });
    } else if (metrics.budgetStatus.isWarning) {
      recs.push({
        id: 'rec-budget-close',
        title: 'Approaching Monthly Budget Limit',
        type: 'warning',
        category: 'Budget',
        message: `You are close to your monthly budget limit (${metrics.budgetStatus.percentageUsed.toFixed(1)}% used). You have ${formatCurrency(metrics.budgetStatus.remaining, curr)} remaining for the rest of the cycle.`,
        metric: `${metrics.budgetStatus.percentageUsed.toFixed(0)}% used`,
      });
    } else {
      recs.push({
        id: 'rec-budget-ontrack',
        title: 'Budget Discipline On Track',
        type: 'success',
        category: 'Budget',
        message: `Great job! You have utilized ${metrics.budgetStatus.percentageUsed.toFixed(1)}% of your monthly budget, leaving a healthy buffer of ${formatCurrency(metrics.budgetStatus.remaining, curr)}.`,
        metric: `${metrics.budgetStatus.percentageUsed.toFixed(0)}% used`,
      });
    }
  } else {
    recs.push({
      id: 'rec-budget-missing',
      title: 'Monthly Budget Recommendation',
      type: 'tip',
      category: 'Budget',
      message: 'You have not set a monthly spending budget yet. Setting a realistic monthly cap gives you clarity and guards against unexpected cash drains.',
      metric: 'No budget set',
    });
  }

  // 3. Cash Surplus / Remaining Balance Check
  if (metrics.remainingBalance > 0) {
    recs.push({
      id: 'rec-surplus-positive',
      title: 'Positive Cash Surplus',
      type: 'success',
      category: 'Savings',
      message: `You have money remaining after your expenses (${formatCurrency(metrics.remainingBalance, curr)} surplus). Consider allocating a portion of this surplus toward your active savings goals or emergency fund.`,
      metric: `+${formatCurrency(metrics.remainingBalance, curr)} net balance`,
    });
  } else if (metrics.remainingBalance < 0) {
    recs.push({
      id: 'rec-deficit-warning',
      title: 'Negative Cash Flow Alert',
      type: 'warning',
      category: 'Income/Expense',
      message: `Your expenses exceed your total recorded income by ${formatCurrency(Math.abs(metrics.remainingBalance), curr)}. Review your recent discretionary purchases to restore a balanced cash flow.`,
      metric: `-${formatCurrency(Math.abs(metrics.remainingBalance), curr)} deficit`,
    });
  }

  // 4. Savings Goals Evaluation
  if (data.savingsGoals.length === 0) {
    recs.push({
      id: 'rec-savings-empty',
      title: 'Start a Savings Target',
      type: 'tip',
      category: 'Savings',
      message: 'Consider setting a monthly savings goal. Even setting aside a modest amount each week builds a reassuring safety net for unforeseen expenses.',
      metric: '0 goals active',
    });
  } else {
    const nearCompletion = data.savingsGoals.find((g) => {
      const pct = (g.currentAmount / (g.targetAmount || 1)) * 100;
      return pct >= 80 && pct < 100;
    });
    if (nearCompletion) {
      const pct = ((nearCompletion.currentAmount / nearCompletion.targetAmount) * 100).toFixed(0);
      recs.push({
        id: 'rec-savings-near',
        title: 'Goal Near Completion',
        type: 'info',
        category: 'Savings',
        message: `Your goal "${nearCompletion.name}" is ${pct}% funded (${formatCurrency(nearCompletion.currentAmount, curr)} of ${formatCurrency(nearCompletion.targetAmount, curr)}). You only need ${formatCurrency(nearCompletion.targetAmount - nearCompletion.currentAmount, curr)} more!`,
        metric: `${pct}% achieved`,
      });
    }
  }

  // 5. 50/30/20 Rule Insights
  const rule = metrics.rule50_30_20;
  if (metrics.totalIncome > 0) {
    if (rule.wants.percentage > 35) {
      recs.push({
        id: 'rec-wants-high',
        title: 'Discretionary Spending (Wants)',
        type: 'info',
        category: 'Analysis',
        message: `Your non-essential "Wants" (Shopping, Entertainment, Other) account for ${rule.wants.percentage.toFixed(1)}% of your income. The 50/30/20 guideline recommends keeping wants around 30% to maximize financial security.`,
        metric: `${rule.wants.percentage.toFixed(0)}% (target: 30%)`,
      });
    }
  }

  return recs;
};

// Interactive Q&A Bot response generator based on live data
export const generateBotResponse = (question: string, data: FinanceData): string => {
  const q = question.toLowerCase().trim();
  const metrics = calculateMetrics(data);
  const curr = data.currency;

  // Disclaimer preamble
  const disclaimerNote = '\n\n*(Note: For educational budgeting purposes only; not formal financial advice).*';

  if (q.includes('food') || q.includes('grocery') || q.includes('cafeteria') || q.includes('eat')) {
    const food = metrics.categorySummaries.find((c) => c.category === 'Food');
    if (!food || food.amount === 0) {
      return `You have not recorded any Food expenses yet. You can log grocery or campus dining expenses in the Expenses tab.${disclaimerNote}`;
    }
    const share = food.percentage.toFixed(1);
    if (food.percentage > 30) {
      return `Your food expenses currently total ${formatCurrency(food.amount, curr)}, representing ${share}% of your total spending. This is relatively high. Educational tip: Try cooking in batches, looking out for student dining deals, or limiting food delivery orders.${disclaimerNote}`;
    }
    return `Your food expenses stand at ${formatCurrency(food.amount, curr)} (${share}% of expenses), which falls in a balanced range for your current spending level.${disclaimerNote}`;
  }

  if (q.includes('budget') || q.includes('limit') || q.includes('safe') || q.includes('spent')) {
    const b = metrics.budgetStatus;
    if (b.monthlyBudget === 0) {
      return `You haven't defined a monthly budget cap yet. Go to the Budget Planner tab and set a target (e.g., $1,000 to $1,500) to keep your spending paced!${disclaimerNote}`;
    }
    if (b.isExceeded) {
      return `Warning: You have spent ${formatCurrency(b.spent, curr)} against a budget limit of ${formatCurrency(b.monthlyBudget, curr)} (${b.percentageUsed.toFixed(0)}% used, ${formatCurrency(b.spent - b.monthlyBudget, curr)} over budget). Consider pausing discretionary purchases until next month.${disclaimerNote}`;
    }
    if (b.isWarning) {
      return `You are close to your monthly limit: ${formatCurrency(b.spent, curr)} of ${formatCurrency(b.monthlyBudget, curr)} spent (${b.percentageUsed.toFixed(1)}%). You have ${formatCurrency(b.remaining, curr)} left.${disclaimerNote}`;
    }
    return `Your budget is in great shape! You've used ${b.percentageUsed.toFixed(1)}% (${formatCurrency(b.spent, curr)} of ${formatCurrency(b.monthlyBudget, curr)}), leaving ${formatCurrency(b.remaining, curr)} buffer.${disclaimerNote}`;
  }

  if (q.includes('save') || q.includes('saving') || q.includes('goal') || q.includes('surplus')) {
    if (data.savingsGoals.length === 0) {
      return `You don't have any savings goals active. You currently have a net balance of ${formatCurrency(metrics.remainingBalance, curr)}. Setting a concrete goal (like an Emergency Fund or Study Supplies) helps motivate consistent savings!${disclaimerNote}`;
    }
    const totalSaved = metrics.totalSavings;
    const goalsSummary = data.savingsGoals
      .map((g) => `${g.name}: ${formatCurrency(g.currentAmount, curr)}/${formatCurrency(g.targetAmount, curr)} (${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}%)`)
      .join(', ');
    return `You have saved a total of ${formatCurrency(totalSaved, curr)} across ${data.savingsGoals.length} goals (${goalsSummary}). With your remaining balance of ${formatCurrency(metrics.remainingBalance, curr)}, you have room to top up these goals!${disclaimerNote}`;
  }

  if (q.includes('50/30/20') || q.includes('rule') || q.includes('needs') || q.includes('wants')) {
    const r = metrics.rule50_30_20;
    return `Based on the 50/30/20 educational budgeting principle:\n• Needs (Essentials: Food, Bills, Health, Education, Transit): ${formatCurrency(r.needs.amount, curr)} (${r.needs.percentage.toFixed(0)}% vs 50% target)\n• Wants (Discretionary: Shopping, Entertainment): ${formatCurrency(r.wants.amount, curr)} (${r.wants.percentage.toFixed(0)}% vs 30% target)\n• Savings (Surplus / Reserve): ${formatCurrency(r.savings.amount, curr)} (${r.savings.percentage.toFixed(0)}% vs 20% target)\n\nThis framework helps maintain balance between current living requirements and future financial security.${disclaimerNote}`;
  }

  if (q.includes('highest') || q.includes('top') || q.includes('category') || q.includes('where is my money')) {
    if (!metrics.highestExpenseCategory) {
      return `You have not recorded any expenses yet.${disclaimerNote}`;
    }
    const top = metrics.highestExpenseCategory;
    return `Your highest spending category is ${top.category}, totaling ${formatCurrency(top.amount, curr)} (${top.percentage.toFixed(1)}% of all expenses across ${top.count} transactions).${disclaimerNote}`;
  }

  if (q.includes('summary') || q.includes('overview') || q.includes('how am i doing') || q.includes('health')) {
    return `Here is your current financial snapshot:\n• Total Income: ${formatCurrency(metrics.totalIncome, curr)}\n• Total Expenses: ${formatCurrency(metrics.totalExpenses, curr)}\n• Net Balance: ${formatCurrency(metrics.remainingBalance, curr)}\n• Total Saved: ${formatCurrency(metrics.totalSavings, curr)}\n• Budget Status: ${metrics.budgetStatus.statusText} (${metrics.budgetStatus.percentageUsed.toFixed(0)}%)\n• Top Expense: ${metrics.highestExpenseCategory?.category || 'None'}\n\nOverall, you have a ${metrics.remainingBalance >= 0 ? 'healthy surplus' : 'cash flow deficit'} to manage.${disclaimerNote}`;
  }

  // Default response addressing general question
  return `Analyzing your current profile: You have recorded ${formatCurrency(metrics.totalIncome, curr)} in income and ${formatCurrency(metrics.totalExpenses, curr)} in expenses, leaving a net balance of ${formatCurrency(metrics.remainingBalance, curr)}. Your budget is currently ${metrics.budgetStatus.statusText}.\n\nTip: You can ask me specific questions like "Analyze my food expenses", "How is my budget?", "What is my top expense?", or "Explain the 50/30/20 rule".${disclaimerNote}`;
};
