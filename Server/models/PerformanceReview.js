const mongoose = require('mongoose')

const performanceReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    required: true // e.g. "Q1 2026"
  },
  ratings: {
    productivity: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    teamwork: { type: Number, min: 1, max: 5, required: true },
    leadership: { type: Number, min: 1, max: 5, required: true },
    punctuality: { type: Number, min: 1, max: 5, required: true },
  },
  overallScore: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    required: true
  },
  strengths: {
    type: String,
    default: ''
  },
  improvements: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted'],
    default: 'Submitted'
  }
}, { timestamps: true })

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema)