const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#f59e0b', type: 'expense' },
  { name: 'Transportation', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense' },
  { name: 'Bills & Utilities', icon: '💡', color: '#f97316', type: 'expense' },
  { name: 'Healthcare', icon: '🏥', color: '#ef4444', type: 'expense' },
  { name: 'Education', icon: '📚', color: '#06b6d4', type: 'expense' },
  { name: 'Travel', icon: '✈️', color: '#10b981', type: 'expense' },
  { name: 'Housing', icon: '🏠', color: '#84cc16', type: 'expense' },
  { name: 'Personal Care', icon: '💆', color: '#f43f5e', type: 'expense' },
  { name: 'Investments', icon: '📈', color: '#22c55e', type: 'both' },
  { name: 'Salary', icon: '💼', color: '#22c55e', type: 'income' },
  { name: 'Freelance', icon: '💻', color: '#a855f7', type: 'income' },
  { name: 'Business', icon: '🏢', color: '#0ea5e9', type: 'income' },
  { name: 'Gift', icon: '🎁', color: '#f472b6', type: 'both' },
  { name: 'Other', icon: '📦', color: '#94a3b8', type: 'both' }
];

router.get('/', (req, res) => {
  res.json({ success: true, data: DEFAULT_CATEGORIES });
});

module.exports = router;
