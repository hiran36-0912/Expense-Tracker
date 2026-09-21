const Transaction = require('../models/Transaction');

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Health',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Gift', 'Other'];

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

const createTransaction = async (req, res) => {
  const { type, amount, category, description, date } = req.body;

  try {
    if (!type || !amount || !category || !description || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: 'Amount must be a positive number' });
    }

    const validCategories =
      type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category for this transaction type' });
    }

    if (description.length > 200) {
      return res
        .status(400)
        .json({ message: 'Description cannot exceed 200 characters' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: numericAmount,
      category,
      description,
      date: new Date(date),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating transaction' });
  }
};

const updateTransaction = async (req, res) => {
  const { type, amount, category, description, date } = req.body;

  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this transaction' });
    }

    if (!type || !amount || !category || !description || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: 'Amount must be a positive number' });
    }

    const validCategories =
      type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category for this transaction type' });
    }

    transaction.type = type;
    transaction.amount = numericAmount;
    transaction.category = category;
    transaction.description = description;
    transaction.date = new Date(date);

    const updated = await transaction.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
