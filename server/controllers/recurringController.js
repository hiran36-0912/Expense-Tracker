const RecurringTransaction = require('../models/RecurringTransaction');

// @desc    Get all recurring transactions for user
// @route   GET /api/recurring
const getRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find({ userId: req.user._id }).sort({
      nextDate: 1,
    });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching recurring transactions' });
  }
};

// @desc    Create recurring transaction
// @route   POST /api/recurring
const createRecurring = async (req, res) => {
  try {
    const { type, amount, category, description, frequency, nextDate } = req.body;

    if (!type || !amount || !category || !description || !frequency || !nextDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    if (!['Weekly', 'Monthly', 'Yearly'].includes(frequency)) {
      return res.status(400).json({ message: 'Frequency must be Weekly, Monthly, or Yearly' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const item = await RecurringTransaction.create({
      userId: req.user._id,
      type,
      amount: numAmount,
      category: category.trim(),
      description: description.trim(),
      frequency,
      nextDate: new Date(nextDate),
      active: true,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating recurring transaction' });
  }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring/:id
const updateRecurring = async (req, res) => {
  try {
    const { type, amount, category, description, frequency, nextDate, active } = req.body;
    const item = await RecurringTransaction.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this recurring transaction' });
    }

    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Invalid transaction type' });
      }
      item.type = type;
    }

    if (amount !== undefined) {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
      }
      item.amount = num;
    }

    if (category) item.category = category.trim();
    if (description) item.description = description.trim();
    if (frequency) {
      if (!['Weekly', 'Monthly', 'Yearly'].includes(frequency)) {
        return res.status(400).json({ message: 'Frequency must be Weekly, Monthly, or Yearly' });
      }
      item.frequency = frequency;
    }
    if (nextDate) item.nextDate = new Date(nextDate);
    if (active !== undefined) item.active = Boolean(active);

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating recurring transaction' });
  }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring/:id
const deleteRecurring = async (req, res) => {
  try {
    const item = await RecurringTransaction.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recurring transaction' });
    }

    await item.deleteOne();
    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting recurring transaction' });
  }
};

module.exports = {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
};
