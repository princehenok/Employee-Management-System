import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

// Floating particle background
function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      icon: ['👤', '📋', '💼', '📊', '🏢', '✅'][Math.floor(Math.random() * 6)]
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 1
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
      })

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`
        ctx.fill()

        // Move
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// Animated counter
function Counter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true)
        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= target) {
            setCount(target)
            clearInterval(timer)
          } else {
            setCount(Math.floor(start))
          }
        }, 16)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, started])

  return <span ref={ref}>{count}</span>
}

// Feature card with hover effect
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h4 className="font-bold text-gray-800 dark:text-white mb-2 text-lg">{title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-500" />
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const features = [
    { icon: '➕', title: 'Add Employees', desc: 'Quickly onboard new team members with all their details in seconds' },
    { icon: '✏️', title: 'Edit Records', desc: 'Update employee information anytime with instant changes' },
    { icon: '🔍', title: 'Search & Filter', desc: 'Find any employee instantly by name, department or status' },
    { icon: '📥', title: 'Export to CSV', desc: 'Download complete employee data for reporting and analysis' },
    { icon: '📄', title: 'Employee Profiles', desc: 'View rich detailed profiles for every team member' },
    { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication keeps your sensitive data protected' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      {/* Hero Section */}
      <div
        className="relative z-10 text-center py-24 px-4 transition-all duration-1000"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)'
        }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-5 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          👋 Welcome back, {user?.name}!
        </div>

        {/* Headline */}
        <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Manage Your Team
          <br />
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
              Like a Pro
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#9333ea"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        <p className="text-gray-500 dark:text-gray-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          A powerful, all-in-one platform to add, track, and analyze your employees — built for modern teams.
        </p>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/employees"
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">View Employees →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link
            to="/dashboard"
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            📊 Dashboard
          </Link>
        </div>
      </div>

      {/* Animated Stats */}
      <div
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 px-4 transition-all duration-1000 delay-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)'
        }}
      >
        {[
          { label: 'Employees Tracked', value: 1200, suffix: '+', color: 'text-blue-600' },
          { label: 'Departments', value: 24, suffix: '', color: 'text-green-600' },
          { label: 'Data Points', value: 99, suffix: '%', color: 'text-purple-600' },
          { label: 'Uptime', value: 100, suffix: '%', color: 'text-orange-500' },
        ].map(({ label, value, suffix, color }) => (
          <div key={label} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <p className={`text-4xl font-black ${color} mb-1`}>
              <Counter target={value} />{suffix}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div
        className="relative z-10 mb-16 px-4 transition-all duration-1000 delay-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)'
        }}
      >
        <h2 className="text-3xl font-black text-gray-800 dark:text-white text-center mb-3">
          Everything your team needs
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10">
          Powerful features to keep your workforce organized
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 100} />
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div
        className="relative z-10 mb-8 px-4 transition-all duration-1000 delay-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)'
        }}
      >
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white overflow-hidden shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-20 translate-y-20" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-4xl font-black mb-3">Ready to take control?</h2>
            <p className="text-blue-100 mb-8 text-lg max-w-lg mx-auto">
              Start managing your employees smarter and faster today
            </p>
            <Link
              to="/employees"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Get Started Now →
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}