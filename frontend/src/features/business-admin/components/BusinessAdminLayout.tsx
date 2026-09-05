import { Outlet } from 'react-router-dom'

export function BusinessAdminLayout() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 lg:p-8 max-w-5xl">
        <Outlet />
      </div>
    </div>
  )
}
