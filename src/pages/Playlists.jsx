import { useState } from 'react'
import Navbar from '../components/Navbar'
import PlaylistCard from '../components/PlaylistCard'
import { getPlaylists, savePlaylists, loadDefaultPlaylists, parsePlaylistId } from '../services/storage'

export default function Playlists() {
  const [playlists, setPlaylists] = useState(() => getPlaylists())
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [defaultsMsg, setDefaultsMsg] = useState('')

  const handleLoadDefaults = () => {
    setDefaultsMsg('')
    setError('')
    const result = loadDefaultPlaylists()
    setPlaylists(result.playlists)
    setDefaultsMsg(result.added > 0 ? `Added ${result.added} default playlist(s)!` : 'Default playlists already added.')
  }

  const handleAddPlaylist = (e) => {
    e.preventDefault()
    setError('')
    const playlistId = parsePlaylistId(link)
    if (!playlistId) {
      setError('Invalid Spotify playlist URL or URI. Please check the format.')
      return
    }
    const existing = getPlaylists()
    if (existing.some(p => p.playlist_id === playlistId)) {
      setError('This playlist is already in your list.')
      return
    }
    const newPlaylist = {
      id: crypto.randomUUID(),
      playlist_id: playlistId,
      name: `Playlist ${playlistId.slice(0, 8)}...`,
      source: 'manual',
    }
    const updated = [...existing, newPlaylist]
    savePlaylists(updated)
    setPlaylists(updated)
    setLink('')
  }

  const handleDelete = (id) => {
    const updated = playlists.filter(p => p.id !== id)
    savePlaylists(updated)
    setPlaylists(updated)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Playlists</h1>
          <p className="text-gray-400">Add Spotify playlists for AutoDJ to rotate between. You need at least 2 playlists.</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add a Playlist</h2>
          <p className="text-gray-400 text-sm mb-3">
            Paste a Spotify playlist URL. Accepted formats:
          </p>
          <ul className="text-gray-500 text-sm mb-4 space-y-1 ml-4 list-disc">
            <li>https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M</li>
            <li>spotify:playlist:37i9dQZF1DXcBWIGoYBM5M</li>
          </ul>
          <form onSubmit={handleAddPlaylist} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Add Playlist
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>

        {/* Quick Start: Default Playlists */}
        {playlists.length === 0 && (
          <div className="bg-gradient-to-r from-green-900/40 to-gray-800 rounded-lg p-6 border border-green-700/50 mb-6">
            <h2 className="text-lg font-semibold mb-2">Don't have playlists in mind?</h2>
            <p className="text-gray-400 text-sm mb-4">
              Load 3 built-in playlists (Top 50 Nigeria, B-CD Playlist, AutoDJ Today's Hit) and start rotating right away.
            </p>
            <button
              onClick={handleLoadDefaults}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Use Default Playlists
            </button>
          </div>
        )}

        {defaultsMsg && <p className="text-green-400 text-sm mb-4">{defaultsMsg}</p>}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">Your Playlists ({playlists.length})</h2>
          <div className="flex items-center gap-3">
            {playlists.length < 2 && playlists.length > 0 && (
              <span className="text-yellow-400 text-sm">Add {2 - playlists.length} more to enable rotation</span>
            )}
            {playlists.length > 0 && (
              <button
                onClick={handleLoadDefaults}
                className="text-green-400 hover:text-green-300 text-sm transition-colors"
              >
                + Add Defaults
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} onDelete={handleDelete} />
          ))}
          {playlists.length === 0 && !defaultsMsg && (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <p className="text-gray-400 text-lg mb-2">No playlists yet</p>
              <p className="text-gray-500 text-sm">Paste a Spotify playlist link above or use the default playlists to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
