import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />
  }

  return <Outlet />
}

export function RoleRoute({
  allowedRoles,
  requiredPermissions,
}: {
  allowedRoles?: import('@/types/auth').AuthRole[]
  requiredPermissions?: string[]
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  if (!user) {
    return <Navigate to="/403" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPerms = user.permissions || []
    const hasAll = userPerms.includes('*') || requiredPermissions.every((p) => userPerms.includes(p))
    if (!hasAll) {
      return <Navigate to="/403" replace />
    }
  }

  return <Outlet />
}
