const express = require('express')
const router = express.Router()
const {
  getAllReviews,
  getEmployeeReviews,
  createReview,
  updateReview,
  deleteReview,
  getPerformanceStats
} = require('../controllers/performanceController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

router.use(protect)

router.get('/', authorizeRoles('admin', 'hr_manager'), getAllReviews)
router.get('/stats', authorizeRoles('admin', 'hr_manager'), getPerformanceStats)
router.get('/employee/:employeeId', getEmployeeReviews)
router.post('/', authorizeRoles('admin', 'hr_manager'), createReview)
router.put('/:id', authorizeRoles('admin', 'hr_manager'), updateReview)
router.delete('/:id', authorizeRoles('admin'), deleteReview)

module.exports = router