const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['Emergency Fund', 'Vacation', 'Home', 'Car', 'Education', 'Retirement', 'Wedding', 'Technology', 'Business', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#10b981'
  },
  icon: {
    type: String,
    default: '🎯'
  },
  monthlyContribution: {
    type: Number,
    default: 0
  },
  contributions: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
