const PerformanceReview = require('../models/PerformanceReview')
const Employee = require('../models/Employee')

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find()
      .populate('employee', 'name department position')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
    res.status(200).json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get reviews for an employee
exports.getEmployeeReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find({ employee: req.params.employeeId })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
    res.status(200).json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create review
exports.createReview = async (req, res) => {
  try {
    const { employeeId, period, ratings, feedback, strengths, improvements } = req.body

    const overallScore = parseFloat((
      (ratings.productivity + ratings.communication + ratings.teamwork + ratings.leadership + ratings.punctuality) / 5
    ).toFixed(1))

    const review = await PerformanceReview.create({
      employee: employeeId,
      reviewedBy: req.user._id,
      period,
      ratings,
      overallScore,
      feedback,
      strengths,
      improvements
    })

    const populated = await PerformanceReview.findById(review._id)
      .populate('employee', 'name department position')
      .populate('reviewedBy', 'name')

    res.status(201).json(populated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { ratings, feedback, strengths, improvements, period } = req.body

    const overallScore = parseFloat((
      (ratings.productivity + ratings.communication + ratings.teamwork + ratings.leadership + ratings.punctuality) / 5
    ).toFixed(1))

    const review = await PerformanceReview.findByIdAndUpdate(
      req.params.id,
      { ratings, overallScore, feedback, strengths, improvements, period },
      { new: true }
    ).populate('employee', 'name department position')
     .populate('reviewedBy', 'name')

    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.status(200).json(review)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndDelete(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.status(200).json({ message: 'Review deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get performance stats
exports.getPerformanceStats = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find()
      .populate('employee', 'name department position')

    const totalReviews = reviews.length
    const avgOverallScore = totalReviews > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.overallScore, 0) / totalReviews).toFixed(1))
      : 0

    // Top performers
    const employeeScores = {}
    reviews.forEach(r => {
      if (!employeeScores[r.employee._id]) {
        employeeScores[r.employee._id] = {
          employee: r.employee,
          scores: [],
          avgScore: 0
        }
      }
      employeeScores[r.employee._id].scores.push(r.overallScore)
    })

    Object.values(employeeScores).forEach(e => {
      e.avgScore = parseFloat((e.scores.reduce((sum, s) => sum + s, 0) / e.scores.length).toFixed(1))
    })

    const topPerformers = Object.values(employeeScores)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5)

    // Score distribution
    const excellent = reviews.filter(r => r.overallScore >= 4.5).length
    const good = reviews.filter(r => r.overallScore >= 3.5 && r.overallScore < 4.5).length
    const average = reviews.filter(r => r.overallScore >= 2.5 && r.overallScore < 3.5).length
    const poor = reviews.filter(r => r.overallScore < 2.5).length

    res.status(200).json({
      totalReviews,
      avgOverallScore,
      topPerformers,
      distribution: { excellent, good, average, poor }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}