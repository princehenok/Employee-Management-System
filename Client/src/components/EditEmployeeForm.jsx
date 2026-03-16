import { useState } from 'react'
import { updateEmployee } from '../services/api'

export default function EditEmployeeForm({ employee, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    position: employee.position,
    salary: employee.salary,
    status: employee.status
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateEmployee(employee._id, formData)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-l-4 border-blue-500 border border-gray-100 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">✏️ Edit Employee</h3>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
            required
          />
          <input
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
            required
          />
          <input
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
            required
          />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">ETB</span>
            <input
              name="salary"
              type="number"
              placeholder="Monthly Salary (ETB)"
              value={formData.salary}
              onChange={handleChange}
              className="w-full pl-14 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
              required
            />
          </div>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Updating...' : '✅ Update Employee'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}