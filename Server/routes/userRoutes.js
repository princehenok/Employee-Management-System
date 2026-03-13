const express = require('express')
const router = express.Router()
const {
  getUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/roleMiddleware')

router.use(protect)
router.use(authorizeRoles('admin'))

router.get('/', getUsers)
router.put('/:id/role', updateUserRole)
router.delete('/:id', deleteUser)

module.exports = router