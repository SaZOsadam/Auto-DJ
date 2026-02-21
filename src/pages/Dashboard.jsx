import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getPlaylists, getSettings, getRotationState } from '../services/storage'

export default function Dashboard() {
  const playlists = getPlaylists()
  const settings = getSettings()
  const rotation = getRotationState()

  const count = playlists.length
  const on = rotation.enabled && count >= 2
  const ready = count >= 2

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome to <span className="text-green-400">AutoDJ</span></h1>
          <p className="text-gray-400">Manage your automatic Spotify playlist rotation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Playlists</p>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-gray-500 text-xs mt-1">{ready ? 'Ready to rotate' : 'Add at least 2'}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Rotation</p>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${on ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-2xl font-bold">{on ? 'Active' : 'Off'}</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Mode</p>
            <p className="text-2xl font-bold capitalize">{settings.rotation_mode.replace('_', ' ')}</p>
            <p className="text-gray-500 text-xs mt-1">{settings.rotation_mode === 'interval' ? `Every ${settings.interval_minutes} min` : 'At playlist end'}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">How to use AutoDJ</h2>
          <div className="space-y-4">
            <Step num={1} done={count > 0} title="Add your playlists">
              Go to <Link to="/playlists" className="text-green-400 underline">Playlists</Link> and paste Spotify playlist URLs. Add at least 2 playlists so AutoDJ can rotate between them.
            </Step>
            <Step num={2} done={ready} title="Configure settings">
              Go to <Link to="/settings" className="text-green-400 underline">Settings</Link> to choose how rotation works: switch after a time interval, or when the current playlist ends.
            </Step>
            <Step num={3} done={on} title="Start rotation">
              Go to <Link to="/rotation" className="text-green-400 underline">Rotation</Link> and hit Start. AutoDJ will automatically switch your Spotify playback between your playlists.
            </Step>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/playlists" className="bg-green-600 hover:bg-green-700 rounded-lg p-4 text-center font-semibold transition-colors">+ Add Playlists</Link>
          <Link to="/settings" className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center font-semibold transition-colors">Edit Settings</Link>
          <Link to="/rotation" className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center font-semibold transition-colors">{on ? 'View Rotation' : 'Start Rotation'}</Link>
        </div>
      </div>
    </div>
  )
}

function Step({ num, done, title, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${done ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>{done ? '\u2713' : num}</span>
      <div>
        <p className={`font-medium ${done ? 'text-green-400' : 'text-white'}`}>{title}</p>
        <p className="text-gray-400 text-sm">{children}</p>
      </div>
    </div>
  )
}
