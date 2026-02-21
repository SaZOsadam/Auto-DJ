import { useState } from 'react'
import Navbar from '../components/Navbar'
import { getSettings, saveSettings } from '../services/storage'

export default function Settings() {
  const [settings, setSettings] = useState(() => getSettings())
  const [message, setMessage] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setMessage('')
    saveSettings(settings)
    setMessage('Settings saved.')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-gray-400">Configure how AutoDJ rotates between your playlists.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-1">Rotation Mode</h2>
            <p className="text-gray-400 text-sm mb-4">Choose when AutoDJ should switch to the next playlist.</p>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${settings.rotation_mode === 'playlist_end' ? 'border-green-500 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}>
                <input type="radio" name="mode" value="playlist_end" checked={settings.rotation_mode === 'playlist_end'} onChange={(e) => setSettings({ ...settings, rotation_mode: e.target.value })} className="mt-1 accent-green-500" />
                <div>
                  <p className="font-medium text-white">Playlist End</p>
                  <p className="text-gray-400 text-sm">Switch to the next playlist when the current one finishes playing.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${settings.rotation_mode === 'interval' ? 'border-green-500 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}>
                <input type="radio" name="mode" value="interval" checked={settings.rotation_mode === 'interval'} onChange={(e) => setSettings({ ...settings, rotation_mode: e.target.value })} className="mt-1 accent-green-500" />
                <div>
                  <p className="font-medium text-white">Timed Interval</p>
                  <p className="text-gray-400 text-sm">Switch to the next playlist after a set number of minutes.</p>
                </div>
              </label>
            </div>
          </div>

          {settings.rotation_mode === 'interval' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-1">Interval Duration</h2>
              <p className="text-gray-400 text-sm mb-4">How many minutes before switching to the next playlist?</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={settings.interval_minutes}
                  onChange={(e) => setSettings({ ...settings, interval_minutes: parseInt(e.target.value) || 1 })}
                  className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
                <span className="text-gray-400">minutes</span>
              </div>
            </div>
          )}

          {message && (
            <p className={`text-sm ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  )
}
