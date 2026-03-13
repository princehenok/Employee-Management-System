import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEmployee } from '../services/api'

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
      <p className="text-gray-500 text-lg">Loading profile...</p>
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
        className="text-blue-600 hover:underline mb-6 flex items-center gap-1"
      >
        ← Back to Employees
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{employee.name}</h2>
            <p className="text-gray-500">{employee.position} — {employee.department}</p>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
              employee.status === 'Active'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {employee.status}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Email</p>
          <p className="font-semibold text-gray-800">{employee.email}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Phone</p>
          <p className="font-semibold text-gray-800">{employee.phone}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Department</p>
          <p className="font-semibold text-gray-800">{employee.department}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Position</p>
          <p className="font-semibold text-gray-800">{employee.position}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Salary</p>
          <p className="font-semibold text-gray-800">${employee.salary.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm mb-1">Join Date</p>
          <p className="font-semibold text-gray-800">
            {new Date(employee.joinDate).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}