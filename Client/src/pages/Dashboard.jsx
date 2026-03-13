import { useState, useEffect, useRef } from 'react'
import { getEmployees } from '../services/api'
import { Link } from 'react-router-dom'

// Animated counter
function Counter({ target, duration = 1500, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true)
        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, started])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// Mini bar chart
function BarChart({ data, maxValue }) {
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-400 transition-all duration-1000 hover:from-indigo-600 hover:to-purple-400 cursor-pointer"
            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
            title={`${item.label}: ${item.value}`}
          />
        </div>
      ))}
    </div>
  )
}

// Donut chart using SVG
function DonutChart({ active, inactive, total }) {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const activePercent = total > 0 ? (active / total) : 0
  const inactivePercent = total > 0 ? (inactive / total) : 0
  const activeDash = activePercent * circumference
  const inactiveDash = inactivePercent * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="20" className="dark:stroke-gray-700" />
        {/* Inactive arc */}
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="#fca5a5"
          strokeWidth="20"
          strokeDasharray={`${inactiveDash} ${circumference - inactiveDash}`}
          strokeDashoffset={-activeDash}
          strokeLinecap="round"
          className="transition-all duration-1000"
          style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
        />
        {/* Active arc */}
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth="20"
          strokeDasharray={`${activeDash} ${circumference - activeDash}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          className="transition-all duration-1000"
          style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
        />
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-gray-800 dark:text-white">{total}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
      </div>
    </div>
  )
}

// Salary range bar
function SalaryBar({ label, value, max, color }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    setTimeout(() => setWidth((value / max) * 100), 300)
  }, [value, max])

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold text-gray-800 dark:text-white">${value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getEmployees()
        setEmployees(res.data)
        setLoading(false)
        setTimeout(() => setVisible(true), 100)
      } catch (err) {
        console.log(err)
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  // Stats
  const total = employees.length
  const active = employees.filter(e => e.status === 'Active').length
  const inactive = employees.filter(e => e.status === 'Inactive').length
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0)
  const avgSalary = total ? Math.round(totalSalary / total) : 0
  const maxSalary = total ? Math.max(...employees.map(e => e.salary)) : 0
  const minSalary = total ? Math.min(...employees.map(e => e.salary)) : 0

  // Departments
  const deptMap = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1
    return acc
  }, {})
  const departments = Object.entries(deptMap).sort((a, b) => b[1] - a[1])
  const maxDeptCount = departments[0]?.[1] || 1

  // Salary by department
  const salaryByDept = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) acc[emp.department] = { total: 0, count: 0 }
    acc[emp.department].total += emp.salary
    acc[emp.department].count += 1
    return acc
  }, {})
  const avgSalaryByDept = Object.entries(salaryByDept)
    .map(([dept, data]) => ({ dept, avg: Math.round(data.total / data.count) }))
    .sort((a, b) => b.avg - a.avg)

  // Top earners
  const topEarners = [...employees].sort((a, b) => b.salary - a.salary).slice(0, 5)

  // Recently joined
  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 5)

  // Position breakdown
  const positionMap = employees.reduce((acc, emp) => {
    acc[emp.position] = (acc[emp.position] || 0) + 1
    return acc
  }, {})
  const positions = Object.entries(positionMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const deptColors = [
    'from-blue-500 to-indigo-500',
    'from-purple-500 to-violet-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-cyan-500 to-teal-500',
  ]

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading dashboard...</p>
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
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time insights across your workforce</p>
        </div>
        <Link
          to="/employees"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
        >
          👥 Manage Employees
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {['overview', 'salary', 'departments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'overview' ? '📊' : tab === 'salary' ? '💰' : '🏢'} {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Employees', value: total, icon: '👥', color: 'from-blue-500 to-indigo-600', suffix: '' },
              { label: 'Active', value: active, icon: '✅', color: 'from-green-400 to-emerald-600', suffix: '' },
              { label: 'Inactive', value: inactive, icon: '⛔', color: 'from-red-400 to-rose-600', suffix: '' },
              { label: 'Avg Salary', value: avgSalary, icon: '💰', color: 'from-purple-500 to-violet-600', prefix: '$' },
            ].map(({ label, value, icon, color, suffix = '', prefix = '' }) => (
              <div key={label} className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full`} />
                <div className={`absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br ${color} opacity-5 rounded-full`} />
                <p className="text-3xl mb-3">{icon}</p>
                <p className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  <Counter target={value} prefix={prefix} suffix={suffix} />
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Donut Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Employee Status</h3>
              <div className="flex flex-col items-center">
                <DonutChart active={active} inactive={inactive} total={total} />
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active <strong className="text-gray-800 dark:text-white">{active}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inactive <strong className="text-gray-800 dark:text-white">{inactive}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Dept. Distribution</h3>
              {departments.length > 0 ? (
                <>
                  <BarChart
                    data={departments.slice(0, 6).map(([label, value]) => ({ label, value }))}
                    maxValue={maxDeptCount}
                  />
                  <div className="flex justify-between mt-2">
                    {departments.slice(0, 6).map(([label]) => (
                      <span key={label} className="text-xs text-gray-400 truncate w-10 text-center">{label.slice(0, 3)}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">No data yet</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Salary Insights</h3>
              <div className="space-y-4">
                {[
                  { label: 'Highest', value: maxSalary, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: '⬆️' },
                  { label: 'Average', value: avgSalary, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '➡️' },
                  { label: 'Lowest', value: minSalary, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: '⬇️' },
                  { label: 'Total Payroll', value: totalSalary, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: '💼' },
                ].map(({ label, value, color, bg, icon }) => (
                  <div key={label} className={`flex justify-between items-center ${bg} rounded-xl px-4 py-2.5`}>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{icon} {label}</span>
                    <span className={`font-black text-sm ${color}`}>${value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Top Earners */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">🏆 Top Earners</h3>
              {topEarners.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topEarners.map((emp, i) => (
                    <div key={emp._id} className="flex items-center gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-xl transition-all">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black ${
                        i === 0 ? 'bg-yellow-100 text-yellow-600' :
                        i === 1 ? 'bg-gray-100 text-gray-600' :
                        i === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-50 text-blue-500'
                      }`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{emp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{emp.position}</p>
                      </div>
                      <span className="font-black text-green-600 dark:text-green-400 text-sm">${emp.salary.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Joined */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">🆕 Recently Joined</h3>
              {recentEmployees.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {recentEmployees.map((emp) => (
                    <div key={emp._id} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-xl transition-all">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-black">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{emp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{emp.department}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg font-medium">
                        {new Date(emp.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SALARY TAB ── */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Salary by Department */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-6">💰 Avg Salary by Department</h3>
              {avgSalaryByDept.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet</p>
              ) : (
                avgSalaryByDept.map(({ dept, avg }, i) => (
                  <SalaryBar
                    key={dept}
                    label={dept}
                    value={avg}
                    max={avgSalaryByDept[0].avg}
                    color={deptColors[i % deptColors.length]}
                  />
                ))
              )}
            </div>

            {/* Salary Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-6">📊 Salary Distribution</h3>
              <div className="space-y-4">
                {[
                  { range: 'Under $30k', count: employees.filter(e => e.salary < 30000).length, color: 'from-red-400 to-rose-500' },
                  { range: '$30k – $50k', count: employees.filter(e => e.salary >= 30000 && e.salary < 50000).length, color: 'from-yellow-400 to-amber-500' },
                  { range: '$50k – $80k', count: employees.filter(e => e.salary >= 50000 && e.salary < 80000).length, color: 'from-blue-400 to-indigo-500' },
                  { range: '$80k – $100k', count: employees.filter(e => e.salary >= 80000 && e.salary < 100000).length, color: 'from-green-400 to-emerald-500' },
                  { range: 'Over $100k', count: employees.filter(e => e.salary >= 100000).length, color: 'from-purple-400 to-violet-500' },
                ].map(({ range, count, color }) => (
                  <div key={range}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{range}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{count} employees</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
                        style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payroll Summary */}
            <div className="md:col-span-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-10 translate-y-10" />
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Monthly Payroll', value: Math.round(totalSalary / 12), prefix: '$' },
                  { label: 'Annual Payroll', value: totalSalary, prefix: '$' },
                  { label: 'Avg Monthly', value: Math.round(avgSalary / 12), prefix: '$' },
                  { label: 'Cost Per Employee', value: avgSalary, prefix: '$' },
                ].map(({ label, value, prefix }) => (
                  <div key={label}>
                    <p className="text-blue-200 text-sm font-medium mb-1">{label}</p>
                    <p className="text-2xl font-black">
                      <Counter target={value} prefix={prefix} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DEPARTMENTS TAB ── */}
      {activeTab === 'departments' && (
        <div className="space-y-6">

          {/* Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map(([dept, count], i) => {
              const deptEmployees = employees.filter(e => e.department === dept)
              const deptActive = deptEmployees.filter(e => e.status === 'Active').length
              const deptAvgSalary = Math.round(deptEmployees.reduce((sum, e) => sum + e.salary, 0) / count)
              return (
                <div key={dept} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${deptColors[i % deptColors.length]}`} />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-gray-800 dark:text-white text-lg">{dept}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{count} employees</p>
                    </div>
                    <span className={`text-2xl font-black bg-gradient-to-r ${deptColors[i % deptColors.length]} bg-clip-text text-transparent`}>
                      #{i + 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Active</span>
                      <span className="font-bold text-green-600">{deptActive} / {count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Avg Salary</span>
                      <span className="font-bold text-gray-800 dark:text-white">${deptAvgSalary.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${deptColors[i % deptColors.length]} transition-all duration-1000`}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-right">{Math.round((count / total) * 100)}% of workforce</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Position Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-6">🎯 Top Positions</h3>
            <div className="space-y-4">
              {positions.map(([position, count], i) => (
                <div key={position} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center text-sm font-black">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{position}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${deptColors[i % deptColors.length]} transition-all duration-1000`}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}