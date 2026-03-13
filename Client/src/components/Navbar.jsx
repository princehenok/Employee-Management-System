import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/employees', label: 'Employees', icon: '👥' },
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  ]

  const formatTime = (date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-blue-500/10'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-white text-lg font-black">E</span>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 text-white text-lg font-black">E</span>
              </div>
              <div>
                <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  EM<span className="text-blue-600">S</span>
                </span>
                <p className="text-xs text-gray-400 dark:text-gray-500 -mt-1 font-medium">Management System</p>
              </div>
            </Link>

            {/* Nav Links — Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon }) => {
                const isActive = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <span className="text-base group-hover:scale-125 transition-transform duration-300">{icon}</span>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">

              {/* Live Clock */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 text-center border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 leading-none">
                  {formatTime(time)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5">
                  {formatDate(time)}
                </p>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative w-14 h-7 rounded-full transition-all duration-500 focus:outline-none shadow-inner overflow-hidden"
                style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, #1e3a5f, #312e81)'
                    : 'linear-gradient(135deg, #bfdbfe, #93c5fd)'
                }}
              >
                <div
                  className="absolute top-0.5 w-6 h-6 rounded-full shadow-lg flex items-center justify-center text-sm transition-all duration-500"
                  style={{
                    left: darkMode ? 'calc(100% - 26px)' : '2px',
                    background: darkMode
                      ? 'linear-gradient(135deg, #1e40af, #4f46e5)'
                      : 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  }}
                >
                  {darkMode ? '🌙' : '☀️'}
                </div>
              </button>

              {/* User Avatar + Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-sm font-black">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">{user?.name}</span>
                  <span className="text-xs opacity-70">▾</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                      ● Online
                    </span>
                  </div>
                  <div className="p-2">
                    {navLinks.map(({ to, label, icon }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                      >
                        <span>{icon}</span>
                        {label}
                      </Link>
                    ))}
                    <hr className="my-2 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="px-6 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-3">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === to
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <span>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}