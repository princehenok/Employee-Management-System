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

// Users (Admin only)
export const getUsers = () => API.get('/users')
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role })
export const deleteUser = (id) => API.delete(`/users/${id}`)