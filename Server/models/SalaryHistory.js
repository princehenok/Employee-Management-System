const mongoose = require('mongoose')

const salaryHistorySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  previousAmount: {
    type: Number,
    default: 0
  },
  reason: {
    type: String,
    enum: ['Initial', 'Promotion', 'Annual Review', 'Adjustment', 'Bonus', 'Monthly Payroll'],
    default: 'Initial'
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true })

module.exports = mongoose.model('SalaryHistory', salaryHistorySchema)