const express = require('express')
const router = express.Router()
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

// All routes require login
router.use(protect)

// Anyone logged in can view
router.get('/', getEmployees)
router.get('/:id', getEmployee)

// Only admin and hr_manager can add/edit
router.post('/', authorizeRoles('admin', 'hr_manager'), createEmployee)
router.put('/:id', authorizeRoles('admin', 'hr_manager'), updateEmployee)

// Only admin can delete
router.delete('/:id', authorizeRoles('admin'), deleteEmployee)

module.exports = router