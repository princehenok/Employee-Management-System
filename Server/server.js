require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const startPayrollResetJob = require('./jobs/payrollReset')

const employeeRoutes = require('./routes/employeeRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const salaryRoutes = require('./routes/salaryRoutes')
const leaveRoutes = require('./routes/leaveRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const performanceRoutes = require('./routes/performanceRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/employees', employeeRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/salary', salaryRoutes)
app.use('/api/leaves', leaveRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/performance', performanceRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
      startPayrollResetJob()
    })
  })
  .catch((err) => console.log('❌ DB connection error:', err))
