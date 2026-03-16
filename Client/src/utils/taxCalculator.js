// Ethiopian Income Tax Calculator

export const calculateEthiopianTax = (grossSalary) => {
  let tax = 0

  // Ethiopian income tax brackets (monthly)
  if (grossSalary <= 600) {
    tax = 0
  } else if (grossSalary <= 1650) {
    tax = (grossSalary - 600) * 0.10
  } else if (grossSalary <= 3200) {
    tax = (1650 - 600) * 0.10 + (grossSalary - 1650) * 0.15
  } else if (grossSalary <= 5250) {
    tax = (1650 - 600) * 0.10 +
          (3200 - 1650) * 0.15 +
          (grossSalary - 3200) * 0.20
  } else if (grossSalary <= 7800) {
    tax = (1650 - 600) * 0.10 +
          (3200 - 1650) * 0.15 +
          (5250 - 3200) * 0.20 +
          (grossSalary - 5250) * 0.25
  } else if (grossSalary <= 10900) {
    tax = (1650 - 600) * 0.10 +
          (3200 - 1650) * 0.15 +
          (5250 - 3200) * 0.20 +
          (7800 - 5250) * 0.25 +
          (grossSalary - 7800) * 0.30
  } else {
    tax = (1650 - 600) * 0.10 +
          (3200 - 1650) * 0.15 +
          (5250 - 3200) * 0.20 +
          (7800 - 5250) * 0.25 +
          (10900 - 7800) * 0.30 +
          (grossSalary - 10900) * 0.35
  }

  const employeePension = grossSalary * 0.07   // 7%
  const employerPension = grossSalary * 0.11   // 11%
  const totalDeductions = tax + employeePension
  const netSalary = grossSalary - totalDeductions

  return {
    grossSalary: Math.round(grossSalary),
    incomeTax: Math.round(tax),
    employeePension: Math.round(employeePension),
    employerPension: Math.round(employerPension),
    totalDeductions: Math.round(totalDeductions),
    netSalary: Math.round(netSalary),
    taxRate: grossSalary > 0 ? ((tax / grossSalary) * 100).toFixed(1) : 0,
    effectiveRate: grossSalary > 0 ? ((totalDeductions / grossSalary) * 100).toFixed(1) : 0
  }
}

export const getTaxBracket = (grossSalary) => {
  if (grossSalary <= 600) return { rate: '0%', bracket: 'Tax Free' }
  if (grossSalary <= 1650) return { rate: '10%', bracket: 'Bracket 1' }
  if (grossSalary <= 3200) return { rate: '15%', bracket: 'Bracket 2' }
  if (grossSalary <= 5250) return { rate: '20%', bracket: 'Bracket 3' }
  if (grossSalary <= 7800) return { rate: '25%', bracket: 'Bracket 4' }
  if (grossSalary <= 10900) return { rate: '30%', bracket: 'Bracket 5' }
  return { rate: '35%', bracket: 'Bracket 6' }
}