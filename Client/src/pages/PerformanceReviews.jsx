import { useState, useEffect } from 'react'
import { getEmployees, getAllReviews, createReview, deleteReview, getPerformanceStats } from '../services/api'
import { useRole } from '../hooks/useRole'

// Star Rating Component
function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`text-2xl transition-all duration-150 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <span className={`${(hover || value) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

// Score Badge
function ScoreBadge({ score }) {
  const getColor = (s) => {
    if (s >= 4.5) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (s >= 3.5) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    if (s >= 2.5) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }

  const getLabel = (s) => {
    if (s >= 4.5) return 'Excellent'
    if (s >= 3.5) return 'Good'
    if (s >= 2.5) return 'Average'
    return 'Poor'
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getColor(score)}`}>
      {getLabel(score)}
    </span>
  )
}

// Render Stars Helper
function renderStars(score) {
  const full = Math.round(score)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

export default function PerformanceReviews() {
  const [employees, setEmployees] = useState([])
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('reviews')
  const [selectedReview, setSelectedReview] = useState(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    period: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
    ratings: {
      productivity: 3,
      communication: 3,
      teamwork: 3,
      leadership: 3,
      punctuality: 3,
    },
    feedback: '',
    strengths: '',
    improvements: ''
  })
  const { isAdmin, canEdit } = useRole()

  useEffect(() => {
    fetchAll()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchAll = async () => {
    try {
      const [empRes, reviewRes, statsRes] = await Promise.all([
        getEmployees(),
        getAllReviews(),
        getPerformanceStats()
      ])
      setEmployees(empRes.data)
      setReviews(reviewRes.data)
      setStats(statsRes.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createReview(formData)
      setShowForm(false)
      setFormData({
        employeeId: '',
        period: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
        ratings: { productivity: 3, communication: 3, teamwork: 3, leadership: 3, punctuality: 3 },
        feedback: '',
        strengths: '',
        improvements: ''
      })
      fetchAll()
    } catch (err) {
      console.log(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(id)
      fetchAll()
    } catch (err) {
      console.log(err)
    }
  }

  const categories = [
    { key: 'productivity', label: 'Productivity', icon: '⚡' },
    { key: 'communication', label: 'Communication', icon: '💬' },
    { key: 'teamwork', label: 'Teamwork', icon: '🤝' },
    { key: 'leadership', label: 'Leadership', icon: '🎯' },
    { key: 'punctuality', label: 'Punctuality', icon: '⏰' },
  ]

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading performance reviews...</p>
    </div>
  )

  return (
    <div
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Performance Reviews
            <span className="ml-3 text-sm font-semibold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full">
              {reviews.length} reviews
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and evaluate employee performance</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-lg">{showForm ? '✕' : '⭐'}</span>
            <span className="relative z-10">{showForm ? 'Cancel' : 'Add Review'}</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reviews', value: stats?.totalReviews || 0, icon: '📋', color: 'from-blue-500 to-indigo-500' },
          { label: 'Avg Score', value: stats?.avgOverallScore || 0, icon: '⭐', color: 'from-yellow-400 to-orange-500' },
          { label: 'Excellent', value: stats?.distribution?.excellent || 0, icon: '🏆', color: 'from-green-400 to-emerald-500' },
          { label: 'Need Improvement', value: stats?.distribution?.poor || 0, icon: '📈', color: 'from-red-400 to-rose-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full translate-x-6 -translate-y-6`} />
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Review Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">⭐ New Performance Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Review Period</label>
                <input
                  type="text"
                  placeholder="e.g. Q1 2026"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Rating Categories */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 mb-6">
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Rate Each Category</h4>
              <div className="space-y-4">
                {categories.map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating
                        value={formData.ratings[key]}
                        onChange={(val) => setFormData({
                          ...formData,
                          ratings: { ...formData.ratings, [key]: val }
                        })}
                      />
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-4">
                        {formData.ratings[key]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall preview */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <span className="font-black text-gray-800 dark:text-white">Overall Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-yellow-500">
                    {(Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1)}
                  </span>
                  <span className="text-yellow-400 text-lg">
                    {renderStars(Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 5)}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Overall Feedback</label>
                <textarea
                  placeholder="Write overall performance feedback..."
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white resize-none transition-all"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">💪 Strengths</label>
                  <textarea
                    placeholder="Key strengths..."
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white resize-none transition-all"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">📈 Areas to Improve</label>
                  <textarea
                    placeholder="Areas for improvement..."
                    value={formData.improvements}
                    onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-white resize-none transition-all"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 transition-all duration-300"
            >
              ⭐ Submit Review
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: 'reviews', label: 'All Reviews', icon: '📋' },
          { id: 'top', label: 'Top Performers', icon: '🏆' },
          { id: 'distribution', label: 'Score Distribution', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-yellow-600 dark:text-yellow-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── ALL REVIEWS TAB ── */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-gray-700 dark:text-gray-300 font-bold text-xl mb-2">No reviews yet</p>
              <p className="text-gray-400">Click "Add Review" to create the first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedReview(selectedReview?._id === review._id ? null : review)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                        {review.employee?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-gray-800 dark:text-white">{review.employee?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{review.employee?.department} • {review.employee?.position}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Period: {review.period} • Reviewed by {review.reviewedBy?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-2xl font-black text-yellow-500">{review.overallScore}</span>
                          <span className="text-yellow-400">⭐</span>
                        </div>
                        <ScoreBadge score={review.overallScore} />
                      </div>
                      {isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(review._id) }}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 hover:scale-110 transition-all duration-200"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded view */}
                  {selectedReview?._id === review._id && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                      {/* Category ratings */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {categories.map(({ key, label, icon }) => (
                          <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                            <p className="text-xl mb-1">{icon}</p>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{label}</p>
                            <div className="flex justify-center">
                              <StarRating value={review.ratings[key]} readonly />
                            </div>
                            <p className="text-lg font-black text-yellow-500 mt-1">{review.ratings[key]}</p>
                          </div>
                        ))}
                      </div>

                      {/* Feedback sections */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                          <p className="font-bold text-blue-700 dark:text-blue-400 text-sm mb-2">📝 Overall Feedback</p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{review.feedback}</p>
                        </div>
                        {review.strengths && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                            <p className="font-bold text-green-700 dark:text-green-400 text-sm mb-2">💪 Strengths</p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{review.strengths}</p>
                          </div>
                        )}
                        {review.improvements && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                            <p className="font-bold text-orange-700 dark:text-orange-400 text-sm mb-2">📈 Areas to Improve</p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{review.improvements}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TOP PERFORMERS TAB ── */}
      {activeTab === 'top' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">🏆 Top Performers</h3>
          {!stats?.topPerformers?.length ? (
            <p className="text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {stats.topPerformers.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                    i === 0 ? 'bg-yellow-100 text-yellow-600' :
                    i === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black">
                    {item.employee?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 dark:text-white">{item.employee?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.employee?.department} • {item.employee?.position}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-2xl font-black text-yellow-500">{item.avgScore}</span>
                      <span className="text-yellow-400 text-lg">⭐</span>
                    </div>
                    <ScoreBadge score={item.avgScore} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SCORE DISTRIBUTION TAB ── */}
      {activeTab === 'distribution' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">📊 Score Distribution</h3>
          <div className="space-y-5">
            {[
              { label: 'Excellent (4.5 - 5.0)', value: stats?.distribution?.excellent || 0, color: 'from-green-400 to-emerald-500', stars: '★★★★★' },
              { label: 'Good (3.5 - 4.4)', value: stats?.distribution?.good || 0, color: 'from-blue-400 to-indigo-500', stars: '★★★★☆' },
              { label: 'Average (2.5 - 3.4)', value: stats?.distribution?.average || 0, color: 'from-yellow-400 to-amber-500', stars: '★★★☆☆' },
              { label: 'Poor (1.0 - 2.4)', value: stats?.distribution?.poor || 0, color: 'from-red-400 to-rose-500', stars: '★★☆☆☆' },
            ].map(({ label, value, color, stars }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">{stars}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{value} reviews</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
                    style={{ width: stats?.totalReviews > 0 ? `${(value / stats.totalReviews) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overall avg */}
          <div className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white text-center">
            <p className="text-yellow-100 text-sm font-medium mb-1">Company Average Score</p>
            <p className="text-5xl font-black">{stats?.avgOverallScore || 0}</p>
            <div className="flex justify-center mt-2">
              <span className="text-2xl">{renderStars(stats?.avgOverallScore || 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}