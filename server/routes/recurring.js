const express = require('express');
const router = express.Router();
const {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getRecurring).post(createRecurring);
router.route('/:id').put(updateRecurring).delete(deleteRecurring);

module.exports = router;
