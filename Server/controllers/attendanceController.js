const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')

// Clock in
exports.clockIn = async (req, res) => {
  try {
    const { employeeId } = req.body
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      employee: employeeId,
      date: today
    })

    if (existing) {
      return res.status(400).json({ message: 'Already clocked in today' })
    }

    const clockInTime = new Date()
    const workStartTime = new Date()
    workStartTime.setHours(9, 0, 0, 0) // 9:00 AM

    // Determine status
    const status = clockInTime > workStartTime ? 'Late' : 'Present'

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      clockIn: clockInTime,
      status
    })

    const populated = await Attendance.findById(attendance._id)
      .populate('employee', 'name department position')

    res.status(201).json(populated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Clock out
exports.clockOut = async (req, res) => {
  try {
    const { employeeId } = req.body
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today
    })

    if (!attendance) {
      return res.status(404).json({ message: 'No clock-in record found for today' })
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out today' })
    }

    const clockOutTime = new Date()
    const hoursWorked = ((clockOutTime - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2)

    // Update status based on hours
    let status = attendance.status
    if (hoursWorked < 4) status = 'Half Day'

    attendance.clockOut = clockOutTime
    attendance.hoursWorked = parseFloat(hoursWorked)
    attendance.status = status
    await attendance.save()

    const populated = await Attendance.findById(attendance._id)
      .populate('employee', 'name department position')

    res.status(200).json(populated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Get today's attendance for an employee
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await Attendance.findOne({
      employee: req.params.employeeId,
      date: today
    }).populate('employee', 'name department position')

    res.status(200).json(attendance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get all attendance (HR view)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query
    const filter = {}

    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      filter.date = { $gte: start, $lte: end }
    }

    const attendance = await Attendance.find(filter)
      .populate('employee', 'name department position')
      .sort({ date: -1, clockIn: -1 })

    res.status(200).json(attendance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get monthly attendance for an employee
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 })

    res.status(200).json(attendance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get attendance stats
exports.getAttendanceStats = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Today's stats
    const todayRecords = await Attendance.find({
      date: { $gte: today, $lte: todayEnd }
    })

    const totalEmployees = await Employee.countDocuments({ status: 'Active' })
    const presentToday = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length
    const lateToday = todayRecords.filter(r => r.status === 'Late').length
    const absentToday = totalEmployees - presentToday

    // This month stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthRecords = await Attendance.find({
      date: { $gte: monthStart, $lte: todayEnd }
    })

    const avgHoursWorked = monthRecords.length > 0
      ? (monthRecords.reduce((sum, r) => sum + r.hoursWorked, 0) / monthRecords.length).toFixed(1)
      : 0

    res.status(200).json({
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      avgHoursWorked,
      todayRecords: todayRecords.length
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}