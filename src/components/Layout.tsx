import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Bell,
  Menu,
  X,
} from 'lucide-react'
import { SearchBar } from './SearchBar'
import { useState } from 'react'
import { TaskModal } from './TaskModal'

export function Layout() {
  const { user, signOut } = useAuth()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="p-4 lg:p-6 border-b border-surface-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-serif font-medium text-surface-900">TaskFlow</h1>
              <p className="text-xs text-surface-500 font-sans mt-1">AI Task Management</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden btn btn-ghost p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="p-4">
          <button
            onClick={() => {
              setIsTaskModalOpen(true)
              setIsMobileMenuOpen(false)
            }}
            className="btn btn-primary w-full justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `nav-link font-sans text-sm ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-surface-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-700 font-medium font-sans">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-surface-500 truncate font-sans">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-ghost w-full justify-start text-surface-600 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden btn btn-ghost p-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost p-2 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <Outlet />
      </main>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  )
}

