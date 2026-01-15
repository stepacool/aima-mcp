import { Link } from '@tanstack/react-router'


import { useState } from 'react'
import { Home, LogOut, Menu, Server, X } from 'lucide-react'
import ParaglideLocaleSwitcher from './LocaleSwitcher.tsx'
import { authClient, getUserProfileFromSession } from '@/lib/auth-client'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = authClient.useSession()
  const userProfile = getUserProfileFromSession(session)

  async function handleLogout() {
    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">AutoMCP</Link>
          </h1>
        </div>

        {userProfile && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              {userProfile.name && (
                <span className="text-white font-medium">{userProfile.name}</span>
              )}
              <span className="text-slate-300">{userProfile.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">New Server</span>
          </Link>
          <Link
            to="/servers"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Server size={20} />
            <span className="font-medium">My Servers</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700 bg-gray-800 flex flex-col gap-2">
          <ParaglideLocaleSwitcher />
        </div>
      </aside>
    </>
  )
}
