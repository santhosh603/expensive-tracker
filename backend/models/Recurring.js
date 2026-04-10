const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'Auto'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: String,
  lastProcessed: Date
}, { timestamps: true });

module.exports = mongoose.model('Recurring', recurringSchema);
