import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEmployees, deleteEmployee } from '../services/api'
import AddEmployeeForm from '../components/AddEmployeeForm'
import EditEmployeeForm from '../components/EditEmployeeForm'
import { useRole } from '../hooks/useRole'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [visible, setVisible] = useState(false)
  const itemsPerPage = 5

  const { canEdit, canDelete } = useRole()

  useEffect(() => {
    fetchEmployees()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees()
      setEmployees(res.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id)
      setDeleteConfirm(null)
      fetchEmployees()
    } catch (err) {
      console.log(err)
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Position', 'Salary', 'Status']
    const rows = filtered.map(emp => [
      emp.name, emp.email, emp.phone,
      emp.department, emp.position, emp.salary, emp.status
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employees.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
    const matchDept = filterDept ? emp.department === filterDept : true
    const matchStatus = filterStatus ? emp.status === filterStatus : true
    return matchSearch && matchDept && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const departments = [...new Set(employees.map(emp => emp.department))]

  const stats = [
    { label: 'Total', value: employees.length, color: 'from-blue-500 to-indigo-500', icon: '👥' },
    { label: 'Active', value: employees.filter(e => e.status === 'Active').length, color: 'from-green-400 to-emerald-500', icon: '✅' },
    { label: 'Inactive', value: employees.filter(e => e.status === 'Inactive').length, color: 'from-red-400 to-rose-500', icon: '⛔' },
    { label: 'Departments', value: departments.length, color: 'from-purple-400 to-violet-500', icon: '🏢' },
  ]

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading employees...</p>
    </div>
  )

  return (
    <div
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Employees
            <span className="ml-3 text-sm font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
              {filtered.length} found
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your entire workforce</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="group flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <span className="group-hover:animate-bounce">📥</span>
            Export CSV
          </button>
          {canEdit && (
            <button
              onClick={() => { setShowForm(!showForm); setEditEmployee(null) }}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 text-lg">{showForm ? '✕' : '+'}</span>
              <span className="relative z-10">{showForm ? 'Cancel' : 'Add Employee'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color, icon }) => (
          <div key={label} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full translate-x-6 -translate-y-6`} />
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Forms */}
      {showForm && canEdit && (
        <div className="mb-6">
          <AddEmployeeForm onSuccess={() => { setShowForm(false); fetchEmployees() }} />
        </div>
      )}
      {editEmployee && canEdit && (
        <div className="mb-6">
          <EditEmployeeForm
            employee={editEmployee}
            onSuccess={() => { setEditEmployee(null); fetchEmployees() }}
            onCancel={() => setEditEmployee(null)}
          />
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1) }}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-all"
        >
          <option value="">🏢 All Departments</option>
          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-all"
        >
          <option value="">⚡ All Status</option>
          <option value="Active">✅ Active</option>
          <option value="Inactive">⛔ Inactive</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-700 dark:text-gray-300 font-bold text-xl mb-2">No employees found</p>
          <p className="text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salary</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {paginated.map((emp, index) => (
                <tr
                  key={emp._id}
                  className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{emp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-medium">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm font-medium">{emp.position}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-800 dark:text-white">${emp.salary.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      emp.status === 'Active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link
                        to={`/employees/${emp._id}`}
                        className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 hover:scale-110 transition-all duration-200"
                        title="View Profile"
                      >
                        👁️
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => { setEditEmployee(emp); setShowForm(false) }}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-110 transition-all duration-200"
                          title="Edit Employee"
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteConfirm(emp)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-110 transition-all duration-200"
                          title="Delete Employee"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Showing <span className="font-bold text-gray-700 dark:text-gray-200">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700 dark:text-gray-200">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-bold text-gray-700 dark:text-gray-200">{filtered.length}</span> employees
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
                >
                  ← Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                      currentPage === i + 1
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🗑️
              </div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">Delete Employee?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-700 dark:text-gray-200">{deleteConfirm.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm._id)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}