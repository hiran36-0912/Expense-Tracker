const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get user's budgets with actual spent calculation
// @route   GET /api/budgets?month=X&year=Y
const getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year,
    }).sort({ category: 1 });

    // Calculate spent amount for each budget category in this month/year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseTransactions = await Transaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const categorySpending = {};
    expenseTransactions.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const budgetsWithProgress = budgets.map((b) => {
      const spent = categorySpending[b.category] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentageUsed = b.amount > 0 ? parseFloat(((spent / b.amount) * 100).toFixed(1)) : 0;
      const isExceeded = spent > b.amount;

      return {
        _id: b._id,
        userId: b.userId,
        category: b.category,
        amount: b.amount,
        month: b.month,
        year: b.year,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentageUsed,
        isExceeded,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    res.json({
      month,
      year,
      budgets: budgetsWithProgress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching budgets' });
  }
};

// @desc    Create budget
// @route   POST /api/budgets
const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || !amount || !month || !year) {
      return res.status(400).json({ message: 'Category, amount, month, and year are required' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const numericMonth = parseInt(month, 10);
    const numericYear = parseInt(year, 10);
    if (isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) {
      return res.status(400).json({ message: 'Invalid month (1-12)' });
    }

    const existing = await Budget.findOne({
      userId: req.user._id,
      category,
      month: numericMonth,
      year: numericYear,
    });

    if (existing) {
      return res.status(400).json({
        message: `A budget for '${category}' already exists for ${numericMonth}/${numericYear}. Please edit it instead.`,
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      amount: numericAmount,
      month: numericMonth,
      year: numericYear,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating budget' });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  try {
    const { amount, category, month, year } = req.body;
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this budget' });
    }

    if (amount !== undefined) {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
      }
      budget.amount = num;
    }

    if (category) budget.category = category;
    if (month) budget.month = parseInt(month, 10);
    if (year) budget.year = parseInt(year, 10);

    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating budget' });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this budget' });
    }

    await budget.deleteOne();
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting budget' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
