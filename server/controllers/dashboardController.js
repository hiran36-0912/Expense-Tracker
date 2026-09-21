const Transaction = require('../models/Transaction');

const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    const monthlyData = {};

    transactions.forEach((t) => {
      const amount = t.amount;
      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;

        // Category breakdown for pie chart
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      }

      // Monthly data for bar chart
      const d = new Date(t.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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

    // Format category data for pie chart
    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

    // Format monthly data sorted by month
    const monthlyChartData = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // last 6 months
      .map((m) => ({
        month: m.month,
        income: parseFloat(m.income.toFixed(2)),
        expenses: parseFloat(m.expenses.toFixed(2)),
      }));

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      balance: parseFloat(balance.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      categoryData,
      monthlyChartData,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dashboard summary' });
  }
};

module.exports = { getSummary };
