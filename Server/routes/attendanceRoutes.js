const express = require('express')
const router = express.Router()
const {
  clockIn,
  clockOut,
  getTodayAttendance,
  getAllAttendance,
  getMonthlyAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

router.use(protect)

router.post('/clock-in', clockIn)
router.post('/clock-out', clockOut)
router.get('/today/:employeeId', getTodayAttendance)
router.get('/all', authorizeRoles('admin', 'hr_manager'), getAllAttendance)
router.get('/monthly/:employeeId/:month/:year', getMonthlyAttendance)
router.get('/stats', authorizeRoles('admin', 'hr_manager'), getAttendanceStats)

module.exports = router