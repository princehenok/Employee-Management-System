import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRole } from '../hooks/useRole'

export default function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth()
  const { isAdmin } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('#more-menu')) setMoreOpen(false)
      if (!e.target.closest('#profile-menu')) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

 const mainLinks = [
  { to: '/', label: 'Home' },
  { to: '/employees', label: 'Employees' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/payroll', label: 'Payroll' },
]

const moreLinks = [
  { to: '/attendance', label: 'Attendance', icon: '⏰' },
  { to: '/leaves', label: 'Leave Management', icon: '📅' },
  { to: '/performance', label: 'Performance', icon: '⭐' },
  ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: '👑' }] : []),
]
  const formatTime = (date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })

  const roleConfig = {
    admin: { gradient: 'from-yellow-500 to-orange-500', badge: '👑 Admin' },
    hr_manager: { gradient: 'from-blue-500 to-indigo-600', badge: '👔 HR Manager' },
    viewer: { gradient: 'from-gray-400 to-gray-500', badge: '👁️ Viewer' },
  }
  const role = roleConfig[user?.role] || roleConfig.viewer

  return (
    <nav className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${
      scrolled ? 'shadow-md dark:shadow-black/20' : 'border-b border-gray-100 dark:border-gray-800'
    }`}>

      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="container mx-auto px-6">
        <div className="flex items-center h-14 gap-8">

          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-sm font-black">E</span>
            </div>
            <span className="font-black text-gray-900 dark:text-white tracking-tight">
              EM<span className="text-blue-600">S</span>
            </span>
          </Link>

          {/* Main Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map(({ to, label }) => {
              const isActive = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </Link>
              )
            })}

            {/* More dropdown — separate state */}
            <div className="relative" id="more-menu">
              <button
                onClick={() => { setMoreOpen(!moreOpen); setProfileOpen(false) }}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  moreLinks.some(l => location.pathname === l.to)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                More
                <span className={`text-xs transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}>▾</span>
                {moreLinks.some(l => location.pathname === l.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>

              {moreOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                  {moreLinks.map(({ to, label, icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        location.pathname === to
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{icon}</span>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 ml-auto">

            {/* Clock */}
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200 leading-none">
                {formatTime(time)}
              </p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">
                {formatDate(time)}
              </p>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Profile dropdown — separate state */}
            <div className="relative" id="profile-menu">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setMoreOpen(false) }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${role.gradient} rounded-lg flex items-center justify-center text-white text-sm font-black shadow-sm`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-400 leading-none mt-0.5">{role.badge}</p>
                </div>
                <span className={`text-gray-400 text-xs transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">

                  {/* User info */}
                  <div className={`bg-gradient-to-r ${role.gradient} px-4 py-3`}>
                    <p className="font-bold text-white text-sm">{user?.name}</p>
                    <p className="text-white/70 text-xs">{user?.email}</p>
                    <span className="inline-block bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mt-1 font-medium">
                      {role.badge}
                    </span>
                  </div>

                  <div className="p-1.5">
                    {/* Dark mode toggle */}
                    <button
                      onClick={() => { toggleDarkMode(); setProfileOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      <span>{darkMode ? '☀️' : '🌙'}</span>
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile button */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">

          {/* User info */}
          <div className={`bg-gradient-to-r ${role.gradient} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white font-black">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{user?.name}</p>
                <p className="text-white/70 text-xs">{role.badge}</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="bg-white/20 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Clock mobile */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {formatTime(time)} • {formatDate(time)}
            </p>
          </div>

          {/* All links mobile */}
          <div className="p-3 space-y-0.5">
            {[...mainLinks, ...moreLinks].map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {icon && <span>{icon}</span>}
                {label}
                {location.pathname === to && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </Link>
            ))}

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <span>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}