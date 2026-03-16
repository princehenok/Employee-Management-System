import { useState, useEffect } from 'react'
import { getEmployees, clockIn, clockOut, getTodayAttendance, getAllAttendance, getAttendanceStats, getMonthlyAttendance } from '../services/api'
import { useRole } from '../hooks/useRole'

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState('today')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [monthlyData, setMonthlyData] = useState([])
  const [clockLoading, setClockLoading] = useState({})
  const [todayMap, setTodayMap] = useState({})
  const { isAdmin, isHRManager } = useRole()

  useEffect(() => {
    fetchAll()
    setTimeout(() => setVisible(true), 100)
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  useEffect(() => {
    if (selectedEmployee) fetchMonthly()
  }, [selectedEmployee])

  const fetchAll = async () => {
    try {
      const [empRes, statsRes, attRes] = await Promise.all([
        getEmployees(),
        getAttendanceStats(),
        getAllAttendance(new Date().toISOString().split('T')[0])
      ])
      setEmployees(empRes.data)
      setStats(statsRes.data)
      setAttendance(attRes.data)

      // Build today map
      const map = {}
      attRes.data.forEach(a => {
        map[a.employee._id] = a
      })
      setTodayMap(map)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const fetchAttendance = async () => {
    try {
      const res = await getAllAttendance(selectedDate)
      setAttendance(res.data)
      if (selectedDate === new Date().toISOString().split('T')[0]) {
        const map = {}
        res.data.forEach(a => { map[a.employee._id] = a })
        setTodayMap(map)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchMonthly = async () => {
    try {
      const now = new Date()
      const res = await getMonthlyAttendance(selectedEmployee, now.getMonth() + 1, now.getFullYear())
      setMonthlyData(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleClockIn = async (employeeId) => {
    setClockLoading(prev => ({ ...prev, [employeeId]: true }))
    try {
      await clockIn({ employeeId })
      await fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Error clocking in')
    } finally {
      setClockLoading(prev => ({ ...prev, [employeeId]: false }))
    }
  }

  const handleClockOut = async (employeeId) => {
    setClockLoading(prev => ({ ...prev, [employeeId]: true }))
    try {
      await clockOut({ employeeId })
      await fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Error clocking out')
    } finally {
      setClockLoading(prev => ({ ...prev, [employeeId]: false }))
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      Late: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      Absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      'Half Day': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'On Leave': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const formatTime = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getDaysInMonth = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  }

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading attendance...</p>
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
            Attendance
            <span className="ml-3 text-sm font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
              {stats?.presentToday || 0} present today
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage employee attendance</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-800 dark:text-white">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: '👥', color: 'from-blue-500 to-indigo-500' },
          { label: 'Present Today', value: stats?.presentToday || 0, icon: '✅', color: 'from-green-400 to-emerald-500' },
          { label: 'Absent Today', value: stats?.absentToday || 0, icon: '❌', color: 'from-red-400 to-rose-500' },
          { label: 'Late Today', value: stats?.lateToday || 0, icon: '⏰', color: 'from-yellow-400 to-orange-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full translate-x-6 -translate-y-6`} />
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Avg hours banner */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-16 -translate-y-16" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">This Month's Average</p>
            <p className="text-4xl font-black">{stats?.avgHoursWorked || 0} hrs</p>
            <p className="text-blue-200 mt-1 text-sm">Average hours worked per day</p>
          </div>
          <div className="text-right bg-white/10 rounded-2xl p-4">
            <p className="text-blue-200 text-sm">Attendance Rate</p>
            <p className="text-3xl font-black">
              {stats?.totalEmployees > 0
                ? Math.round((stats?.presentToday / stats?.totalEmployees) * 100)
                : 0}%
            </p>
            <p className="text-blue-200 text-xs">Today</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: 'today', label: 'Today', icon: '📅' },
          { id: 'history', label: 'History', icon: '📋' },
          { id: 'monthly', label: 'Monthly Report', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── TODAY TAB ── */}
      {activeTab === 'today' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white">Today's Attendance</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{employees.length} employees</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clock In</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clock Out</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {employees.map((emp) => {
                const record = todayMap[emp._id]
                const isLoading = clockLoading[emp._id]
                return (
                  <tr key={emp._id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{emp.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{emp.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${record?.clockIn ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        {formatTime(record?.clockIn)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${record?.clockOut ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`}>
                        {formatTime(record?.clockOut)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {record?.hoursWorked ? `${record.hoursWorked}h` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            record.status === 'Present' ? 'bg-green-500 animate-pulse' :
                            record.status === 'Late' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          {record.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!record ? (
                        <button
                          onClick={() => handleClockIn(emp._id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 hover:scale-105 transition-all duration-200 text-xs font-bold disabled:opacity-50"
                        >
                          {isLoading ? '...' : '⏰ Clock In'}
                        </button>
                      ) : !record.clockOut ? (
                        <button
                          onClick={() => handleClockOut(emp._id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 hover:scale-105 transition-all duration-200 text-xs font-bold disabled:opacity-50"
                        >
                          {isLoading ? '...' : '🚪 Clock Out'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">✅ Done</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-all"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{attendance.length} records</span>
          </div>

          {attendance.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">No attendance records for this date</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clock In</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clock Out</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours Worked</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-black text-sm">
                            {record.employee?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">{record.employee?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{record.employee?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">{formatTime(record.clockIn)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-500 dark:text-red-400">{formatTime(record.clockOut)}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800 dark:text-white">{record.hoursWorked ? `${record.hoursWorked}h` : '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MONTHLY REPORT TAB ── */}
      {activeTab === 'monthly' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select Employee:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-all"
            >
              <option value="">Choose an employee...</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
              ))}
            </select>
          </div>

          {!selectedEmployee ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">Select an employee to view monthly report</p>
            </div>
          ) : (
            <div>
              {/* Monthly summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Days', value: getDaysInMonth(), icon: '📅', color: 'from-blue-500 to-indigo-500' },
                  { label: 'Present', value: monthlyData.filter(r => r.status === 'Present').length, icon: '✅', color: 'from-green-400 to-emerald-500' },
                  { label: 'Late', value: monthlyData.filter(r => r.status === 'Late').length, icon: '⏰', color: 'from-yellow-400 to-orange-500' },
                  { label: 'Avg Hours', value: monthlyData.length > 0 ? (monthlyData.reduce((sum, r) => sum + r.hoursWorked, 0) / monthlyData.length).toFixed(1) : 0, icon: '⏱️', color: 'from-purple-400 to-violet-500' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${color} opacity-10 rounded-full translate-x-4 -translate-y-4`} />
                    <div className="text-xl mb-2">{icon}</div>
                    <p className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>

              {/* Calendar view */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                  📅 {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} Attendance
                </h3>
                {monthlyData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No attendance records this month</p>
                ) : (
                  <div className="space-y-2">
                    {monthlyData.map((record) => (
                      <div key={record._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                        <div className="w-12 text-center">
                          <p className="text-lg font-black text-gray-800 dark:text-white">
                            {new Date(record.date).getDate()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                        </div>
                        <div className="flex-1 flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatTime(record.clockIn)} → {formatTime(record.clockOut)}
                          </span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white ml-auto">
                            {record.hoursWorked ? `${record.hoursWorked}h` : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}