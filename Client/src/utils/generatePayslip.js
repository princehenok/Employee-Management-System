import jsPDF from 'jspdf'
import { calculateEthiopianTax } from './taxCalculator'

export const generatePayslip = (employee) => {
  const doc = new jsPDF()
  const tax = calculateEthiopianTax(employee.salary)
  const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const blue = [37, 99, 235]
  const dark = [17, 24, 39]
  const green = [22, 163, 74]
  const red = [220, 38, 38]
  const purple = [107, 33, 168]
  const lightGray = [249, 250, 251]
  const borderGray = [229, 231, 235]

  let y = 0

  const drawRect = (x, yPos, w, h, color, style = 'F') => {
    doc.setFillColor(...color)
    doc.rect(x, yPos, w, h, style)
  }

  const drawLine = (x1, y1, x2, y2, color = borderGray) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.3)
    doc.line(x1, y1, x2, y2)
  }

  const setText = (text, x, yPos, size = 10, style = 'normal', color = dark) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
    doc.text(String(text), x, yPos)
  }

  const setTextRight = (text, x, yPos, size = 10, style = 'normal', color = dark) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
    doc.text(String(text), x, yPos, { align: 'right' })
  }

  // ── HEADER ──
  drawRect(0, 0, 210, 42, blue)
  setText('EMS', 15, 15, 24, 'bold', [255, 255, 255])
  setText('Employee Management System', 15, 24, 10, 'normal', [200, 220, 255])
  setText('Addis Ababa, Ethiopia  |  contact@ems.com', 15, 31, 9, 'normal', [180, 200, 255])
  setText('+251 911 000 000', 15, 37, 9, 'normal', [180, 200, 255])
  setText('PAYSLIP', 195, 15, 22, 'bold', [255, 255, 255])
  setTextRight(`Period: ${month}`, 195, 24, 9, 'normal', [200, 220, 255])
  setTextRight(`Date: ${new Date().toLocaleDateString()}`, 195, 31, 9, 'normal', [200, 220, 255])

  y = 50

  // ── EMPLOYEE INFO ──
  drawRect(0, y - 4, 210, 36, lightGray)
  drawLine(0, y - 4, 210, y - 4, borderGray)
  drawLine(0, y + 32, 210, y + 32, borderGray)
  setText('EMPLOYEE INFORMATION', 15, y + 4, 9, 'bold', blue)
  setText('Name:', 15, y + 13, 10, 'bold', dark)
  setText(employee.name, 45, y + 13, 10, 'normal', dark)
  setText('Department:', 15, y + 21, 10, 'bold', dark)
  setText(employee.department, 45, y + 21, 10, 'normal', dark)
  setText('Position:', 110, y + 13, 10, 'bold', dark)
  setText(employee.position, 140, y + 13, 10, 'normal', dark)
  setText('Employee ID:', 110, y + 21, 10, 'bold', dark)
  setText(`#${employee._id.toString().slice(-8).toUpperCase()}`, 140, y + 21, 10, 'normal', dark)
  setText('Status:', 110, y + 29, 10, 'bold', dark)
  setText(employee.status, 140, y + 29, 10, 'bold', employee.status === 'Active' ? green : red)

  y += 42

  // ── EARNINGS ──
  setText('EARNINGS', 15, y, 11, 'bold', blue)
  y += 5

  drawRect(15, y, 180, 8, blue)
  setText('Description', 18, y + 5.5, 9, 'bold', [255, 255, 255])
  setTextRight('Amount (ETB)', 192, y + 5.5, 9, 'bold', [255, 255, 255])
  y += 8

  drawRect(15, y, 180, 8, [240, 249, 255])
  drawLine(15, y + 8, 195, y + 8)
  setText('Monthly Gross Salary', 18, y + 5.5, 9, 'normal', dark)
  setTextRight(`ETB ${tax.grossSalary.toLocaleString()}`, 192, y + 5.5, 9, 'bold', dark)
  y += 12

  // ── DEDUCTIONS ──
  setText('DEDUCTIONS', 15, y, 11, 'bold', red)
  y += 5

  drawRect(15, y, 180, 8, red)
  setText('Description', 18, y + 5.5, 9, 'bold', [255, 255, 255])
  setText('Rate', 140, y + 5.5, 9, 'bold', [255, 255, 255])
  setTextRight('Amount (ETB)', 192, y + 5.5, 9, 'bold', [255, 255, 255])
  y += 8

  drawRect(15, y, 180, 8, [255, 245, 245])
  drawLine(15, y + 8, 195, y + 8)
  setText('Income Tax (Ethiopian Revenue Authority)', 18, y + 5.5, 9, 'normal', dark)
  setText(getTaxRate(tax.grossSalary), 140, y + 5.5, 9, 'normal', red)
  setTextRight(`ETB ${tax.incomeTax.toLocaleString()}`, 192, y + 5.5, 9, 'bold', red)
  y += 8

  drawLine(15, y + 8, 195, y + 8)
  setText('Employee Pension Contribution', 18, y + 5.5, 9, 'normal', dark)
  setText('7%', 140, y + 5.5, 9, 'normal', [234, 88, 12])
  setTextRight(`ETB ${tax.employeePension.toLocaleString()}`, 192, y + 5.5, 9, 'bold', [234, 88, 12])
  y += 8

  drawRect(15, y, 180, 8, [254, 226, 226])
  drawLine(15, y + 8, 195, y + 8)
  setText('Total Deductions', 18, y + 5.5, 9, 'bold', red)
  setTextRight(`ETB ${tax.totalDeductions.toLocaleString()}`, 192, y + 5.5, 9, 'bold', red)
  y += 12

  // ── NET SALARY ──
  drawRect(15, y, 180, 14, green)
  setText('NET SALARY (TAKE HOME PAY)', 20, y + 9, 12, 'bold', [255, 255, 255])
  setTextRight(`ETB ${tax.netSalary.toLocaleString()}`, 192, y + 9, 13, 'bold', [255, 255, 255])
  y += 20

  // ── EMPLOYER COST ──
  setText('EMPLOYER COST', 15, y, 11, 'bold', purple)
  y += 5

  drawRect(15, y, 180, 8, purple)
  setText('Description', 18, y + 5.5, 9, 'bold', [255, 255, 255])
  setText('Rate', 140, y + 5.5, 9, 'bold', [255, 255, 255])
  setTextRight('Amount (ETB)', 192, y + 5.5, 9, 'bold', [255, 255, 255])
  y += 8

  drawRect(15, y, 180, 8, [250, 245, 255])
  drawLine(15, y + 8, 195, y + 8)
  setText('Gross Salary', 18, y + 5.5, 9, 'normal', dark)
  setText('—', 140, y + 5.5, 9, 'normal', dark)
  setTextRight(`ETB ${tax.grossSalary.toLocaleString()}`, 192, y + 5.5, 9, 'bold', dark)
  y += 8

  drawLine(15, y + 8, 195, y + 8)
  setText('Employer Pension Contribution', 18, y + 5.5, 9, 'normal', dark)
  setText('11%', 140, y + 5.5, 9, 'normal', purple)
  setTextRight(`ETB ${tax.employerPension.toLocaleString()}`, 192, y + 5.5, 9, 'bold', purple)
  y += 8

  drawRect(15, y, 180, 8, [240, 230, 255])
  setText('Total Employer Cost', 18, y + 5.5, 9, 'bold', purple)
  setTextRight(`ETB ${(tax.grossSalary + tax.employerPension).toLocaleString()}`, 192, y + 5.5, 9, 'bold', purple)
  y += 14

  // ── SUMMARY ──
  drawRect(15, y, 180, 8, dark)
  setText('SUMMARY', 18, y + 5.5, 9, 'bold', [255, 255, 255])
  setTextRight('Amount (ETB)', 192, y + 5.5, 9, 'bold', [255, 255, 255])
  y += 8

  const summaryRows = [
    { label: 'Monthly Gross Salary', value: `ETB ${tax.grossSalary.toLocaleString()}`, color: dark, bg: [255, 255, 255] },
    { label: '(-) Income Tax', value: `ETB ${tax.incomeTax.toLocaleString()}`, color: red, bg: [255, 250, 250] },
    { label: '(-) Employee Pension (7%)', value: `ETB ${tax.employeePension.toLocaleString()}`, color: [234, 88, 12], bg: [255, 255, 255] },
    { label: '(=) Net Take Home Pay', value: `ETB ${tax.netSalary.toLocaleString()}`, color: green, bg: [240, 255, 244] },
    { label: '(+) Employer Pension (11%)', value: `ETB ${tax.employerPension.toLocaleString()}`, color: purple, bg: [255, 255, 255] },
    { label: 'Total Company Cost', value: `ETB ${(tax.grossSalary + tax.employerPension).toLocaleString()}`, color: dark, bg: [243, 244, 246] },
  ]

  summaryRows.forEach((row) => {
    drawRect(15, y, 180, 8, row.bg)
    drawLine(15, y + 8, 195, y + 8)
    setText(row.label, 18, y + 5.5, 9, 'normal', dark)
    setTextRight(row.value, 192, y + 5.5, 9, 'bold', row.color)
    y += 8
  })

  y += 8

  // ── SIGNATURES ──
  drawLine(15, y, 85, y)
  drawLine(125, y, 195, y)
  setText('HR Manager Signature', 15, y + 5, 8, 'normal', [107, 114, 128])
  setText('Employee Signature', 125, y + 5, 8, 'normal', [107, 114, 128])

  // ── FOOTER ──
  const pageHeight = doc.internal.pageSize.height
  drawRect(0, pageHeight - 18, 210, 18, blue)
  setText('This payslip is generated automatically by EMS — Employee Management System', 105, pageHeight - 10, 8, 'normal', [200, 220, 255])
  doc.setFont('helvetica', 'normal')
  doc.text('For queries contact HR | Confidential Document', 105, pageHeight - 5, { align: 'center' })

  doc.save(`Payslip_${employee.name.replace(' ', '_')}_${month.replace(' ', '_')}.pdf`)
}

const getTaxRate = (salary) => {
  if (salary <= 600) return '0%'
  if (salary <= 1650) return '10%'
  if (salary <= 3200) return '15%'
  if (salary <= 5250) return '20%'
  if (salary <= 7800) return '25%'
  if (salary <= 10900) return '30%'
  return '35%'
}