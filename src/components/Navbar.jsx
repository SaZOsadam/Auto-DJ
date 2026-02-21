import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`transition-colors ${pathname === to ? 'text-green-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-green-400">AutoDJ</Link>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/playlists', 'Playlists')}
          {navLink('/settings', 'Settings')}
          {navLink('/rotation', 'Rotation')}
        </div>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-700 px-4 py-3 flex flex-col gap-3">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/playlists', 'Playlists')}
          {navLink('/settings', 'Settings')}
          {navLink('/rotation', 'Rotation')}
        </div>
      )}
    </nav>
  )
}
