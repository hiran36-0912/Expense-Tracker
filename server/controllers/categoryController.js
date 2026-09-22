const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

const DEFAULT_EXPENSE_CATEGORIES = [
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

const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Gift', 'Other'];

// @desc    Get all categories (defaults + user custom)
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
    const customCategories = await Category.find({ userId: req.user._id }).sort({ name: 1 });

    const customExpense = customCategories
      .filter((c) => c.type === 'expense' || c.type === 'both')
      .map((c) => c.name);

    const customIncome = customCategories
      .filter((c) => c.type === 'income' || c.type === 'both')
      .map((c) => c.name);

    const expenseCategories = Array.from(
      new Set([...DEFAULT_EXPENSE_CATEGORIES, ...customExpense])
    );
    const incomeCategories = Array.from(
      new Set([...DEFAULT_INCOME_CATEGORIES, ...customIncome])
    );

    res.json({
      defaults: {
        expense: DEFAULT_EXPENSE_CATEGORIES,
        income: DEFAULT_INCOME_CATEGORIES,
      },
      custom: customCategories,
      expenseCategories,
      incomeCategories,
      all: Array.from(new Set([...expenseCategories, ...incomeCategories])),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// @desc    Create custom category
// @route   POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, type = 'expense' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if name conflicts with defaults
    const isDefault = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES].some(
      (c) => c.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDefault) {
      return res.status(400).json({ message: 'This category already exists as a default category' });
    }

    // Check if user already created this category
    const existing = await Category.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({ message: 'A custom category with this name already exists' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name: trimmedName,
      type: ['expense', 'income', 'both'].includes(type) ? type : 'expense',
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// @desc    Update/rename custom category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this category' });
    }

    if (name) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Category name cannot be empty' });
      }

      // Check duplicates
      const existing = await Category.findOne({
        userId: req.user._id,
        _id: { $ne: category._id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({ message: 'Another custom category with this name already exists' });
      }

      const oldName = category.name;
      category.name = trimmedName;

      // Update existing transactions with old category name to new name
      await Transaction.updateMany(
        { userId: req.user._id, category: oldName },
        { category: trimmedName }
      );
    }

    if (type && ['expense', 'income', 'both'].includes(type)) {
      category.type = type;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// @desc    Delete custom category safely
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }

    // Check if category is used by any transactions
    const transactionCount = await Transaction.countDocuments({
      userId: req.user._id,
      category: category.name,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: `Cannot delete '${category.name}' because it is currently used in ${transactionCount} transaction(s). Reassign them first.`,
      });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting category' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
};
