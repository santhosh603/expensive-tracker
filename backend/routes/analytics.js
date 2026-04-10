const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.use(protect);

// @GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonth, lastMonth, allTime] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: currentMonthStart } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    const formatSummary = (data) => {
      const result = { income: 0, expense: 0, count: 0 };
      data.forEach(d => {
        if (d._id === 'income') result.income = d.total;
        if (d._id === 'expense') { result.expense = d.total; result.count = d.count; }
      });
      return result;
    };

    res.json({
      success: true,
      data: {
        currentMonth: formatSummary(currentMonth),
        lastMonth: formatSummary(lastMonth),
        allTime: formatSummary(allTime)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @GET /api/analytics/trend - Monthly trend for last 12 months
router.get('/trend', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    const trend = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @GET /api/analytics/category-breakdown
router.get('/category-breakdown', async (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;

    const match = { user: req.user._id, type };
    if (startDate) match.date = { $gte: new Date(startDate) };
    if (endDate) match.date = { ...match.date, $lte: new Date(endDate) };

    const breakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const total = breakdown.reduce((sum, b) => sum + b.total, 0);
    const data = breakdown.map(b => ({
      ...b,
      percentage: total > 0 ? Math.round((b.total / total) * 100 * 10) / 10 : 0
    }));

    res.json({ success: true, data, total });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @GET /api/analytics/daily - Daily expenses for current month
router.get('/daily', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const daily = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.day': 1 } }
    ]);

    res.json({ success: true, data: daily });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @GET /api/analytics/top-expenses
router.get('/top-expenses', async (req, res) => {
  try {
    const { limit = 5, period = 'month' } = req.query;
    let startDate = new Date();

    if (period === 'month') startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    else if (period === 'week') { startDate.setDate(startDate.getDate() - 7); }
    else if (period === 'year') startDate = new Date(startDate.getFullYear(), 0, 1);

    const expenses = await Expense.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: startDate }
    }).sort({ amount: -1 }).limit(parseInt(limit));

    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @GET /api/analytics/payment-methods
router.get('/payment-methods', async (req, res) => {
  try {
    const data = await Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
