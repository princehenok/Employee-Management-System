const cron = require('node-cron')
const Employee = require('../models/Employee')
const SalaryHistory = require('../models/SalaryHistory')

const startPayrollResetJob = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('🔄 Running monthly payroll reset...')
    try {
      const employees = await Employee.find({ status: 'Active' })

      for (const employee of employees) {
        await SalaryHistory.create({
          employee: employee._id,
          amount: employee.salary,
          previousAmount: employee.salary,
          reason: 'Monthly Payroll',
          status: 'Pending',
          note: `Auto generated for ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
        })
      }

      console.log(`✅ Payroll reset complete — ${employees.length} records created`)
    } catch (err) {
      console.log('❌ Payroll reset error:', err)
    }
  })

  console.log('⏰ Payroll reset cron job scheduled (1st of every month)')
}

module.exports = startPayrollResetJob