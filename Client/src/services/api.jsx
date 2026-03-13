import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

export const getEmployees = () => API.get('/employees')
export const getEmployee = (id) => API.get(`/employees/${id}`)
export const createEmployee = (data) => API.post('/employees', data)
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data)
export const deleteEmployee = (id) => API.delete(`/employees/${id}`)

export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)