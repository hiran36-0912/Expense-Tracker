const express = require('express');
const router = express.Router();
const {
  getReportSummary,
  getReportMonthly,
  getReportCategories,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getReportSummary);
router.get('/monthly', getReportMonthly);
router.get('/categories', getReportCategories);

module.exports = router;
