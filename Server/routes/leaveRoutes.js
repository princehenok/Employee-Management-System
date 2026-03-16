const express = require('express')
const router = express.Router()
const {
  getAllLeaves,
  getEmployeeLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
  getLeaveStats
} = require('../controllers/leaveController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

router.use(protect)

router.get('/', authorizeRoles('admin', 'hr_manager'), getAllLeaves)
router.get('/stats', authorizeRoles('admin', 'hr_manager'), getLeaveStats)
router.get('/employee/:employeeId', getEmployeeLeaves)
router.post('/', createLeave)
router.put('/:id/approve', authorizeRoles('admin', 'hr_manager'), approveLeave)
router.put('/:id/reject', authorizeRoles('admin', 'hr_manager'), rejectLeave)
router.delete('/:id', authorizeRoles('admin'), deleteLeave)

module.exports = router