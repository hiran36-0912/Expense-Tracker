const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all user's savings goals
// @route   GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const formattedGoals = goals.map((g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const percentage = g.targetAmount > 0
        ? Math.min(100, parseFloat(((g.currentAmount / g.targetAmount) * 100).toFixed(1)))
        : 0;
      const isCompleted = g.currentAmount >= g.targetAmount;

      return {
        _id: g._id,
        userId: g.userId,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remaining: parseFloat(remaining.toFixed(2)),
        progressPercentage: percentage,
        targetDate: g.targetDate,
        isCompleted,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      };
    });

    res.json(formattedGoals);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching savings goals' });
  }
};

// @desc    Create savings goal
// @route   POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount = 0, targetDate } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ message: 'Goal name, target amount, and target date are required' });
    }

    const numericTarget = parseFloat(targetAmount);
    const numericCurrent = parseFloat(currentAmount) || 0;

    if (isNaN(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({ message: 'Target amount must be greater than 0' });
    }

    if (numericCurrent < 0) {
      return res.status(400).json({ message: 'Current amount cannot be negative' });
    }

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      name: name.trim(),
      targetAmount: numericTarget,
      currentAmount: numericCurrent,
      targetDate: new Date(targetDate),
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating savings goal' });
  }
};

// @desc    Update savings goal
// @route   PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, addAmount } = req.body;
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this goal' });
    }

    if (name) goal.name = name.trim();

    if (targetAmount !== undefined) {
      const num = parseFloat(targetAmount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ message: 'Target amount must be greater than 0' });
      }
      goal.targetAmount = num;
    }

    if (currentAmount !== undefined) {
      const num = parseFloat(currentAmount);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ message: 'Current amount cannot be negative' });
      }
      goal.currentAmount = num;
    }

    // Support quick "Add money to goal" action
    if (addAmount !== undefined) {
      const numAdd = parseFloat(addAmount);
      if (isNaN(numAdd) || numAdd <= 0) {
        return res.status(400).json({ message: 'Amount to add must be a positive number' });
      }
      goal.currentAmount += numAdd;
    }

    if (targetDate) goal.targetDate = new Date(targetDate);

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating savings goal' });
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this goal' });
    }

    await goal.deleteOne();
    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting savings goal' });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
