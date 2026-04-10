const express = require('express');
const router = express.Router();
const Recurring = require('../models/Recurring');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const recurring = await Recurring.find({ user: req.user._id }).sort({ nextDueDate: 1 });
    res.json({ success: true, data: recurring });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const recurring = await Recurring.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: recurring });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const recurring = await Recurring.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: recurring });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Recurring.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Recurring transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
