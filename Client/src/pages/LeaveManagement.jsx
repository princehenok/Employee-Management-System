import { useState, useEffect } from 'react'
import { getAllLeaves, getEmployees, createLeave, approveLeave, rejectLeave, deleteLeave, getLeaveStats } from '../services/api'
import { useRole } from '../hooks/useRole'

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const { isAdmin, isHRManager, canEdit } = useRole()

  useEffect(() => {
    fetchAll()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchAll = async () => {
    try {
      const [leavesRes, employeesRes, statsRes] = await Promise.all([
        getAllLeaves(),
        getEmployees(),
        getLeaveStats()
      ])
      setLeaves(leavesRes.data)
      setEmployees(employeesRes.data)
      setStats(statsRes.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createLeave(formData)
      setShowForm(false)
      setFormData({ employeeId: '', leaveType: 'Annual', startDate: '', endDate: '', reason: '' })
      fetchAll()
    } catch (err) {
      console.log(err)
    }
  }

  const handleApprove = async (id) => {
    try {
      await approveLeave(id, { reviewNote })
      setReviewModal(null)
      setReviewNote('')
      fetchAll()
    } catch (err) {
      console.log(err)
    }
  }

  const handleReject = async (id) => {
    try {
      await rejectLeave(id, { reviewNote })
      setReviewModal(null)
      setReviewNote('')
      fetchAll()
    } catch (err) {
      console.log(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return
    try {
      await deleteLeave(id)
      fetchAll()
    } catch (err) {
      console.log(err)
    }
  }

  const filteredLeaves = leaves.filter(l => {
    if (activeTab === 'all') return true
    return l.status.toLowerCase() === activeTab
  })

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (status === 'Rejected') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
  }

  const getLeaveTypeColor = (type) => {
    const colors = {
      Annual: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      Sick: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      Maternity: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      Paternity: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
      Emergency: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      Unpaid: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading leave management...</p>
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
            Leave Management
            <span className="ml-3 text-sm font-semibold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full">
              {stats?.pending || 0} pending
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage employee leave requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 text-lg">{showForm ? '✕' : '+'}</span>
          <span className="relative z-10">{showForm ? 'Cancel' : 'Request Leave'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: stats?.total || 0, icon: '📋', color: 'from-blue-500 to-indigo-500' },
          { label: 'Pending', value: stats?.pending || 0, icon: '⏳', color: 'from-yellow-400 to-orange-500' },
          { label: 'Approved', value: stats?.approved || 0, icon: '✅', color: 'from-green-400 to-emerald-500' },
          { label: 'Rejected', value: stats?.rejected || 0, icon: '❌', color: 'from-red-400 to-rose-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full translate-x-6 -translate-y-6`} />
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Leave Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📝 New Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
                ))}
              </select>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all"
              >
                <option value="Annual">🌴 Annual Leave</option>
                <option value="Sick">🏥 Sick Leave</option>
                <option value="Maternity">👶 Maternity Leave</option>
                <option value="Paternity">👨‍👧 Paternity Leave</option>
                <option value="Emergency">🚨 Emergency Leave</option>
                <option value="Unpaid">💸 Unpaid Leave</option>
              </select>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1 uppercase">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1 uppercase">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all"
                  required
                />
              </div>
              <textarea
                placeholder="Reason for leave..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all resize-none"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: 'all', label: 'All', count: stats?.total || 0 },
          { id: 'pending', label: 'Pending', count: stats?.pending || 0 },
          { id: 'approved', label: 'Approved', count: stats?.approved || 0 },
          { id: 'rejected', label: 'Rejected', count: stats?.rejected || 0 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
            <span className="bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Leave Table */}
      {filteredLeaves.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-700 dark:text-gray-300 font-bold text-xl mb-2">No leave requests found</p>
          <p className="text-gray-400 dark:text-gray-500">Click "Request Leave" to add one</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredLeaves.map((leave) => (
                <tr key={leave._id} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                        {leave.employee?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{leave.employee?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{leave.employee?.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getLeaveTypeColor(leave.leaveType)}`}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-800 dark:text-white">{leave.totalDays}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm"> days</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' → '}
                      {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-32">{leave.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(leave.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        leave.status === 'Approved' ? 'bg-green-500' :
                        leave.status === 'Rejected' ? 'bg-red-500' :
                        'bg-yellow-500 animate-pulse'
                      }`} />
                      {leave.status}
                    </span>
                    {leave.reviewedBy && (
                      <p className="text-xs text-gray-400 mt-1">by {leave.reviewedBy.name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {canEdit && leave.status === 'Pending' && (
                        <button
                          onClick={() => { setReviewModal(leave); setReviewNote('') }}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-105 transition-all duration-200 text-sm font-semibold"
                        >
                          👀 Review
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(leave._id)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-110 transition-all duration-200"
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
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">Review Leave Request</h3>

            {/* Employee info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <p className="font-bold text-gray-800 dark:text-white">{reviewModal.employee?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{reviewModal.leaveType} Leave • {reviewModal.totalDays} days</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(reviewModal.startDate).toLocaleDateString()} → {new Date(reviewModal.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">"{reviewModal.reason}"</p>
            </div>

            {/* Review note */}
            <textarea
              placeholder="Add a review note (optional)..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all resize-none mb-4"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(reviewModal._id)}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => handleApprove(reviewModal._id)}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all"
              >
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}