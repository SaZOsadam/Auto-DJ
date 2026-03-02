import { useState } from 'react'
import { getTopSongs, getTopPlaylists, getStats, clearStats } from '../services/storage'

export default function Stats() {
  const [topSongs, setTopSongs] = useState(() => getTopSongs(50))
  const [topPlaylists, setTopPlaylists] = useState(() => getTopPlaylists(50))
  const [tab, setTab] = useState('songs')
  const stats = getStats()
  const totalSongPlays = Object.values(stats.songs).reduce((sum, s) => sum + s.count, 0)
  const totalPlaylistPlays = Object.values(stats.playlists).reduce((sum, p) => sum + p.count, 0)

  const handleClear = () => {
    if (window.confirm('Clear all play stats? This cannot be undone.')) {
      clearStats()
      setTopSongs([])
      setTopPlaylists([])
    }
  }

  const formatDate = (iso) => {
    if (!iso) return 'Never'
    const d = new Date(iso)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Play Stats</h1>
            <p className="text-gray-400 text-sm sm:text-base">Track how often your playlists and songs are played.</p>
          </div>
          <button
            onClick={handleClear}
            className="text-red-400 hover:text-red-300 active:bg-red-500/20 text-sm px-3 py-2 rounded border border-red-500/30 hover:bg-red-500/10 transition-colors flex-shrink-0 self-start sm:self-auto"
          >
            Clear Stats
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-400">{totalSongPlays}</p>
            <p className="text-gray-400 text-xs mt-1">Total Song Plays</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-400">{totalPlaylistPlays}</p>
            <p className="text-gray-400 text-xs mt-1">Total Playlist Plays</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-400">{Object.keys(stats.songs).length}</p>
            <p className="text-gray-400 text-xs mt-1">Unique Songs</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-400">{Object.keys(stats.playlists).length}</p>
            <p className="text-gray-400 text-xs mt-1">Unique Playlists</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setTab('songs')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tab === 'songs' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Songs
          </button>
          <button
            onClick={() => setTab('playlists')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tab === 'playlists' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Playlists
          </button>
        </div>

        {/* Song List */}
        {tab === 'songs' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {topSongs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-1">No song data yet</p>
                <p className="text-sm">Start a rotation and play some music to see stats here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {topSongs.map((song, i) => (
                  <div key={song.uri} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-gray-700/50 transition-colors">
                    <span className={`w-6 sm:w-8 text-right text-xs sm:text-sm font-mono flex-shrink-0 ${
                      i < 3 ? 'text-yellow-400 font-bold' : 'text-gray-500'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate text-sm sm:text-base">{song.name || 'Unknown Track'}</p>
                      <p className="text-gray-400 text-xs truncate">{song.artist || 'Unknown Artist'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-green-400 font-semibold text-sm">{song.count}x</p>
                      <p className="text-gray-500 text-xs hidden sm:block">{formatDate(song.lastPlayed)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Playlist List */}
        {tab === 'playlists' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {topPlaylists.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-1">No playlist data yet</p>
                <p className="text-sm">Start a rotation to see playlist play counts here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {topPlaylists.map((pl, i) => (
                  <div key={pl.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-gray-700/50 transition-colors">
                    <span className={`w-6 sm:w-8 text-right text-xs sm:text-sm font-mono flex-shrink-0 ${
                      i < 3 ? 'text-yellow-400 font-bold' : 'text-gray-500'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate text-sm sm:text-base">{pl.name || 'Unknown Playlist'}</p>
                      <a
                        href={`https://open.spotify.com/playlist/${pl.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 text-xs hover:underline"
                      >
                        Open in Spotify
                      </a>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-400 font-semibold text-sm">{pl.count}x</p>
                      <p className="text-gray-500 text-xs hidden sm:block">{formatDate(pl.lastPlayed)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
  )
}
