import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  // Animated grid background
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.003

      // Animated grid
      const gridSize = 40
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.07)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Animated dots at intersections
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const dist = Math.sin(time + x * 0.01 + y * 0.01) * 0.5 + 0.5
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(99, 102, 241, ${dist * 0.4})`
          ctx.fill()
        }
      }

      // Scanning line effect
      const scanY = ((time * 100) % (canvas.height + 200)) - 100
      const gradient = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0)')
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)')
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, scanY - 40, canvas.width, 80)

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await loginUser(formData)
      login(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-950">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gray-900">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-lg">E</span>
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">EM<span className="text-blue-400">S</span></p>
              <p className="text-gray-500 text-xs">Management System</p>
            </div>
          </div>

          {/* Center content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Enterprise HR Platform
            </div>
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Manage Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Workforce
              </span>
              <br />
              Smarter
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              A powerful platform to streamline HR operations, track employees, and drive organizational growth.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { value: '99%', label: 'Uptime' },
                { value: '256-bit', label: 'Encryption' },
                { value: '24/7', label: 'Support' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-4">
            {[
              { icon: '👑', role: 'Admin', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
              { icon: '👔', role: 'HR Manager', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
              { icon: '👁️', role: 'Viewer', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
            ].map(({ icon, role, color }) => (
              <div key={role} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${color}`}>
                <span>{icon}</span>
                {role}
              </div>
            ))}
          </div>
        </div>

        {/* Right border glow */}
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-8 bg-gray-950">
        <div
          className="w-full max-w-md transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(30px)'
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">E</span>
            </div>
            <p className="text-white font-black text-lg">EM<span className="text-blue-400">S</span></p>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-black text-white mb-2">Sign In</h2>
            <p className="text-gray-500">Access your management dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className={`relative rounded-xl border transition-all duration-300 ${
                focusedField === 'email'
                  ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'border-gray-800'
              }`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">📧</div>
                <input
                  name="email"
                  type="email"
                  placeholder="your@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-4 bg-gray-900 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className={`relative rounded-xl border transition-all duration-300 ${
                focusedField === 'password'
                  ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'border-gray-800'
              }`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔐</div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-12 py-4 bg-gray-900 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mt-2"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Dashboard
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-700 text-xs font-medium uppercase tracking-wider">Secure Login</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Security badges */}
          <div className="flex justify-center gap-4 mb-8">
            {['🔒 SSL Secured', '🛡️ JWT Auth', '✅ Encrypted'].map(badge => (
              <span key={badge} className="text-xs text-gray-600 font-medium">{badge}</span>
            ))}
          </div>

          {/* Register */}
          <p className="text-center text-gray-600 text-sm">
            Need an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Register here →
            </Link>
          </p>

          {/* Copyright */}
          <p className="text-center text-gray-800 text-xs mt-8">
            © 2026 EMS — Employee Management System
          </p>
        </div>
      </div>
    </div>
  )
}