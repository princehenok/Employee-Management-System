import { useState, useEffect } from 'react'
import { getPayroll, processPayroll, markAsPaid, addSalaryRecord, resetPayroll } from '../services/api'
import { useRole } from '../hooks/useRole'
import { Link } from 'react-router-dom'
import TaxCalculator from '../components/TaxCalculator'
import { generatePayslip } from '../utils/generatePayslip'

export default function Payroll() {
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('payroll')
  const { isAdmin } = useRole()

  useEffect(() => {
    fetchPayroll()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchPayroll = async () => {
    try {
      const res = await getPayroll()
      setPayroll(res.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const handleProcessPayroll = async () => {
    if (!window.confirm('Process all pending payroll? This will mark all pending salaries as paid.')) return
    setProcessing(true)
    try {
      await processPayroll()
      fetchPayroll()
    } catch (err) {
      console.log(err)
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await markAsPaid(id)
      fetchPayroll()
    } catch (err) {
      console.log(err)
    }
  }

  const handleCreateAndPay = async (employeeId) => {
    try {
      const emp = payroll.find(p => p.employee._id === employeeId)
      if (!emp) return
      await addSalaryRecord({
        employeeId,
        amount: emp.employee.salary,
        reason: 'Initial',
        note: 'Auto created'
      })
      fetchPayroll()
    } catch (err) {
      console.log(err)
    }
  }

  const handleResetPayroll = async () => {
    if (!window.confirm('Start new month? This will create new pending records for all active employees.')) return
    try {
      await resetPayroll()
      fetchPayroll()
    } catch (err) {
      console.log(err)
    }
  }

  const filtered = payroll.filter(p =>
    p.employee.name.toLowerCase().includes(search.toLowerCase()) ||
    p.employee.department.toLowerCase().includes(search.toLowerCase())
  )

  const totalMonthlyPayroll = payroll.reduce((sum, p) => sum + p.employee.salary, 0)
  const pendingCount = payroll.filter(p => p.latestRecord?.status === 'Pending').length
  const paidCount = payroll.filter(p => p.latestRecord?.status === 'Paid').length
  const avgMonthlySalary = payroll.length ? Math.round(totalMonthlyPayroll / payroll.length) : 0

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading payroll...</p>
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
            Payroll
            <span className="ml-3 text-sm font-semibold bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
              {pendingCount} pending
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and process employee salaries</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={handleResetPayroll}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <span>🔄</span>
              New Month
            </button>
            <button
              onClick={handleProcessPayroll}
              disabled={processing || pendingCount === 0}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="text-lg">💸</span>
              {processing ? 'Processing...' : 'Process All Payroll'}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Employees', value: payroll.length, icon: '👥', color: 'from-blue-500 to-indigo-500' },
          { label: 'Pending Payment', value: pendingCount, icon: '⏳', color: 'from-yellow-400 to-orange-500' },
          { label: 'Paid', value: paidCount, icon: '✅', color: 'from-green-400 to-emerald-500' },
          { label: 'Avg Monthly', value: `ETB ${avgMonthlySalary.toLocaleString()}`, icon: '💰', color: 'from-purple-400 to-violet-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full translate-x-6 -translate-y-6`} />
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Banner */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-10 translate-y-10" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Total Monthly Payroll</p>
            <p className="text-5xl font-black">ETB {totalMonthlyPayroll.toLocaleString()}</p>
            <p className="text-green-200 mt-2">Per month • {payroll.length} employees</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-right">
            <p className="text-green-200 text-sm">Avg Monthly Salary</p>
            <p className="text-3xl font-black">ETB {avgMonthlySalary.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: 'payroll', label: 'Payroll List', icon: '💰' },
          { id: 'calculator', label: 'Tax Calculator', icon: '🧮' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-green-50/30 dark:from-gray-900 dark:to-green-900/10 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Salary</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payslip</th>
                  {isAdmin && <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((item) => (
                  <tr key={item.employee._id} className="group hover:bg-green-50/40 dark:hover:bg-green-900/10 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                          {item.employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/employees/${item.employee._id}`}
                            className="font-bold text-gray-800 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          >
                            {item.employee.name}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.employee.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg text-sm font-medium">
                        {item.employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-800 dark:text-white">
                        ETB {item.employee.salary.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        item.latestRecord?.status === 'Paid'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.latestRecord?.status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                        {item.latestRecord?.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => generatePayslip(item.employee)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-105 transition-all duration-200 text-sm font-semibold"
                      >
                        📄 Download
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        {!item.latestRecord ? (
                          <button
                            onClick={() => handleCreateAndPay(item.employee._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-105 transition-all duration-200 text-sm font-semibold"
                          >
                            ➕ Create & Pay
                          </button>
                        ) : item.latestRecord?.status !== 'Paid' ? (
                          <button
                            onClick={() => handleMarkPaid(item.latestRecord?._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 hover:scale-105 transition-all duration-200 text-sm font-semibold"
                          >
                            ✅ Mark Paid
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">✅ Already paid</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-gray-500 dark:text-gray-400 font-semibold">No results found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tax Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="max-w-2xl mx-auto">
          <TaxCalculator />
        </div>
      )}
    </div>
  )
}