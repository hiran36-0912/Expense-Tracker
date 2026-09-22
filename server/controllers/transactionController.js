const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Health',
  'Travel',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Gift', 'Other'];

// Helper to validate category against default or user-created custom categories
const isCategoryValid = async (userId, type, categoryName) => {
  const defaults = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  if (defaults.includes(categoryName)) {
    return true;
  }

  const customExists = await Category.findOne({
    userId,
    name: categoryName,
    type: { $in: [type, 'both'] },
  });

  return Boolean(customExists);
};

// @desc    Get transactions with optional search, filter, sort & pagination
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      sort = 'newest',
      page,
      limit,
    } = req.query;

    const query = { userId };

    // Search by description or category
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ description: searchRegex }, { category: searchRegex }];
    }

    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    let sortOption = { date: -1 };
    if (sort === 'oldest') {
      sortOption = { date: 1 };
    } else if (sort === 'highest') {
      sortOption = { amount: -1 };
    } else if (sort === 'lowest') {
      sortOption = { amount: 1 };
    } else {
      sortOption = { date: -1 };
    }

    // If pagination requested
    if (page || limit) {
      const currentPage = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.max(1, parseInt(limit, 10) || 10);
      const total = await Transaction.countDocuments(query);
      const pages = Math.ceil(total / pageSize) || 1;

      const transactions = await Transaction.find(query)
        .sort(sortOption)
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize);

      return res.json({
        transactions,
        total,
        page: currentPage,
        pages,
      });
    }

    // Backward-compatible unpaginated query (for analytics or standard list)
    const transactions = await Transaction.find(query).sort(sortOption);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
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

    const validCategory = await isCategoryValid(req.user._id, type, category);
    if (!validCategory) {
      return res
        .status(400)
        .json({ message: 'Invalid category for this transaction type' });
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

// @desc    Update transaction
// @route   PUT /api/transactions/:id
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

    const validCategory = await isCategoryValid(req.user._id, type, category);
    if (!validCategory) {
      return res
        .status(400)
        .json({ message: 'Invalid category for this transaction type' });
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

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
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
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
};
