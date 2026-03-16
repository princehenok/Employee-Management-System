import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// Employees
export const getEmployees = () => API.get('/employees')
export const getEmployee = (id) => API.get(`/employees/${id}`)
export const createEmployee = (data) => API.post('/employees', data)
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data)
export const deleteEmployee = (id) => API.delete(`/employees/${id}`)

// Auth
export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)

// Users
export const getUsers = () => API.get('/users')
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role })
export const deleteUser = (id) => API.delete(`/users/${id}`)

// Salary
export const getEmployeeSalaryHistory = (employeeId) => API.get(`/salary/${employeeId}`)
export const addSalaryRecord = (data) => API.post('/salary', data)
export const markAsPaid = (id) => API.put(`/salary/${id}/paid`)
export const getPayroll = () => API.get('/salary/payroll')
export const processPayroll = () => API.post('/salary/process')
export const resetPayroll = () => API.post('/salary/reset')

// Leave
export const getAllLeaves = () => API.get('/leaves')
export const getEmployeeLeaves = (employeeId) => API.get(`/leaves/employee/${employeeId}`)
export const createLeave = (data) => API.post('/leaves', data)
export const approveLeave = (id, data) => API.put(`/leaves/${id}/approve`, data)
export const rejectLeave = (id, data) => API.put(`/leaves/${id}/reject`, data)
export const deleteLeave = (id) => API.delete(`/leaves/${id}`)
export const getLeaveStats = () => API.get('/leaves/stats')

// Attendance
export const clockIn = (data) => API.post('/attendance/clock-in', data)
export const clockOut = (data) => API.post('/attendance/clock-out', data)
export const getTodayAttendance = (employeeId) => API.get(`/attendance/today/${employeeId}`)
export const getAllAttendance = (date) => API.get(`/attendance/all${date ? `?date=${date}` : ''}`)
export const getMonthlyAttendance = (employeeId, month, year) => API.get(`/attendance/monthly/${employeeId}/${month}/${year}`)
export const getAttendanceStats = () => API.get('/attendance/stats')

// Performance
export const getAllReviews = () => API.get('/performance')
export const getEmployeeReviews = (employeeId) => API.get(`/performance/employee/${employeeId}`)
export const createReview = (data) => API.post('/performance', data)
export const updateReview = (id, data) => API.put(`/performance/${id}`, data)
export const deleteReview = (id) => API.delete(`/performance/${id}`)
export const getPerformanceStats = () => API.get('/performance/stats')