import { Outlet, Link, useLocation } from 'react-router-dom'
import { useUISettings } from '@/stores'
import {
  LayoutDashboard,
  Target,
  Package,
  ListChecks,
  Bell,
  FileText,
  Users,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  TrendingUp,
  BarChart3,
  DollarSign,
  RefreshCcw,
} from 'lucide-react'
import { cn } from '@/utils'

const menuItems = [
  { path: '/dashboard', label: '经营大盘', icon: LayoutDashboard },
  { path: '/diagnostic', label: '五维诊断', icon: Target },
  { path: '/diagnostic/customer-flow', label: '客流诊断', icon: TrendingUp, parent: '/diagnostic' },
  { path: '/diagnostic/conversion', label: '转化诊断', icon: BarChart3, parent: '/diagnostic' },
  { path: '/diagnostic/avg-amount', label: '客单价诊断', icon: DollarSign, parent: '/diagnostic' },
  { path: '/diagnostic/repurchase', label: '复购诊断', icon: RefreshCcw, parent: '/diagnostic' },
  { path: '/diagnostic/profit', label: '利润诊断', icon: DollarSign, parent: '/diagnostic' },
  { path: '/products', label: '货品诊断', icon: Package },
  { path: '/tasks', label: '策略中心', icon: ListChecks },
  { path: '/alerts', label: '预警中心', icon: Bell },
  { path: '/reports', label: '报告中心', icon: FileText },
  { path: '/customers', label: '客户管理', icon: Users },
  { path: '/transactions', label: '交易记录', icon: Receipt },
  { path: '/settings', label: '系统设置', icon: Settings },
]

export function Layout() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUISettings()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-56',
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-800">门店诊断</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            const Icon = item.icon
            const isChild = !!item.parent

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isChild ? 'ml-6 text-xs' : '',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                <Icon className={cn('flex-shrink-0', isChild ? 'w-4 h-4' : 'w-5 h-5')} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">当前门店：示范店001</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
