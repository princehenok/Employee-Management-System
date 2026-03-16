import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEmployee } from '../services/api'
import { generatePayslip } from '../utils/generatePayslip'

export default function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployee(id)
        setEmployee(res.data)
        setLoading(false)
      } catch (err) {
        console.log(err)
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  if (!employee) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">Employee not found.</p>
      <Link to="/employees" className="text-blue-600 hover:underline">Back to Employees</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/employees')}
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 flex items-center gap-1 font-medium"
      >
        ← Back to Employees
      </button>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">{employee.name}</h2>
            <p className="text-gray-500 dark:text-gray-300">{employee.position} — {employee.department}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                employee.status === 'Active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${employee.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {employee.status}
              </span>
              <button
                onClick={() => generatePayslip(employee)}
                className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
              >
                <span className="group-hover:animate-bounce">📄</span>
                Download Payslip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Email', value: employee.email, icon: '📧' },
          { label: 'Phone', value: employee.phone, icon: '📱' },
          { label: 'Department', value: employee.department, icon: '🏢' },
          { label: 'Position', value: employee.position, icon: '💼' },
          { label: 'Monthly Salary', value: `ETB ${employee.salary.toLocaleString()}`, icon: '💰' },
          { label: 'Join Date', value: new Date(employee.joinDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }), icon: '📅' }
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{icon}</span>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
            </div>
            <p className="font-bold text-gray-800 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}