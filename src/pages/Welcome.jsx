import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-3">AutoDJ</h1>
        <p className="text-gray-400 mb-8 text-lg">Automatically rotate between your Spotify playlists. Set it and forget it.</p>

        <Link
          to="/dashboard"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-10 rounded-full text-lg transition-colors mb-10 w-full sm:w-auto text-center"
        >
          Get Started
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-green-400 font-semibold mb-1">Add Playlists</p>
            <p className="text-gray-400 text-sm">Paste your Spotify playlist links and build your rotation queue.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-green-400 font-semibold mb-1">Set Schedule</p>
            <p className="text-gray-400 text-sm">Choose to switch by time interval or when a playlist ends.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-green-400 font-semibold mb-1">Auto Rotate</p>
            <p className="text-gray-400 text-sm">AutoDJ switches your playback automatically in the background.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
