export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-3xl font-bold mb-2">Profile</h1>
      <p className="text-gray-400 mb-8">Sign in to sync your playlists and settings across devices.</p>

      {/* Not signed in state */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">You're not signed in</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
          Sign in to save your rotation setup, sync across devices, and access personalized features.
        </p>

        {/* Google sign-in button */}
        <button
          disabled
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg mb-3 opacity-60 cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Email sign-in */}
        <div className="max-w-xs mx-auto">
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              disabled
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm opacity-60 cursor-not-allowed"
            />
            <input
              type="password"
              placeholder="Password"
              disabled
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm opacity-60 cursor-not-allowed"
            />
            <button
              disabled
              className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg opacity-60 cursor-not-allowed"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <p className="text-yellow-400 text-sm">Coming Soon — Sign-in and cloud sync will be available in a future update.</p>
        </div>
      </div>
    </div>
  )
}
