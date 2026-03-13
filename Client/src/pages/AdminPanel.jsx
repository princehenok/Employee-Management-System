import { useState, useEffect } from 'react'
import { getUsers, updateUserRole, deleteUser } from '../services/api'
import { useRole } from '../hooks/useRole'
import { Navigate } from 'react-router-dom'

export default function AdminPanel() {
  const { isAdmin } = useRole()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetchUsers()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      setUsers(res.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role)
      fetchUsers()
    } catch (err) {
      console.log(err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id)
        fetchUsers()
      } catch (err) {
        console.log(err)
      }
    }
  }

  if (!isAdmin) return <Navigate to="/" />

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading users...</p>
    </div>
  )

  return (
    <div
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-gray-500 dark:text-gray-400">Manage users and assign roles</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'from-blue-500 to-indigo-500' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: '👑', color: 'from-yellow-400 to-orange-500' },
          { label: 'HR Managers', value: users.filter(u => u.role === 'hr_manager').length, icon: '👔', color: 'from-green-400 to-emerald-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <p className="text-2xl mb-2">{icon}</p>
            <p className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
          <h3 className="font-bold text-gray-800 dark:text-white">All Users ({users.length})</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {users.map((u) => (
              <tr key={u._id} className="group hover:bg-yellow-50/40 dark:hover:bg-yellow-900/10 transition-all duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md ${
                      u.role === 'admin'
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                        : u.role === 'hr_manager'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white">{u.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{u.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${
                      u.role === 'admin'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : u.role === 'hr_manager'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <option value="admin">👑 Admin</option>
                    <option value="hr_manager">👔 HR Manager</option>
                    <option value="viewer">👁️ Viewer</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                  {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Delete User"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}