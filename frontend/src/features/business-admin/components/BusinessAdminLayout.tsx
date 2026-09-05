import { Outlet, useLocation } from 'react-router-dom'

export function BusinessAdminLayout() {
  const location = useLocation()
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 lg:p-8 max-w-5xl animate-page-enter" key={location.pathname}>
        <Outlet />
      </div>
    </div>
  )
}
