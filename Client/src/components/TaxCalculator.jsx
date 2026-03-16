import { useState } from 'react'
import { calculateEthiopianTax, getTaxBracket } from '../utils/taxCalculator'

export default function TaxCalculator() {
  const [salary, setSalary] = useState('')
  const [currency, setCurrency] = useState('ETB')
  const [result, setResult] = useState(null)

  const handleCalculate = () => {
    if (!salary || salary <= 0) return
    const calc = calculateEthiopianTax(Number(salary))
    const bracket = getTaxBracket(Number(salary))
    setResult({ ...calc, ...bracket })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            🧮
          </div>
          <div>
            <h3 className="font-black text-xl">Ethiopian Tax Calculator</h3>
            <p className="text-green-100 text-sm">Calculate net salary with Ethiopian tax brackets</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Input */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
              Monthly Gross Salary
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                {currency}
              </span>
              <input
                type="number"
                placeholder="Enter salary..."
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className="w-full pl-16 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-lg font-bold transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-bold transition-all"
            >
              <option value="ETB">ETB 🇪🇹</option>
              <option value="USD">USD 🇺🇸</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="group relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 mb-6"
          style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
            🧮 Calculate Tax
          </span>
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fadeIn">

            {/* Tax bracket badge */}
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3">
              <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">Tax Bracket</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-black">{result.bracket}</span>
                <span className="bg-blue-600 text-white px-3 py-0.5 rounded-full text-sm font-bold">{result.rate}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              {/* Gross */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-sm">💼</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Gross Salary</span>
                </div>
                <span className="font-black text-gray-800 dark:text-white text-lg">{currency} {result.grossSalary.toLocaleString()}</span>
              </div>

              {/* Income Tax */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-sm">🏛️</span>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Income Tax</span>
                    <p className="text-xs text-gray-400">Ethiopian Revenue Authority</p>
                  </div>
                </div>
                <span className="font-black text-red-500">- {currency} {result.incomeTax.toLocaleString()}</span>
              </div>

              {/* Employee Pension */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center text-sm">🏦</span>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Employee Pension</span>
                    <p className="text-xs text-gray-400">7% of gross salary</p>
                  </div>
                </div>
                <span className="font-black text-orange-500">- {currency} {result.employeePension.toLocaleString()}</span>
              </div>

              {/* Total Deductions */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 bg-red-50/50 dark:bg-red-900/10 rounded-xl px-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-sm">📉</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Total Deductions</span>
                </div>
                <span className="font-black text-red-600">- {currency} {result.totalDeductions.toLocaleString()}</span>
              </div>

              {/* Net Salary */}
              <div className="flex justify-between items-center py-4 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center text-lg">💰</span>
                  <div>
                    <span className="font-black text-gray-800 dark:text-white text-lg">Net Salary</span>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Take home pay</p>
                  </div>
                </div>
                <span className="font-black text-green-600 dark:text-green-400 text-2xl">{currency} {result.netSalary.toLocaleString()}</span>
              </div>
            </div>

            {/* Employer Cost */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4">
              <p className="text-purple-700 dark:text-purple-300 font-bold text-sm mb-3">🏢 Employer Total Cost</p>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-purple-600 dark:text-purple-400">Gross Salary + Employer Pension (11%)</p>
                  <p className="text-xs text-purple-500 dark:text-purple-500">{currency} {result.grossSalary.toLocaleString()} + {currency} {result.employerPension.toLocaleString()}</p>
                </div>
                <span className="font-black text-purple-700 dark:text-purple-300 text-xl">
                  {currency} {(result.grossSalary + result.employerPension).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual breakdown bar */}
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Salary Breakdown</p>
              <div className="flex rounded-xl overflow-hidden h-6">
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-1000"
                  style={{ width: `${(result.netSalary / result.grossSalary) * 100}%` }}
                  title={`Net: ${((result.netSalary / result.grossSalary) * 100).toFixed(1)}%`}
                >
                  {((result.netSalary / result.grossSalary) * 100).toFixed(0)}%
                </div>
                <div
                  className="bg-red-400 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(result.incomeTax / result.grossSalary) * 100}%` }}
                  title={`Tax: ${((result.incomeTax / result.grossSalary) * 100).toFixed(1)}%`}
                >
                  {((result.incomeTax / result.grossSalary) * 100).toFixed(0)}%
                </div>
                <div
                  className="bg-orange-400 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(result.employeePension / result.grossSalary) * 100}%` }}
                  title={`Pension: 7%`}
                >
                  7%
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Net Pay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-sm" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Income Tax</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Pension</span>
                </div>
              </div>
            </div>

            {/* Effective rate */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl py-3">
              Effective deduction rate: <span className="font-black text-gray-700 dark:text-gray-200">{result.effectiveRate}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}