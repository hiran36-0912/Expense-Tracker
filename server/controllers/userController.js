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

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Load user with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error changing password' });
  }
};

module.exports = { updateProfile, changePassword };
