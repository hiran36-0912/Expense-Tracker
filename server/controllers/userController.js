const User = require('../models/User');

const updateProfile = async (req, res) => {
  const { name, budget } = req.body;

  try {
    const updateData = {};
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      if (name.trim().length > 50) {
        return res.status(400).json({ message: 'Name cannot exceed 50 characters' });
      }
      updateData.name = name.trim();
    }

    if (budget !== undefined) {
      const budgetNum = parseFloat(budget);
      if (isNaN(budgetNum) || budgetNum < 0) {
        return res.status(400).json({ message: 'Budget must be a non-negative number' });
      }
      updateData.budget = budgetNum;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      budget: user.budget || 0,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = { updateProfile };
