import { Outlet, useLocation } from 'react-router-dom'

export function BusinessAdminLayout() {
  const location = useLocation()
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3.5 sm:p-5 lg:p-6 max-w-[1600px] mx-auto animate-page-enter" key={location.pathname}>
        <Outlet />
      </div>
    </div>
  )
}
