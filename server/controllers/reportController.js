const Transaction = require('../models/Transaction');

// @desc    Get summary metrics for reports
// @route   GET /api/reports/summary?month=X&year=Y
const getReportSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    // Specific month date boundaries
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch transactions for selected month
    const monthTransactions = await Transaction.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const categoryTotals = {};

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        monthlyIncome += t.amount;
      } else {
        monthlyExpenses += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const savings = monthlyIncome - monthlyExpenses;
    const savingsRate =
      monthlyIncome > 0
        ? parseFloat((((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100).toFixed(1))
        : 0;

    // Highest spending category
    let highestSpendingCategory = { category: 'None', amount: 0 };
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > highestSpendingCategory.amount) {
        highestSpendingCategory = { category: cat, amount: parseFloat(amt.toFixed(2)) };
      }
    });

    // Calculate average monthly expense from all user history
    const allExpenses = await Transaction.find({ userId, type: 'expense' });
    const monthsRecorded = new Set(
      allExpenses.map((t) => {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${d.getMonth() + 1}`;
      })
    );
    const totalAllExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const avgMonthlyExpense =
      monthsRecorded.size > 0
        ? parseFloat((totalAllExpenses / monthsRecorded.size).toFixed(2))
        : monthlyExpenses;

    res.json({
      month,
      year,
      monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
      monthlyExpenses: parseFloat(monthlyExpenses.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      savingsRate,
      highestSpendingCategory,
      avgMonthlyExpense,
      transactionCount: monthTransactions.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching report summary' });
  }
};

// @desc    Get monthly analysis breakdown
// @route   GET /api/reports/monthly?year=Y
const getReportMonthly = async (req, res) => {
  try {
    const userId = req.user._id;
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startOfYear, $lte: endOfYear },
    });

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      monthNumber: i + 1,
      month: monthNames[i],
      income: 0,
      expenses: 0,
      savings: 0,
    }));

    transactions.forEach((t) => {
      const m = new Date(t.date).getMonth();
      if (t.type === 'income') {
        monthlyData[m].income += t.amount;
      } else {
        monthlyData[m].expenses += t.amount;
      }
    });

    monthlyData.forEach((m) => {
      m.income = parseFloat(m.income.toFixed(2));
      m.expenses = parseFloat(m.expenses.toFixed(2));
      m.savings = parseFloat((m.income - m.expenses).toFixed(2));
    });

    res.json({
      year,
      monthlyData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching monthly report' });
  }
};

// @desc    Get category analysis for selected month & year
// @route   GET /api/reports/categories?month=X&year=Y
const getReportCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseTransactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const categoryTotals = {};
    let totalExpense = 0;

    expenseTransactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      totalExpense += t.amount;
    });

    const categories = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        amount: parseFloat(value.toFixed(2)),
        percentage: totalExpense > 0 ? parseFloat(((value / totalExpense) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      month,
      year,
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching category report' });
  }
};

module.exports = {
  getReportSummary,
  getReportMonthly,
  getReportCategories,
};
