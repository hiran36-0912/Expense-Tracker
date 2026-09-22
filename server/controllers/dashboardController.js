const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const RecurringTransaction = require('../models/RecurringTransaction');

const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    const monthlyData = {};

    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const prevDate = new Date(currentYear, now.getMonth() - 1, 1);
    const prevMonthNum = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();

    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;
    let prevMonthIncome = 0;
    let prevMonthExpenses = 0;

    transactions.forEach((t) => {
      const amount = t.amount;
      const d = new Date(t.date);
      const tMonth = d.getMonth() + 1;
      const tYear = d.getFullYear();

      if (t.type === 'income') {
        totalIncome += amount;
        if (tYear === currentYear && tMonth === currentMonthNum) {
          currentMonthIncome += amount;
        } else if (tYear === prevYear && tMonth === prevMonthNum) {
          prevMonthIncome += amount;
        }
      } else {
        totalExpenses += amount;
        // Category breakdown for pie chart
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;

        if (tYear === currentYear && tMonth === currentMonthNum) {
          currentMonthExpenses += amount;
        } else if (tYear === prevYear && tMonth === prevMonthNum) {
          prevMonthExpenses += amount;
        }
      }

      // Monthly data for chart
      const monthKey = `${tYear}-${String(tMonth).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expenses += amount;
      }
    });

    const balance = totalIncome - totalExpenses;
    const savings = balance;

    // Monthly comparisons
    const incomeChangePercent =
      prevMonthIncome > 0
        ? parseFloat((((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100).toFixed(1))
        : 0;

    const expenseChangePercent =
      prevMonthExpenses > 0
        ? parseFloat((((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100).toFixed(1))
        : 0;

    // Format category data with percentage of total expenses
    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percentage: totalExpenses > 0 ? parseFloat(((value / totalExpenses) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.value - a.value);

    // Format monthly data sorted by month (last 6 months)
    const monthlyChartData = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((m) => ({
        month: m.month,
        income: parseFloat(m.income.toFixed(2)),
        expenses: parseFloat(m.expenses.toFixed(2)),
      }));

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    // Budget status for current month
    const budgets = await Budget.find({
      userId,
      month: currentMonthNum,
      year: currentYear,
    });

    let totalBudgeted = 0;
    let exceededBudgetsCount = 0;
    budgets.forEach((b) => {
      totalBudgeted += b.amount;
      const spent = categoryTotals[b.category] || 0;
      if (spent > b.amount) {
        exceededBudgetsCount++;
      }
    });

    // Savings goals progress overview
    const goals = await SavingsGoal.find({ userId });
    const totalGoalsTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalGoalsCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completedGoalsCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

    // Recurring transactions alert (due within 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const upcomingRecurring = await RecurringTransaction.find({
      userId,
      active: true,
      nextDate: { $lte: sevenDaysLater },
    }).limit(3);

    res.json({
      balance: parseFloat(balance.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      monthlyComparison: {
        currentMonth: {
          name: now.toLocaleString('default', { month: 'short', year: 'numeric' }),
          income: parseFloat(currentMonthIncome.toFixed(2)),
          expenses: parseFloat(currentMonthExpenses.toFixed(2)),
        },
        previousMonth: {
          name: prevDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
          income: parseFloat(prevMonthIncome.toFixed(2)),
          expenses: parseFloat(prevMonthExpenses.toFixed(2)),
        },
        incomeChangePercent,
        expenseChangePercent,
      },
      categoryData,
      monthlyChartData,
      recentTransactions,
      budgetOverview: {
        totalBudgeted: parseFloat(totalBudgeted.toFixed(2)),
        currentMonthExpenses: parseFloat(currentMonthExpenses.toFixed(2)),
        budgetCount: budgets.length,
        exceededBudgetsCount,
      },
      goalsOverview: {
        count: goals.length,
        completedCount: completedGoalsCount,
        totalTarget: parseFloat(totalGoalsTarget.toFixed(2)),
        totalCurrent: parseFloat(totalGoalsCurrent.toFixed(2)),
        overallProgress:
          totalGoalsTarget > 0
            ? parseFloat(((totalGoalsCurrent / totalGoalsTarget) * 100).toFixed(1))
            : 0,
      },
      upcomingRecurring,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dashboard summary' });
  }
};

module.exports = { getSummary };
