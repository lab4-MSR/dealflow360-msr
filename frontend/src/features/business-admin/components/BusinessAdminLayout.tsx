import { Outlet, useLocation } from 'react-router-dom'

export function BusinessAdminLayout() {
  const location = useLocation()
  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-page-enter" key={location.pathname}>
      <Outlet />
    </div>
  )
}
