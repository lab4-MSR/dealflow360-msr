import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/ui/sidebar'
import { Topbar } from '@/components/ui/topbar'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className="transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '240px' }}
      >
        <Topbar />
        <main className="p-6">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
