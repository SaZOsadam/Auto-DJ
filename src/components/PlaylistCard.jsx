export default function PlaylistCard({ playlist, onDelete }) {
  const spotifyUrl = `https://open.spotify.com/playlist/${playlist.playlist_id}`

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-green-400 text-lg">&#9835;</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{playlist.name || 'Untitled Playlist'}</p>
          <div className="flex items-center gap-2 text-sm">
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline truncate">
              Open in Spotify
            </a>
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(playlist.id)}
        className="text-red-400 hover:text-red-300 text-sm transition-colors flex-shrink-0 ml-4 px-3 py-1 rounded hover:bg-red-500/10"
      >
        Remove
      </button>
    </div>
  )
}
