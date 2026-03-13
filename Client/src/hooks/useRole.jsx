import { useAuth } from '../context/AuthContext'

export function useRole() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'
  const isHRManager = user?.role === 'hr_manager'
  const isViewer = user?.role === 'viewer'
  const canEdit = isAdmin || isHRManager
  const canDelete = isAdmin

  return { isAdmin, isHRManager, isViewer, canEdit, canDelete, role: user?.role }
}