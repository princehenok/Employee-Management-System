const Leave = require('../models/Leave')
const Employee = require('../models/Employee')

// Get all leaves (admin/hr)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name email department position')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
    res.status(200).json(leaves)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get leaves by employee
exports.getEmployeeLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.params.employeeId })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
    res.status(200).json(leaves)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create leave request
exports.createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body

    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    if (totalDays <= 0) {
      return res.status(400).json({ message: 'End date must be after start date' })
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: 'Pending'
    })

    const populated = await Leave.findById(leave._id)
      .populate('employee', 'name email department position')

    res.status(201).json(populated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Approve leave
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        reviewedBy: req.user._id,
        reviewNote: req.body.reviewNote || '',
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('employee', 'name email department position')
     .populate('reviewedBy', 'name')

    if (!leave) return res.status(404).json({ message: 'Leave not found' })
    res.status(200).json(leave)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Reject leave
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        reviewedBy: req.user._id,
        reviewNote: req.body.reviewNote || '',
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('employee', 'name email department position')
     .populate('reviewedBy', 'name')

    if (!leave) return res.status(404).json({ message: 'Leave not found' })
    res.status(200).json(leave)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Delete leave
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id)
    if (!leave) return res.status(404).json({ message: 'Leave not found' })
    res.status(200).json({ message: 'Leave deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get leave stats
exports.getLeaveStats = async (req, res) => {
  try {
    const total = await Leave.countDocuments()
    const pending = await Leave.countDocuments({ status: 'Pending' })
    const approved = await Leave.countDocuments({ status: 'Approved' })
    const rejected = await Leave.countDocuments({ status: 'Rejected' })

    const byType = await Leave.aggregate([
      { $group: { _id: '$leaveType', count: { $sum: 1 } } }
    ])

    res.status(200).json({ total, pending, approved, rejected, byType })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}