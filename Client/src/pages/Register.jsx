import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

      const gridSize = 40
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.07)'
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

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const dist = Math.sin(time + x * 0.01 + y * 0.01) * 0.5 + 0.5
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(99, 102, 241, ${dist * 0.4})`
          ctx.fill()
        }
      }

      const scanY = ((time * 100) % (canvas.height + 200)) - 100
      const gradient = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40)
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0)')
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)')
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      login(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = formData.password
    if (p.length === 0) return null
    if (p.length < 4) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', text: 'text-red-400' }
    if (p.length < 6) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4', text: 'text-yellow-400' }
    if (p.length < 10) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4', text: 'text-blue-400' }
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full', text: 'text-green-400' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex bg-gray-950">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gray-900">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-black text-lg">E</span>
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">EM<span className="text-indigo-400">S</span></p>
              <p className="text-gray-500 text-xs">Management System</p>
            </div>
          </div>

          {/* Center */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              Join Your Organization
            </div>
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Start Managing
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Your Team
              </span>
              <br />
              Today
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Create your account and get instant access to powerful HR tools designed for modern organizations.
            </p>

            {/* Features */}
            <div className="space-y-3 mt-10">
              {[
                { icon: '⚡', text: 'Instant access after registration' },
                { icon: '🔒', text: 'Enterprise-grade security' },
                { icon: '📊', text: 'Real-time analytics dashboard' },
                { icon: '👥', text: 'Full employee lifecycle management' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-sm">
                    {icon}
                  </div>
                  <span className="text-gray-400 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-gray-700 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign in here →
            </Link>
          </p>
        </div>

        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent" />
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">E</span>
            </div>
            <p className="text-white font-black text-lg">EM<span className="text-indigo-400">S</span></p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-black text-white mb-2">Create Account</h2>
            <p className="text-gray-500">Set up your EMS account in seconds</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className={`relative rounded-xl border transition-all duration-300 ${
                focusedField === 'name'
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'border-gray-800'
              }`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">👤</div>
                <input
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-900 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className={`relative rounded-xl border transition-all duration-300 ${
                focusedField === 'email'
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
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
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-900 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className={`relative rounded-xl border transition-all duration-300 ${
                focusedField === 'password'
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'border-gray-800'
              }`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔐</div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-900 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
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
              {/* Password strength */}
              {strength && (
                <div className="mt-2">
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                  <p className={`text-xs font-semibold mt-1 ${strength.text}`}>{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className={`relative rounded-xl border transition-all duration-300 ${
                focusedField === 'confirm'
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-500/50'
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-500/50'
                  : 'border-gray-800'
              }`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔒</div>
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-900 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors text-sm"
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs font-semibold mt-1 ${
                  formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formData.password === formData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mt-2"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-700 text-xs font-medium uppercase tracking-wider">Secure Registration</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Security badges */}
          <div className="flex justify-center gap-4 mb-6">
            {['🔒 SSL Secured', '🛡️ JWT Auth', '✅ Encrypted'].map(badge => (
              <span key={badge} className="text-xs text-gray-600 font-medium">{badge}</span>
            ))}
          </div>

          {/* Login link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              Sign in →
            </Link>
          </p>

          <p className="text-center text-gray-800 text-xs mt-6">
            © 2026 EMS — Employee Management System
          </p>
        </div>
      </div>
    </div>
  )
}