import { useState } from 'react'
import { getPlaylists, getStats, getTopSongs, getTopPlaylists } from '../services/storage'

export default function Admin() {
  const [tab, setTab] = useState('playlists')
  const playlists = getPlaylists()
  const stats = getStats()
  const topSongs = getTopSongs(10)
  const topPlaylists = getTopPlaylists(10)
  const totalSongPlays = Object.values(stats.songs).reduce((sum, s) => sum + s.count, 0)
  const totalPlaylistPlays = Object.values(stats.playlists).reduce((sum, p) => sum + p.count, 0)
  const uniqueTracks = Object.keys(stats.songs).length

  const tabs = [
    { id: 'playlists', label: 'Default Playlists' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'analytics', label: 'User Analytics' },
    { id: 'ratings', label: 'App Ratings' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-1 rounded">ADMIN</span>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      <p className="text-gray-400 mb-6">Manage playlists, recommendations, and monitor user activity.</p>

      <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
        <p className="text-yellow-400 text-sm">This is a preview of the admin panel. Full functionality (cloud database, user management) will be available after backend integration.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Default Playlists Tab */}
      {tab === 'playlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Default Playlists ({playlists.length})</h2>
            <button disabled className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg opacity-60 cursor-not-allowed">
              + Add Default Playlist
            </button>
          </div>
          {/* Mobile: card layout */}
          <div className="sm:hidden space-y-3">
            {playlists.map((pl, i) => (
              <div key={pl.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{pl.name}</p>
                    <p className="text-gray-500 font-mono text-xs truncate mt-1">{pl.playlist_id}</p>
                  </div>
                  <span className="text-gray-500 text-xs flex-shrink-0">#{i + 1}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${pl.source === 'default' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600 text-gray-300'}`}>
                    {pl.source || 'user'}
                  </span>
                  <div className="flex gap-3">
                    <button disabled className="text-gray-500 text-xs cursor-not-allowed">Edit</button>
                    <button disabled className="text-gray-500 text-xs cursor-not-allowed">Remove</button>
                  </div>
                </div>
              </div>
            ))}
            {playlists.length === 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center text-gray-500">No playlists found</div>
            )}
          </div>
          {/* Desktop: table layout */}
          <div className="hidden sm:block bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Playlist ID</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((pl, i) => (
                  <tr key={pl.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{pl.name}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{pl.playlist_id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${pl.source === 'default' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600 text-gray-300'}`}>
                        {pl.source || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button disabled className="text-gray-500 hover:text-white text-xs mr-3 cursor-not-allowed">Edit</button>
                      <button disabled className="text-gray-500 hover:text-red-400 text-xs cursor-not-allowed">Remove</button>
                    </td>
                  </tr>
                ))}
                {playlists.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No playlists found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {tab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Special Recommendation Playlists</h2>
            <button disabled className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg opacity-60 cursor-not-allowed">
              + Add Recommendation
            </button>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Curated Recommendations</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
              Add special playlists that you recommend to all users. These will appear as featured playlists in the app.
            </p>
            <p className="text-yellow-400 text-sm">Requires backend integration — coming soon.</p>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">User Activity (Local Data)</h2>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Total Song Plays</p>
              <p className="text-2xl font-bold text-green-400">{totalSongPlays}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Unique Tracks</p>
              <p className="text-2xl font-bold text-blue-400">{uniqueTracks}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Playlist Plays</p>
              <p className="text-2xl font-bold text-purple-400">{totalPlaylistPlays}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Active Playlists</p>
              <p className="text-2xl font-bold text-yellow-400">{playlists.length}</p>
            </div>
          </div>

          {/* Top songs */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="font-semibold">Top Tracks by Play Count</h3>
            </div>
            {topSongs.length > 0 ? (
              <div className="divide-y divide-gray-700/50">
                {topSongs.map((song, i) => (
                  <div key={song.uri} className="px-4 py-3 flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{song.name || 'Unknown Track'}</p>
                      <p className="text-gray-500 text-xs truncate">{song.artist || 'Unknown Artist'}</p>
                    </div>
                    <span className="text-green-400 font-semibold text-sm">{song.count} plays</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">No play data yet</div>
            )}
          </div>

          {/* Top playlists */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="font-semibold">Top Playlists by Play Count</h3>
            </div>
            {topPlaylists.length > 0 ? (
              <div className="divide-y divide-gray-700/50">
                {topPlaylists.map((pl, i) => (
                  <div key={pl.id} className="px-4 py-3 flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{pl.name || 'Unknown Playlist'}</p>
                      <p className="text-gray-500 text-xs">{pl.lastPlayed ? `Last played: ${new Date(pl.lastPlayed).toLocaleDateString()}` : ''}</p>
                    </div>
                    <span className="text-blue-400 font-semibold text-sm">{pl.count} plays</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">No play data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Ratings Tab */}
      {tab === 'ratings' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">App Ratings & Feedback</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">User Ratings</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
              Once user accounts are enabled, you'll be able to see app ratings, feedback, and feature requests from users here.
            </p>

            {/* Placeholder rating display */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-8 h-8 ${star <= 4 ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-500 text-sm">4.0 / 5.0 (placeholder)</p>

            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <p className="text-yellow-400 text-sm">Requires backend integration — coming soon.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
