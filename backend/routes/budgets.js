const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.use(protect);

// @GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const { month = new Date().getMonth(), year = new Date().getFullYear() } = req.query;

    const budgets = await Budget.find({
      user: req.user._id,
      month: parseInt(month),
      year: parseInt(year)
    });

    // Get spending for each budget category
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);

    const spending = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' }
        }
      }
    ]);

    const spendingMap = {};
    spending.forEach(s => { spendingMap[s._id] = s.spent; });

    const budgetsWithSpending = budgets.map(b => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
      remaining: b.limit - (spendingMap[b.category] || 0),
      percentage: Math.round(((spendingMap[b.category] || 0) / b.limit) * 100)
    }));

    res.json({ success: true, data: budgetsWithSpending });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const { category, limit, period, month, year, alertThreshold, color, icon } = req.body;

    const existing = await Budget.findOne({
      user: req.user._id,
      category,
      month: parseInt(month),
      year: parseInt(year)
    });

    if (existing) {
      return res.status(400).json({ error: 'Budget for this category already exists for this period' });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category, limit, period,
      month: parseInt(month),
      year: parseInt(year),
      alertThreshold, color, icon
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ error: 'Server error creating budget' });
  }
});

// @PUT /api/budgets/:id
router.put('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
